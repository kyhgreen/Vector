/*
  A simplified, explainable credit score model for learning.

  Real scores (FICO, VantageScore) are secret recipes. This one copies the
  public part: five factors with their published weights. Each factor is
  scored 0..100 from a tiny pretend credit report, then:

    score = 300 + 5.5 * (weighted average of the factors)

  so every factor at 100 gives 850 and every factor at 0 gives 300. The
  numbers are tuned to move in believable directions and sizes, not to
  match any real formula.
*/
import type { ButtonColor } from '../../components/Button'
import { money } from '../../lib/format'

/* ---------- Factors ---------- */

export type FactorId = 'payment' | 'owed' | 'history' | 'newCredit' | 'mix'
export type FactorScores = Record<FactorId, number>

export interface FactorInfo {
  id: FactorId
  name: string
  weight: number
  emoji: string
  /** Plain-English explainer shown when the factor row is opened. */
  blurb: string
}

export const FACTORS: FactorInfo[] = [
  {
    id: 'payment',
    name: 'Payment history',
    weight: 0.35,
    emoji: '📅',
    blurb: 'Whether you pay on time. A payment 30+ days late hurts for years, then fades.',
  },
  {
    id: 'owed',
    name: 'Amounts owed',
    weight: 0.3,
    emoji: '💳',
    blurb: 'Utilization: how much of your card limits you use. Under 30% is good, under 10% is great.',
  },
  {
    id: 'history',
    name: 'Length of history',
    weight: 0.15,
    emoji: '⏳',
    blurb: 'How old your accounts are. Only time improves this one.',
  },
  {
    id: 'newCredit',
    name: 'New credit',
    weight: 0.1,
    emoji: '🆕',
    blurb: 'Each application adds a hard inquiry. Several at once can make lenders think you need money quickly.',
  },
  {
    id: 'mix',
    name: 'Credit mix',
    weight: 0.1,
    emoji: '🧩',
    blurb: "Different kinds of credit, like a card and a loan. Don't take on debt just to improve this.",
  },
]

/* ---------- The pretend credit report ---------- */

export interface Account {
  id: number
  kind: 'card' | 'loan'
  name: string
  ageMonths: number
  /** Credit limit for a card, the original amount for a loan. */
  limit: number
  /** Loans only: months until it's paid off. */
  termMonths?: number
  /** Months since it closed. null means it's still open. */
  closedFor: number | null
  closedReason?: 'closed' | 'paid'
}

export interface Profile {
  /** Months simulated since the start. */
  month: number
  /** Months of on-time payments. */
  onTime: number
  /** Ages (in months) of late payments still on the report. */
  missed: number[]
  /** Total balance across all cards. */
  balance: number
  /** Ages (in months) of hard inquiries still on the report. */
  inquiries: number[]
  accounts: Account[]
  nextId: number
}

/** "Fresh credit": a couple of cards, a couple of years in, a bit of a balance. Scores about 685. */
export const START: Profile = {
  month: 0,
  onTime: 30,
  missed: [],
  balance: 600,
  inquiries: [10],
  accounts: [
    { id: 1, kind: 'card', name: 'Starter card', ageMonths: 30, limit: 800, closedFor: null },
    { id: 2, kind: 'card', name: 'Everyday card', ageMonths: 10, limit: 1200, closedFor: null },
  ],
  nextId: 3,
}

/** A card closed in good standing stays on the report about 10 years. */
export const CLOSED_REPORT_MONTHS = 120
/** Late payments stay on the report 7 years. */
export const LATE_REPORT_MONTHS = 84
/** Hard inquiries stay 2 years (and only really count for the first). */
export const INQUIRY_MONTHS = 24
export const MAX_OPEN_CARDS = 9
const NEW_CARD_LIMIT = 500
const CAR_LOAN = { amount: 12000, termMonths: 60 }
const NEW_CARD_NAMES = ['Store card', 'Rewards card', 'Cash back card', 'Gas card', 'Travel card', 'Student card', 'Points card']

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export const onReport = (a: Account) => a.closedFor === null || a.closedFor < CLOSED_REPORT_MONTHS
export const openCards = (p: Profile) => p.accounts.filter((a) => a.kind === 'card' && a.closedFor === null)
export const openLimit = (p: Profile) => openCards(p).reduce((s, a) => s + a.limit, 0)
export const hasOpenLoan = (p: Profile) => p.accounts.some((a) => a.kind === 'loan' && a.closedFor === null)

/** Share of card limits in use, 0..1+ (can pass 1 only if limits shrink under a balance). */
export function utilization(p: Profile): number {
  const limit = openLimit(p)
  if (limit <= 0) return p.balance > 0 ? 1 : 0
  return Math.max(0, p.balance) / limit
}

