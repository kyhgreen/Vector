/*
  Growth Calculator: inputs, cleanup for old/odd saves, and every sentence
  the screen shows. No React in here, so it's easy to test.
*/
import { futureValue, growthByYear, yearsToDouble } from '../../lib/finance'
import { money, plural } from '../../lib/format'

export interface GrowthInputs {
  start: number
  monthly: number
  /** Yearly return in percent (7 means 7%). */
  rate: number
  years: number
}

/** Slider "stops" for the starting amount. Small steps down low, big steps up high. */
export const START_STOPS = [
  0, 10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000,
  7000, 7500, 8000, 9000, 10000,
]

/** Slider "stops" for the monthly add. */
export const MONTHLY_STOPS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 75, 80, 90, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500,
]

export const RATE = { min: 0, max: 12, step: 0.5 }
export const YEARS = { min: 1, max: 50 }

export interface Preset {
  name: string
  rate: number
}

export const PRESETS: Preset[] = [
  { name: 'Savings account', rate: 4 },
  { name: 'Stock market average', rate: 7 },
  { name: 'Cash at home', rate: 0 },
]

export const isOlder = (age: number) => age >= 15

/** Allowance-sized numbers for 11 to 14, first-job-sized numbers for 15 to 18. */
export function defaultsFor(age: number): GrowthInputs {
  return isOlder(age) ? { start: 500, monthly: 100, rate: 7, years: 30 } : { start: 100, monthly: 20, rate: 7, years: 20 }
}

const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Index of the stop closest to `v`. */
export function nearestStop(stops: number[], v: number): number {
  let best = 0
  for (let i = 1; i < stops.length; i++) if (Math.abs(stops[i] - v) < Math.abs(stops[best] - v)) best = i
  return best
}

/** Makes any saved value safe to use: in range, on a slider stop, never NaN. */
export function sanitize(raw: unknown, age: number): GrowthInputs {
  const d = defaultsFor(age)
  const r = raw && typeof raw === 'object' ? (raw as Partial<GrowthInputs>) : {}
  const start = finite(r.start) ? START_STOPS[nearestStop(START_STOPS, r.start)] : d.start
  const monthly = finite(r.monthly) ? MONTHLY_STOPS[nearestStop(MONTHLY_STOPS, r.monthly)] : d.monthly
  const rate = finite(r.rate) ? Math.round(clamp(r.rate, RATE.min, RATE.max) / RATE.step) * RATE.step : d.rate
  const years = finite(r.years) ? Math.round(clamp(r.years, YEARS.min, YEARS.max)) : d.years
  return { start, monthly, rate, years }
}

export interface GrowthResult {
  /** One value per year, starting with today (year 0). */
  contributedByYear: number[]
  balanceByYear: number[]
  total: number
  contributed: number
  growth: number
  /** 0..1: how much of the final total came from growth. */
  growthShare: number
}

const safe = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0)

export function calculate(i: GrowthInputs): GrowthResult {
  const rows = growthByYear(i.start, i.monthly, i.rate, i.years)
  const last = rows[rows.length - 1]
  const total = safe(last.balance)
  const contributed = safe(last.contributed)
  const growth = Math.max(0, total - contributed)
  return {
    contributedByYear: rows.map((r) => safe(r.contributed)),
    balanceByYear: rows.map((r) => safe(r.balance)),
    total,
    contributed,
    growth,
    growthShare: total > 0 ? growth / total : 0,
  }
}

/** "7%" or "4.5%". */
export const rateLabel = (rate: number) => `${Number.isInteger(rate) ? rate : rate.toFixed(1)}%`

/** "Growth is 55% of the total" under the split bar. */
export function shareLine(r: GrowthResult): string {
  if (r.total <= 0) return 'Add some money to see it grow.'
  const pct = Math.round(r.growthShare * 100)
  if (r.growth < 0.5 || pct < 1) return "No growth. It's all money you put in."
  if (pct < 15) return `Growth is ${pct}% of the total. That share gets bigger with more years.`
  return `Growth is ${pct}% of the total.`
}

export interface EarlyBird {
  monthly: number
  /** True when the player's monthly add is $0, so we borrowed an example amount. */
  borrowed: boolean
  early: number
  late: number
  earlyIn: number
  lateIn: number
  gap: number
  extraIn: number
}

export const EARLY_AGE = 15
export const LATE_AGE = 25
export const STOP_AGE = 65
const EXAMPLE_MONTHLY = 25

/** Same monthly amount, starting at 15 vs 25, both stopping at 65. */
export function earlyBird(monthly: number, rate: number): EarlyBird {
  const borrowed = !(monthly > 0)
  const m = borrowed ? EXAMPLE_MONTHLY : monthly
  const early = safe(futureValue(0, m, rate, STOP_AGE - EARLY_AGE))
  const late = safe(futureValue(0, m, rate, STOP_AGE - LATE_AGE))
  const earlyIn = m * 12 * (STOP_AGE - EARLY_AGE)
  const lateIn = m * 12 * (STOP_AGE - LATE_AGE)
  return { monthly: m, borrowed, early, late, earlyIn, lateIn, gap: Math.max(0, early - late), extraIn: earlyIn - lateIn }
}

export function earlyBirdLine(e: EarlyBird, rate: number): string {
  if (rate <= 0) return `At 0%, the early saver is ahead only by the extra ${money(e.extraIn)} they put in.`
  const times = e.extraIn > 0 ? Math.floor(e.gap / e.extraIn) : 0
  const base = `The early saver puts in ${money(e.extraIn)} more`
  return times >= 2 ? `${base} and ends up ${times}x that amount ahead.` : `${base} and ends up ${money(e.gap)} ahead.`
}

/** The Rule of 72 callout, matched to the chosen rate. */
export function ruleOf72(rate: number, start: number): { title: string; body: string } {
  if (!(rate > 0))
    return {
      title: 'At 0%, your money never doubles',
      body: 'It only grows when you add more.',
    }
  const yrs = yearsToDouble(rate)
  const n = Math.max(1, Math.round(yrs))
  const title = `At ${rateLabel(rate)}, your money doubles about every ${plural(n, 'year')}`
  const base = start >= 10 ? start : 1000
  let body = `Rule of 72: 72 ÷ ${rateLabel(rate).replace('%', '')} ≈ ${n}.`
  if (yrs <= 60) body += ` ${money(base)} would grow to ${money(base * 2)} with no new deposits.`
  return { title, body }
}

/** "You'd be 33" for the years slider. Null when we don't know the age. */
export function ageThen(age: number, years: number): string | null {
  if (!(age >= 5 && age <= 120)) return null
  return `You'd be ${Math.round(age + years)}`
}

export const MILLION = 1_000_000
