/*
  The paycheck math. A deliberately simple estimate, good for learning how a
  paycheck shrinks between "gross" and "take-home". Real withholding depends
  on the W-4, the state, the year, and more.
*/
import { FICA_RATE } from '../../lib/finance'

export type PayFrequency = 'weekly' | 'biweekly'

export const PERIODS_PER_YEAR: Record<PayFrequency, number> = { weekly: 52, biweekly: 26 }

/** Social Security: 6.2% of pay. */
export const SOCIAL_SECURITY_RATE = 0.062
/** Medicare: 1.45% of pay. Together with Social Security this is FICA (7.65%). */
export const MEDICARE_RATE = Math.round((FICA_RATE - SOCIAL_SECURITY_RATE) * 10000) / 10000

/**
  Approximate single-filer standard deduction: the chunk of yearly income the
  federal government doesn't tax at all. It changes every year.
*/
export const STANDARD_DEDUCTION = 15_000

/** Rough federal brackets on taxable income (after the standard deduction). */
export const BRACKETS: { upTo: number; rate: number }[] = [
  { upTo: 12_000, rate: 0.1 },
  { upTo: 48_000, rate: 0.12 },
  { upTo: Infinity, rate: 0.22 },
]

/** Above this, real brackets go higher than 22%, so the estimate gets extra rough. */
export const ROUGH_ABOVE = 100_000

export const LIMITS = { wageMax: 100, hoursMin: 1, hoursMax: 40, tipsMax: 2000, stateMax: 10 } as const

/** Turns anything weird (NaN, Infinity, negatives) into a safe number in range. */
export function clean(n: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, n))
}

/** Federal income tax for a whole year, from yearly gross pay. */
export function federalIncomeTax(annualGross: number): number {
  const taxable = Math.max(0, clean(annualGross) - STANDARD_DEDUCTION)
  let tax = 0
  let floor = 0
  for (const b of BRACKETS) {
    if (taxable <= floor) break
    const slice = Math.min(taxable, b.upTo) - floor
    tax += slice * b.rate
    floor = b.upTo
  }
  return tax
}

/** The highest bracket rate any of your income reaches (0 if you're under the deduction). */
export function topBracket(annualGross: number): number {
  const taxable = Math.max(0, clean(annualGross) - STANDARD_DEDUCTION)
  if (taxable <= 0) return 0
  return (BRACKETS.find((b) => taxable <= b.upTo) ?? BRACKETS[BRACKETS.length - 1]).rate
}

export interface Breakdown {
  /** Hourly pay (hours x wage). */
  wages: number
  tips: number
  /** wages + tips: what you earned before anything comes out. */
  gross: number
  socialSecurity: number
  medicare: number
  federal: number
  state: number
  /** Everything taken out. */
  taxes: number
  /** What actually lands in your account. */
  takeHome: number
}

export interface PaycheckInput {
  wage: number
  hoursPerWeek: number
  tipsPerWeek: number
  /** 0..10 (percent of gross). */
  stateRatePct: number
  frequency: PayFrequency
}

export interface PaycheckResult {
  perCheck: Breakdown
  perYear: Breakdown
  periods: number
  /** Hours worked in one pay period. */
  hoursPerCheck: number
  /** Take-home pay divided by hours worked. */
  realHourly: number
  /** Share of gross you keep, 0..1. */
  keepRate: number
  /** Yearly income after the standard deduction. */
  taxableIncome: number
  topBracket: number
}

const scale = (b: Breakdown, f: number): Breakdown => ({
  wages: b.wages * f,
  tips: b.tips * f,
  gross: b.gross * f,
  socialSecurity: b.socialSecurity * f,
  medicare: b.medicare * f,
  federal: b.federal * f,
  state: b.state * f,
  taxes: b.taxes * f,
  takeHome: b.takeHome * f,
})

/** Half-up rounding to cents (or whole dollars), nudged so 6.525 doesn't sneak down to 6.52. */
const roundMoney = (n: number, cents: boolean) => {
  const f = cents ? 100 : 1
  return Math.round(n * f + 1e-6) / f
}

/**
  Rounds every line like a real pay stub, then works out take-home from the
  rounded lines, so the stub always adds up (no missing pennies).
*/
export function roundBreakdown(b: Breakdown, cents = true): Breakdown {
  const r = (n: number) => roundMoney(n, cents)
  const wages = r(b.wages)
  const tips = r(b.tips)
  const gross = r(wages + tips)
  const socialSecurity = r(b.socialSecurity)
  const medicare = r(b.medicare)
  const federal = r(b.federal)
  const state = r(b.state)
  const taxes = r(socialSecurity + medicare + federal + state)
  return { wages, tips, gross, socialSecurity, medicare, federal, state, taxes, takeHome: Math.max(0, r(gross - taxes)) }
}

export function estimatePaycheck(input: PaycheckInput): PaycheckResult {
  const wage = clean(input.wage, 0, LIMITS.wageMax)
  const hours = clean(input.hoursPerWeek, 0, 80)
  const tipsWeek = clean(input.tipsPerWeek, 0, LIMITS.tipsMax)
  const stateRate = clean(input.stateRatePct, 0, LIMITS.stateMax) / 100
  const periods = PERIODS_PER_YEAR[input.frequency] ?? 52

  const wagesYear = wage * hours * 52
  const tipsYear = tipsWeek * 52
  const grossYear = wagesYear + tipsYear
  const socialSecurity = grossYear * SOCIAL_SECURITY_RATE
  const medicare = grossYear * MEDICARE_RATE
  const federal = federalIncomeTax(grossYear)
  const state = grossYear * stateRate
  const taxes = socialSecurity + medicare + federal + state
  const exactYear: Breakdown = {
    wages: wagesYear,
    tips: tipsYear,
    gross: grossYear,
    socialSecurity,
    medicare,
    federal,
    state,
    taxes,
    takeHome: Math.max(0, grossYear - taxes),
  }
  const perYear = roundBreakdown(exactYear)
  const perCheck = roundBreakdown(scale(exactYear, 1 / periods))
  const hoursPerCheck = (hours * 52) / periods
  return {
    perCheck,
    perYear,
    periods,
    hoursPerCheck,
    realHourly: hoursPerCheck > 0 ? perCheck.takeHome / hoursPerCheck : 0,
    keepRate: perYear.gross > 0 ? perYear.takeHome / perYear.gross : 1,
    taxableIncome: Math.max(0, grossYear - STANDARD_DEDUCTION),
    topBracket: topBracket(grossYear),
  }
}