/* ---------- Scoring ---------- */

/** Piecewise-linear lookup through (x, y) points. */
function lerpTable(x: number, table: readonly (readonly [number, number])[]): number {
  if (x <= table[0][0]) return table[0][1]
  for (let i = 1; i < table.length; i++) {
    const [x0, y0] = table[i - 1]
    const [x1, y1] = table[i]
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
  }
  return table[table.length - 1][1]
}

/** Below this, late payments push payment history down more and more gently (it never hits a hard 0). */
const PAY_FLOOR = 20

/** Utilization to factor score. 1-9% is the sweet spot; 0% is fine but shows less activity. */
const UTIL_TABLE = [
  [0, 90],
  [0.01, 100],
  [0.09, 100],
  [0.1, 96],
  [0.3, 80],
  [0.5, 66],
  [0.75, 52],
  [1, 40],
  [1.5, 30],
] as const

export function factorScores(p: Profile): FactorScores {
  // Payment history: grows with on-time months, minus fading penalties for late payments.
  const base = 55 + 45 * Math.min(1, p.onTime / 72)
  const lates = [...p.missed].sort((a, b) => a - b)
  const penalty = lates.reduce((sum, age, i) => sum + (i === 0 ? 38 : 24) * (1 - 0.75 * Math.min(1, age / LATE_REPORT_MONTHS)), 0)
  // Soft floor instead of a hard 0, so every extra late payment still costs something.
  const raw = base - penalty
  const payment = clamp(raw >= PAY_FLOOR ? raw : (PAY_FLOOR * PAY_FLOOR) / (2 * PAY_FLOOR - raw), 0, 100)

  const owed = clamp(lerpTable(utilization(p), UTIL_TABLE), 0, 100)

  const rep = p.accounts.filter(onReport)
  let history = 0
  if (rep.length) {
    const oldest = Math.max(...rep.map((a) => a.ageMonths))
    const avg = rep.reduce((s, a) => s + a.ageMonths, 0) / rep.length
    const m = 0.5 * oldest + 0.5 * avg
    history = 20 + 80 * Math.pow(Math.min(1, m / 180), 0.6)
  }

  const inq = p.inquiries.reduce((s, age) => s + (age < 12 ? 1 : age < INQUIRY_MONTHS ? 0.5 : 0), 0)
  const brandNew = rep.filter((a) => a.ageMonths < 12).length
  const newCredit = clamp(100 - 9 * inq - 10 * brandNew, 0, 100)

  const hasCard = rep.some((a) => a.kind === 'card')
  const hasLoan = rep.some((a) => a.kind === 'loan')
  const mix = hasCard && hasLoan ? 100 : hasCard || hasLoan ? 55 : 0

  return { payment, owed, history, newCredit, mix }
}

export function scoreFrom(f: FactorScores): number {
  const avg = FACTORS.reduce((s, x) => s + x.weight * f[x.id], 0)
  const s = Math.round(300 + 5.5 * avg)
  return Number.isFinite(s) ? clamp(s, 300, 850) : 300
}

export const scoreOf = (p: Profile) => scoreFrom(factorScores(p))

/* ---------- Bands ---------- */

export interface Band {
  id: 'poor' | 'fair' | 'good' | 'veryGood' | 'exceptional'
  name: string
  min: number
  max: number
  color: ButtonColor
  /** One short line under the band name. */
  meaning: string
}

export const BANDS: Band[] = [
  {
    id: 'poor',
    name: 'Poor',
    min: 300,
    max: 579,
    color: 'red',
    meaning: 'Approvals are hard to get and rates are high. On-time payments raise the score over time.',
  },
  {
    id: 'fair',
    name: 'Fair',
    min: 580,
    max: 669,
    color: 'orange',
    meaning: 'Some lenders approve you, usually at higher interest rates.',
  },
  {
    id: 'good',
    name: 'Good',
    min: 670,
    max: 739,
    color: 'yellow',
    meaning: 'Most lenders say yes, but not always at their best rates.',
  },
  {
    id: 'veryGood',
    name: 'Very good',
    min: 740,
    max: 799,
    color: 'green',
    meaning: 'Most lenders say yes, at good rates.',
  },
  {
    id: 'exceptional',
    name: 'Exceptional',
    min: 800,
    max: 850,
    color: 'teal',
    meaning: 'The highest range. Lenders offer you their lowest rates.',
  },
]

export function bandIndex(score: number): number {
  for (let i = 0; i < BANDS.length; i++) if (score <= BANDS[i].max) return i
  return BANDS.length - 1
}
export const bandOf = (score: number) => BANDS[bandIndex(score)]

