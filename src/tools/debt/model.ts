/*
  The math and saved inputs for the Debt Payoff Lab.

  Three tabs:
    card   credit card payoff: minimum payments vs your payment
    loan   car or student loan: monthly payment, total interest, term compare
    snow   snowball vs avalanche across up to 4 debts

  Everything here is plain functions so it can be tested, and every input
  goes through a sanitizer so nothing on screen can ever say NaN.
*/
import { loanPayment, minimumPaymentPayoff, payoff, type PayoffResult } from '../../lib/finance'

/* ---------- Saved inputs ---------- */

export type DebtTab = 'card' | 'loan' | 'snow'
export type LoanKind = 'car' | 'student'

export interface CardInputs {
  balance: number
  apr: number
  payment: number
}

export interface LoanInputs {
  kind: LoanKind
  amount: number
  rate: number
  years: number
}

export interface DebtItem {
  id: number
  name: string
  balance: number
  apr: number
  min: number
}

export interface SnowInputs {
  debts: DebtItem[]
  extra: number
  nextId: number
}

export interface DebtSave {
  tab: DebtTab
  card: CardInputs
  loan: LoanInputs
  snow: SnowInputs
}

export const LIMITS = {
  balance: 100_000,
  apr: 60,
  payment: 100_000,
  amount: 500_000,
  rate: 30,
  yearsMin: 1,
  yearsMax: 20,
  debts: 4,
  min: 10_000,
  extra: 10_000,
  name: 24,
}

export const MIN_FLOOR = 25
export const TERMS = [3, 5, 7]

const young = (age: number) => age > 0 && age <= 14

export function cardDefaults(age: number): CardInputs {
  return young(age) ? { balance: 500, apr: 22, payment: 40 } : { balance: 2000, apr: 22, payment: 100 }
}

export function loanDefaults(kind: LoanKind, age: number): LoanInputs {
  if (kind === 'student') return { kind, amount: young(age) ? 20000 : 27000, rate: 6.5, years: 10 }
  return { kind, amount: young(age) ? 8000 : 15000, rate: 7, years: 5 }
}

export const SNOW_DEFAULTS: SnowInputs = {
  debts: [
    { id: 1, name: 'Phone payment plan', balance: 300, apr: 0, min: 25 },
    { id: 2, name: 'Mall store card', balance: 900, apr: 26, min: 30 },
    { id: 3, name: 'Rewards credit card', balance: 2400, apr: 21, min: 60 },
  ],
  extra: 100,
  nextId: 4,
}

