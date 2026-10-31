/* Starter jobs, saved state shape, and the words for the pay stub. All employers are made up. */
import type { PayFrequency } from './tax'

export interface Job {
  id: string
  emoji: string
  /** Short chip label. */
  name: string
  /** Fake employer printed on the pay stub. */
  employer: string
  wage: number
  hours: number
  /** Tips per week (0 = no tips). */
  tips: number
}

export const JOBS: Job[] = [
  { id: 'smoothie', emoji: '🥤', name: 'Smoothie shop', employer: 'Sunrise Smoothies', wage: 15, hours: 15, tips: 15 },
  { id: 'grocery', emoji: '🛒', name: 'Grocery store', employer: 'Hillside Market', wage: 14, hours: 12, tips: 0 },
  { id: 'lifeguard', emoji: '🏊', name: 'Lifeguard', employer: 'Riverside Pool', wage: 16, hours: 20, tips: 0 },
  { id: 'icecream', emoji: '🍦', name: 'Ice cream', employer: 'Corner Creamery', wage: 13, hours: 10, tips: 10 },
  { id: 'cinema', emoji: '🍿', name: 'Movie theater', employer: 'Main Street Cinema', wage: 13, hours: 12, tips: 0 },
  { id: 'burger', emoji: '🍔', name: 'Burger spot', employer: 'Oak Street Burgers', wage: 14, hours: 16, tips: 0 },
]

export const CUSTOM_JOB: Job = { id: 'custom', emoji: '💼', name: 'My own job', employer: 'Your Employer', wage: 15, hours: 15, tips: 0 }

export const jobById = (id: string): Job => JOBS.find((j) => j.id === id) ?? CUSTOM_JOB

export type StubView = 'check' | 'year'

export interface PaycheckState {
  jobId: string
  wage: number
  hours: number
  frequency: PayFrequency
  tipsOn: boolean
  tips: number
  stateRate: number
  view: StubView
  /** Price typed into the "cost in hours" box. */
  price: number
}

/** Ages 15 to 18 (and anyone who skipped the age question). Matches the spec defaults. */
export const TEEN_INITIAL: PaycheckState = {
  jobId: 'smoothie',
  wage: 15,
  hours: 15,
  frequency: 'biweekly',
  tipsOn: false,
  tips: 15,
  stateRate: 4,
  view: 'check',
  price: 0,
}

/** Ages 11 to 14: a lighter, "first job someday" setup. */
export const KID_INITIAL: PaycheckState = {
  jobId: 'icecream',
  wage: 13,
  hours: 8,
  frequency: 'weekly',
  tipsOn: false,
  tips: 10,
  stateRate: 4,
  view: 'check',
  price: 0,
}

const num = (v: unknown, fallback: number, min: number, max: number) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

/** Saved data can be old or odd. This always hands back a complete, sane state. */
export function sanitize(raw: unknown, base: PaycheckState): PaycheckState {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof PaycheckState, unknown>>
  return {
    jobId: typeof r.jobId === 'string' ? r.jobId : base.jobId,
    wage: num(r.wage, base.wage, 0, 100),
    hours: Math.round(num(r.hours, base.hours, 1, 40)),
    frequency: r.frequency === 'weekly' || r.frequency === 'biweekly' ? r.frequency : base.frequency,
    tipsOn: typeof r.tipsOn === 'boolean' ? r.tipsOn : base.tipsOn,
    tips: num(r.tips, base.tips, 0, 2000),
    stateRate: num(r.stateRate, base.stateRate, 0, 10),
    view: r.view === 'check' || r.view === 'year' ? r.view : base.view,
    price: num(r.price, base.price, 0, 100_000),
  }
}

/** Things to price in "hours of work". */
export const HOUR_ITEMS = [
  { emoji: '🍕', name: 'Large pizza', price: 15 },
  { emoji: '🎮', name: 'New video game', price: 60 },
  { emoji: '👟', name: 'Sneakers', price: 90 },
  { emoji: '📱', name: 'Cracked screen fix', price: 150 },
] as const

/** Tap a pay stub line to learn what it is. */
export const STUB_INFO = {
  wages: 'Hours worked times your hourly wage.',
  tips: 'Tips count as income, so they get taxed too.',
  gross: 'Everything you earned before taxes come out.',
  socialSecurity: '6.2% that pays monthly benefits to retirees and people with disabilities. You can collect it when you retire.',
  medicare: '1.45% for health insurance for people 65 and up.',
  federal: "Funds highways, parks, and more. The first $15,000 or so a year isn't taxed, so many teens owe nothing.",
  state: "Your state's income tax. Some states charge none, and some cities add their own.",
  takeHome: 'Also called net pay. This is the amount deposited in your account, so plan your budget with it.',
} as const

export type StubLine = keyof typeof STUB_INFO