/** 0..1 position of a score on the 300-850 dial. */
export const dialPos = (score: number) => clamp((score - 300) / 550, 0, 1)

/* ---------- Time passing ---------- */

interface TimeNotes {
  turnedOne: number
  inquiriesGone: number
  latesGone: number
  loansPaid: string[]
  closedGone: string[]
}

/** Moves the clock forward. `paidOnTime` adds that many on-time months. */
export function advance(p: Profile, months: number, paidOnTime: boolean): { p: Profile; notes: TimeNotes } {
  const notes: TimeNotes = { turnedOne: 0, inquiriesGone: 0, latesGone: 0, loansPaid: [], closedGone: [] }
  const accounts: Account[] = []
  for (const a of p.accounts) {
    const age = a.ageMonths + months
    if (a.ageMonths < 12 && age >= 12) notes.turnedOne++
    let next: Account = { ...a, ageMonths: age, closedFor: a.closedFor === null ? null : a.closedFor + months }
    if (next.kind === 'loan' && next.closedFor === null && next.termMonths !== undefined && age >= next.termMonths) {
      next = { ...next, closedFor: age - next.termMonths, closedReason: 'paid' }
      notes.loansPaid.push(next.name)
    }
    if (!onReport(next)) {
      notes.closedGone.push(next.name)
      continue
    }
    accounts.push(next)
  }
  const inquiries = p.inquiries.map((a) => a + months)
  notes.inquiriesGone = inquiries.filter((a) => a >= INQUIRY_MONTHS).length
  const missed = p.missed.map((a) => a + months)
  notes.latesGone = missed.filter((a) => a >= LATE_REPORT_MONTHS).length
  return {
    p: {
      ...p,
      month: p.month + months,
      onTime: p.onTime + (paidOnTime ? months : 0),
      accounts,
      inquiries: inquiries.filter((a) => a < INQUIRY_MONTHS),
      missed: missed.filter((a) => a < LATE_REPORT_MONTHS),
    },
    notes,
  }
}

function timeNotesText(n: TimeNotes): string {
  const out: string[] = []
  if (n.turnedOne === 1) out.push('An account turned 1 and no longer counts as new.')
  if (n.turnedOne > 1) out.push(`${n.turnedOne} accounts turned 1 and no longer count as new.`)
  if (n.inquiriesGone) out.push(n.inquiriesGone === 1 ? 'An old hard inquiry turned 2 and dropped off.' : `${n.inquiriesGone} old hard inquiries turned 2 and dropped off.`)
  if (n.latesGone) out.push(n.latesGone === 1 ? 'A late payment turned 7 and fell off your report.' : `${n.latesGone} late payments turned 7 and fell off your report.`)
  for (const name of n.loansPaid) out.push(`Your ${name.toLowerCase()} is paid off and stays on your report as a plus.`)
  for (const name of n.closedGone) out.push(`Your old ${name.toLowerCase()} dropped off after 10 years, so your history got shorter.`)
  return out.join(' ')
}

/* ---------- Actions ---------- */

export type ActionId = 'pay' | 'miss' | 'maxout' | 'paydown' | 'open3' | 'close' | 'year' | 'carloan'

export interface ActionInfo {
  id: ActionId
  emoji: string
  label: string
  /** Short name for the history log. */
  short: string
}

export const ACTIONS: ActionInfo[] = [
  { id: 'pay', emoji: '✅', label: 'Pay bills on time', short: 'Paid on time' },
  { id: 'miss', emoji: '😬', label: 'Miss a payment', short: 'Missed a payment' },
  { id: 'maxout', emoji: '🛍️', label: 'Max out the card', short: 'Maxed out the card' },
  { id: 'paydown', emoji: '🧹', label: 'Pay it down under 10%', short: 'Paid the card down' },
  { id: 'open3', emoji: '🃏', label: 'Open 3 new cards', short: 'Opened 3 new cards' },
  { id: 'close', emoji: '✂️', label: 'Close the oldest card', short: 'Closed the oldest card' },
  { id: 'year', emoji: '⏳', label: 'Skip ahead a year', short: 'A year went by' },
  { id: 'carloan', emoji: '🚗', label: 'Get a car loan', short: 'Got a car loan' },
]

export const getAction = (id: ActionId) => ACTIONS.find((a) => a.id === id)!