export function defaultsFor(age: number): DebtSave {
  return { tab: 'card', card: cardDefaults(age), loan: loanDefaults('car', age), snow: SNOW_DEFAULTS }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
export const clampNum = (v: unknown, lo: number, hi: number, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback)

export function sanitizeDebt(v: unknown, age: number): DebtSave {
  const d = defaultsFor(age)
  if (!isObj(v)) return d
  const tab: DebtTab = v.tab === 'loan' || v.tab === 'snow' ? v.tab : 'card'
  const c = isObj(v.card) ? v.card : {}
  const card: CardInputs = {
    balance: clampNum(c.balance, 0, LIMITS.balance, d.card.balance),
    apr: clampNum(c.apr, 0, LIMITS.apr, d.card.apr),
    payment: clampNum(c.payment, 0, LIMITS.payment, d.card.payment),
  }
  const l = isObj(v.loan) ? v.loan : {}
  const kind: LoanKind = l.kind === 'student' ? 'student' : 'car'
  const ld = loanDefaults(kind, age)
  const loan: LoanInputs = {
    kind,
    amount: clampNum(l.amount, 0, LIMITS.amount, ld.amount),
    rate: clampNum(l.rate, 0, LIMITS.rate, ld.rate),
    years: Math.round(clampNum(l.years, LIMITS.yearsMin, LIMITS.yearsMax, ld.years)),
  }
  const s = isObj(v.snow) ? v.snow : {}
  const rawDebts = Array.isArray(s.debts) ? s.debts : null
  const debts: DebtItem[] = rawDebts
    ? rawDebts
        .filter(isObj)
        .slice(0, LIMITS.debts)
        .map((x, i) => ({
          id: Math.round(clampNum(x.id, 0, 1e9, 100 + i)),
          name: typeof x.name === 'string' ? x.name.slice(0, LIMITS.name) : `Debt ${i + 1}`,
          balance: clampNum(x.balance, 0, LIMITS.balance, 0),
          apr: clampNum(x.apr, 0, LIMITS.apr, 0),
          min: clampNum(x.min, 0, LIMITS.min, 0),
        }))
    : SNOW_DEFAULTS.debts.map((x) => ({ ...x }))
  // Ids must be unique (they are React keys).
  const seen = new Set<number>()
  let nextId = Math.max(Math.round(clampNum(s.nextId, 1, 1e9, 1)), ...debts.map((x) => x.id + 1), 1)
  for (const x of debts) {
    if (seen.has(x.id)) x.id = nextId++
    seen.add(x.id)
  }
  const snow: SnowInputs = { debts, extra: clampNum(s.extra, 0, LIMITS.extra, SNOW_DEFAULTS.extra), nextId }
  return { tab, card, loan, snow }
}

/* ---------- Credit card tab ---------- */

export interface CardResult {
  /** First month's interest charge. */
  interest: number
  /** First month's minimum payment (1% + interest, at least $25). */
  firstMin: number
  min: PayoffResult
  mine: PayoffResult
  /** Paying less than the card's minimum (that's a missed payment in real life). */
  belowMin: boolean
}

export function cardCompare(c: CardInputs): CardResult {
  const b = Math.max(0, c.balance)
  const r = c.apr / 100 / 12
  const interest = b * r
  const firstMin = b > 0 ? Math.min(b + interest, Math.max(MIN_FLOOR, b * 0.01 + interest)) : 0
  const min = minimumPaymentPayoff(b, c.apr, MIN_FLOOR)
  const mine = payoff(b, c.apr, Math.max(0, c.payment))
  return { interest, firstMin, min, mine, belowMin: b > 0 && c.payment + 0.005 < firstMin }
}

/** Balance each month when the payment never catches up, so the chart can show it growing. */
export function growingBalances(balance: number, aprPct: number, payment: number, months: number): number[] {
  const r = aprPct / 100 / 12
  const out = [balance]
  let b = balance
  for (let m = 1; m <= months; m++) {
    b = Math.max(0, b * (1 + r) - payment)
    out.push(b)
  }
  return out
}

/* ---------- Charts ---------- */

/** Picks a sensible spacing of points so long payoffs still draw a clean chart. */
export function sampleMonths(span: number): number[] {
  const s = Math.max(1, Math.round(span))
  const step = s <= 24 ? 1 : s <= 72 ? 3 : s <= 180 ? 6 : 12
  const out: number[] = []
  for (let m = 0; m <= s; m += step) out.push(m)
  if (out[out.length - 1] !== s) out.push(s)
  return out
}

/**
  Months to plot for a payoff that takes `span` months. The shared chart labels
  every k-th point plus the last one, so this picks a step and end point where
  the last point lands right on a label (no squished labels at the end), and
  long charts get labels on whole years.
*/
export function chartMonths(span: number): number[] {
  const s = Math.max(1, Math.ceil(span))
  for (const step of [1, 2, 3, 6, 12, 24, 36, 60]) {
    const base = Math.max(6, Math.ceil(s / step))
    for (let segs = base; segs <= base + 8; segs++) {
      const n = segs + 1
      if (n > 31) break
      const every = Math.ceil(n / 6)
      if (segs % every !== 0) continue
      if (segs * step > 36 && (every * step) % 12 !== 0) continue
      return Array.from({ length: n }, (_, i) => i * step)
    }
  }
  return sampleMonths(s)
}

export function monthLabel(m: number, span: number): string {
  if (m === 0) return 'Now'
  if (span <= 36) return `Mo ${m}`
  const y = m / 12
  return `Yr ${Number.isInteger(y) ? y : y.toFixed(1)}`
}

/** Reads a balance list at month m. Past the end means paid off (0). */
export const balanceAt = (list: number[], m: number) => (m < list.length ? Math.max(0, list[m]) : 0)

/* ---------- Loan tab ---------- */

export interface LoanStats {
  years: number
  months: number
  payment: number
  totalPaid: number
  interest: number
}

export function loanStats(amount: number, ratePct: number, years: number): LoanStats {
  const months = Math.max(1, Math.round(years * 12))
  const a = Math.max(0, amount)
  const pay = loanPayment(a, Math.max(0, ratePct), months)
  const payment = Number.isFinite(pay) ? pay : 0
  const totalPaid = payment * months
  return { years, months, payment, totalPaid, interest: Math.max(0, totalPaid - a) }
}

/** The 3 / 5 / 7 year comparison, plus your own term if it isn't one of those. */
export function termCompare(l: LoanInputs): (LoanStats & { yours: boolean })[] {
  const terms = TERMS.includes(l.years) ? TERMS : [...TERMS, l.years].sort((a, b) => a - b)
  return terms.map((y) => ({ ...loanStats(l.amount, l.rate, y), yours: y === l.years }))
}

/* ---------- Snowball vs avalanche ---------- */

export type Strategy = 'snowball' | 'avalanche'

export interface Payoff {
  id: number
  name: string
  month: number
}

export interface StrategyResult {
  strategy: Strategy
  months: number
  totalInterest: number
  totalPaid: number
  order: Payoff[]
  /** Total owed at the end of each month, starting with today. */
  balances: number[]
  never: boolean
  /** Month the first debt gets knocked out. */
  firstWin: number
}

export const MAX_MONTHS = 600

/** Debts that actually count (some balance left). Unnamed ones get a friendly name. */
export function activeDebts(debts: DebtItem[]): DebtItem[] {
  return debts
    .map((d, i) => ({ ...d, name: d.name.trim() || `Debt ${i + 1}` }))
    .filter((d) => Number.isFinite(d.balance) && d.balance > 0.005)
}

/**
  Pays every minimum each month, then throws the extra money (plus any
  minimums freed up by paid-off debts) at the target debt:
    snowball   smallest balance first
    avalanche  highest interest rate first
*/
export function simulate(input: DebtItem[], extra: number, strategy: Strategy): StrategyResult {
  const debts = activeDebts(input).map((d) => ({ ...d, b: d.balance, apr: Math.max(0, d.apr), min: Math.max(0, d.min) }))
  const budget = debts.reduce((s, d) => s + d.min, 0) + Math.max(0, extra)
  const balances = [debts.reduce((s, d) => s + d.b, 0)]
  const order: Payoff[] = []
  let interestTotal = 0
  let paidTotal = 0
  let month = 0

  const rank = (a: (typeof debts)[number], b: (typeof debts)[number]) =>
    strategy === 'snowball' ? a.b - b.b || b.apr - a.apr || a.id - b.id : b.apr - a.apr || a.b - b.b || a.id - b.id

  while (debts.some((d) => d.b > 0.005) && month < MAX_MONTHS) {
    month++
    const open = debts.filter((d) => d.b > 0.005)
    for (const d of open) {
      const i = d.b * (d.apr / 100 / 12)
      d.b += i
      interestTotal += i
    }
    let pool = budget
    for (const d of open) {
      const pay = Math.min(d.min, d.b, pool)
      d.b -= pay
      pool -= pay
      paidTotal += pay
    }
    for (const d of [...open].sort(rank)) {
      if (pool <= 0.005) break
      const pay = Math.min(pool, d.b)
      d.b -= pay
      pool -= pay
      paidTotal += pay
    }
    for (const d of open) {
      if (d.b <= 0.005) {
        d.b = 0
        order.push({ id: d.id, name: d.name, month })
      }
    }
    balances.push(debts.reduce((s, d) => s + d.b, 0))
  }

  const never = debts.some((d) => d.b > 0.005)
  return {
    strategy,
    months: never ? Infinity : month,
    totalInterest: never ? Infinity : interestTotal,
    totalPaid: never ? Infinity : paidTotal,
    order,
    balances,
    never,
    firstWin: order.length ? order[0].month : Infinity,
  }
}

/** True if the first month's interest eats the whole budget, so nothing ever shrinks. */
export function budgetTooSmall(input: DebtItem[], extra: number): boolean {
  const debts = activeDebts(input)
  if (!debts.length) return false
  const budget = debts.reduce((s, d) => s + Math.max(0, d.min), 0) + Math.max(0, extra)
  const interest = debts.reduce((s, d) => s + d.balance * (Math.max(0, d.apr) / 100 / 12), 0)
  return budget <= interest + 0.005
}

export const sameOrder = (a: StrategyResult, b: StrategyResult) => a.order.length === b.order.length && a.order.every((p, i) => p.id === b.order[i].id)

/**
  A real tie: same order, same finish, same first win, same interest (within 50 cents).
  The same order alone isn't enough, since the extra money can still go to different debts along the way.
*/
export const isTie = (a: StrategyResult, b: StrategyResult) =>
  !a.never && !b.never && sameOrder(a, b) && a.months === b.months && a.firstWin === b.firstWin && Math.abs(a.totalInterest - b.totalInterest) <= 0.5