/** null if the action can run, otherwise a short reason it can't. */
export function blockedReason(p: Profile, id: ActionId): string | null {
  if (id === 'close' && openCards(p).length < 2) return 'This is your last open card.'
  if (id === 'open3' && openCards(p).length + 3 > MAX_OPEN_CARDS) return `${MAX_OPEN_CARDS} open cards is the max here.`
  if (id === 'carloan' && hasOpenLoan(p)) return 'You already have a car loan.'
  return null
}

export interface Outcome {
  next: Profile
  before: number
  after: number
  title: string
  body: string
  /** after - before for each factor. */
  factorDelta: FactorScores
}

const pct = (u: number) => `${Math.round(u * 100)}%`
const pts = (n: number) => `${Math.abs(n)} point${Math.abs(n) === 1 ? '' : 's'}`

export function runAction(p: Profile, id: ActionId): Outcome {
  const fBefore = factorScores(p)
  const before = scoreFrom(fBefore)
  let next = p
  let title = ''
  let body = ''
  let tail = ''
  const uBefore = utilization(p)

  switch (id) {
    case 'pay': {
      const r = advance(p, 1, true)
      next = r.p
      tail = timeNotesText(r.notes)
      title = 'Paid on time'
      body =
        factorScores(next).payment > fBefore.payment
          ? 'Payment history, the biggest factor, got a bit stronger.' +
            (p.missed.length ? ` Your late payment${p.missed.length > 1 ? 's fade' : ' fades'} a little, too.` : '')
          : fBefore.payment >= 100
            ? 'Payment history is already at the top. Paying on time keeps it there.'
            : 'Late payments still outweigh it for now. Each on-time month makes them count a little less.'
      break
    }
    case 'miss': {
      // The late payment lands now. The clock only moves on "pay" and "skip a year", so a
      // miss can't sneak in a point from accounts getting older the same month.
      next = { ...p, missed: [0, ...p.missed] }
      const after = scoreOf(next)
      if (p.missed.length === 0) {
        title = 'Late payment'
        body = `This one cost ${pts(after - before)} and stays on your report for 7 years. Setting up autopay for the minimum payment prevents this.`
      } else {
        title = 'Another late payment'
        body = 'Lenders may see one late payment as a mistake. Several look like a pattern, and each stays on your report for 7 years.'
      }
      break
    }
    case 'maxout': {
      const limit = openLimit(p)
      const plural = openCards(p).length > 1
      if (uBefore >= 0.995) {
        title = 'Already maxed out'
        body = `Your card${plural ? 's are' : ' is'} already at the limit. Paying the balance down is what will raise the score.`
      } else {
        next = { ...p, balance: limit }
        title = 'Card at 100%'
        body = `Using all ${money(limit)} of your limit tells lenders you may be short on money. Once you pay it down, the score recovers.`
      }
      break
    }
    case 'paydown': {
      const limit = openLimit(p)
      if (uBefore < 0.1) {
        title = 'Already under 10%'
        body = `You're using just ${pct(uBefore)} of your limit, which is already a good level.`
      } else {
        const target = Math.round((limit * 0.05) / 10) * 10
        next = { ...p, balance: Math.min(p.balance, target) }
        title = 'Card paid down'
        body = `Balance down to ${money(next.balance)}, just ${pct(utilization(next))} of your limit. Under 10% scores best.`
      }
      break
    }
    case 'open3': {
      const accounts = [...p.accounts]
      let nid = p.nextId
      for (let i = 0; i < 3; i++) {
        accounts.push({ id: nid, kind: 'card', name: NEW_CARD_NAMES[nid % NEW_CARD_NAMES.length], ageMonths: 0, limit: NEW_CARD_LIMIT, closedFor: null })
        nid++
      }
      next = { ...p, accounts, nextId: nid, inquiries: [0, 0, 0, ...p.inquiries] }
      const after = scoreOf(next)
      // Only claim the extra limit helped if the utilization slice actually went up.
      const better = factorScores(next).owed > fBefore.owed + 0.05
      title = 'Three new cards'
      if (after >= before) {
        body = `The extra ${money(NEW_CARD_LIMIT * 3)} of limit made up for three hard inquiries this time. Avoid this before a big loan.`
      } else {
        body =
          'Three hard inquiries, and the new accounts lower your average account age. ' +
          (better ? 'The extra limit helped your utilization, just not enough. ' : '') +
          'Inquiries stop counting after a year.'
      }
      break
    }
    case 'close': {
      const cards = openCards(p)
      const oldest = cards.reduce((a, b) => (b.ageMonths > a.ageMonths ? b : a), cards[0])
      next = { ...p, accounts: p.accounts.map((a) => (a.id === oldest.id ? { ...a, closedFor: 0, closedReason: 'closed' as const } : a)) }
      title = 'Oldest card closed'
      if (p.balance > 0) {
        body = `Without the ${money(oldest.limit)} limit, your ${money(p.balance)} balance uses ${pct(utilization(next))} instead of ${pct(uBefore)}. The card stays on your report 10 years.`
      } else {
        body = `With a $0 balance, losing the ${money(oldest.limit)} limit barely mattered. Closing cards hurts most when you carry a balance.`
      }
      break
    }
    case 'year': {
      const r = advance(p, 12, true)
      next = r.p
      tail = timeNotesText(r.notes)
      title = 'A year later'
      const u = utilization(next)
      body =
        'Twelve on-time payments, and every account got a year older.' +
        (p.missed.length ? ' Your late payments faded a bit, too.' : '') +
        (u >= 0.3 ? ` Your cards are still ${pct(u)} used, though. Paying that down would help more than waiting.` : '')
      break
    }
    case 'carloan': {
      const loan: Account = { id: p.nextId, kind: 'loan', name: 'Car loan', ageMonths: 0, limit: CAR_LOAN.amount, termMonths: CAR_LOAN.termMonths, closedFor: null }
      next = { ...p, accounts: [...p.accounts, loan], nextId: p.nextId + 1, inquiries: [0, ...p.inquiries] }
      const hadLoan = p.accounts.some((a) => a.kind === 'loan' && onReport(a))
      title = 'New car loan'
      body = hadLoan
        ? "You already had a loan, so your mix didn't improve. You just added a hard inquiry and a new account."
        : 'A card plus a loan helps your credit mix, minus a few points for the hard inquiry. Don\'t borrow just to raise your score.'
      break
    }
  }

  const fAfter = factorScores(next)
  const after = scoreFrom(fAfter)
  const factorDelta = Object.fromEntries(FACTORS.map((f) => [f.id, fAfter[f.id] - fBefore[f.id]])) as FactorScores
  return { next, before, after, title, body: tail ? `${body} ${tail}` : body, factorDelta }
}

/* ---------- Words ---------- */

/** "2 yrs 6 mo", "8 mo", "brand new". */
export function ageText(months: number): string {
  const m = Math.max(0, Math.round(months))
  if (m === 0) return 'brand new'
  const y = Math.floor(m / 12)
  const r = m % 12
  if (!y) return `${r} mo`
  return r ? `${y} yr${y === 1 ? '' : 's'} ${r} mo` : `${y} yr${y === 1 ? '' : 's'}`
}

/** One-line "why" for each factor, from the current report. */
export function factorDetail(p: Profile, id: FactorId): string {
  switch (id) {
    case 'payment': {
      const late = p.missed.length
      return `${p.onTime} on-time month${p.onTime === 1 ? '' : 's'}, ${late ? `${late} late payment${late === 1 ? '' : 's'} on file` : 'zero late payments'}`
    }
    case 'owed': {
      const limit = openLimit(p)
      return `Using ${pct(utilization(p))} of your ${money(limit)} limit (${money(p.balance)} balance)`
    }
    case 'history': {
      const rep = p.accounts.filter(onReport)
      if (!rep.length) return 'No accounts yet'
      const oldest = Math.max(...rep.map((a) => a.ageMonths))
      const avg = rep.reduce((s, a) => s + a.ageMonths, 0) / rep.length
      return `Oldest: ${ageText(oldest)}. Average: ${ageText(avg)}.`
    }
    case 'newCredit': {
      const inq = p.inquiries.filter((a) => a < 12).length
      const fresh = p.accounts.filter((a) => onReport(a) && a.ageMonths < 12).length
      if (!inq && !fresh) return 'No new applications in the past year'
      return `Past year: ${inq} hard inquir${inq === 1 ? 'y' : 'ies'}, ${fresh} new account${fresh === 1 ? '' : 's'}`
    }
    case 'mix': {
      const rep = p.accounts.filter(onReport)
      const card = rep.some((a) => a.kind === 'card')
      const loan = rep.some((a) => a.kind === 'loan')
      if (card && loan) return 'Cards plus a loan'
      if (card) return 'Cards only, no loans yet'
      if (loan) return 'A loan, but no cards'
      return 'Nothing yet'
    }
  }
}

/** Grade word + color for a 0..100 factor score. */
export function grade(v: number): { word: string; color: ButtonColor } {
  if (v >= 90) return { word: 'Excellent', color: 'green' }
  if (v >= 75) return { word: 'Good', color: 'teal' }
  if (v >= 55) return { word: 'Okay', color: 'yellow' }
  if (v >= 35) return { word: 'Needs work', color: 'orange' }
  return { word: 'Poor', color: 'red' }
}
