/*
  Weekly leagues with made-up rivals (there are no accounts, so no real
  players). Rivals are generated from a seed, so the same week always has the
  same rivals, and their XP climbs as the week goes on.

  Each week runs Monday to Sunday. When a new week starts:
    top 3      -> promoted to the next division
    bottom 3   -> demoted (never below Penny)
    everyone else stays put
  If you earned 0 XP that week, you just stay where you are.
*/
import { hashString, rng } from '../lib/random'
import type { UnitColor } from '../content/types'

export interface Division {
  name: string
  color: UnitColor
}

export const DIVISIONS: Division[] = [
  { name: 'Penny', color: 'orange' },
  { name: 'Nickel', color: 'teal' },
  { name: 'Dime', color: 'blue' },
  { name: 'Quarter', color: 'purple' },
  { name: 'Half-Dollar', color: 'pink' },
  { name: 'Dollar', color: 'green' },
  { name: 'Fiver', color: 'teal' },
  { name: 'Tenner', color: 'orange' },
  { name: 'Twenty', color: 'red' },
  { name: 'Benjamin', color: 'yellow' },
]

export const PROMOTE_COUNT = 3
export const DEMOTE_COUNT = 3
export const RIVAL_COUNT = 14

const RIVAL_NAMES = [
  'PennyPincher', 'BudgetBoss', 'CouponQueen', 'Sir Saves-a-Lot', 'StonksGoUp', 'LemonadeMogul',
  'PiggyBankPete', 'TheFrugalFrog', 'CashMoneyKai', 'DimeTime', 'Captain Compound', 'Interest Ingrid',
  'ThriftShopTheo', 'Bargain Bea', 'DebtFreeDev', 'MoneyMaya', 'BudgetNinja', 'Index Fund Ivan',
  'Diversify Dani', 'NoImpulseNoah', 'Rainy Day Ray', 'ZeroBasedZoe', 'CreditScoreCarlos', 'TaxRefundTess',
  'Allowance Al', 'ChoreChampion', 'Quarterback Quinn', 'Ms. Moneybags', 'Latte Factor Leo', 'Frugal Fiona',
  'The Penny Pirate', 'CentSational', 'WalletWizard', 'Savings Sam', 'Spreadsheet Sara', 'MarketMoose',
  'Sir Budgetsalot', 'Coupon Cody', 'HighYieldHana', 'Emergency Fund Em', 'LowFeeLuis', 'Nugget Nest',
  'BulkBuyBen', 'SideHustleSky', 'Paycheck Priya', 'Bond James Bond', 'APR Avery', 'Rule of 72 Rex',
]

export interface Rival {
  id: string
  name: string
  /** XP this rival will have by the end of the week. */
  target: number
  /** Shape of their week: <1 = early bird, >1 = last-minute crammer. */
  curve: number
}

/** Rivals in a division get a bit tougher as you climb. */
function divisionPace(division: number) {
  return 40 + division * 35
}

export function rivalsFor(weekKey: string, division: number): Rival[] {
  const rand = rng(`${weekKey}|${division}`)
  const pool = [...RIVAL_NAMES]
  const rivals: Rival[] = []
  const pace = divisionPace(division)
  for (let i = 0; i < RIVAL_COUNT; i++) {
    const nameIdx = Math.floor(rand() * pool.length)
    const name = pool.splice(nameIdx, 1)[0]
    // Spread of effort: a few slackers, a few try-hards, most in the middle.
    const effort = Math.exp((rand() - 0.5) * 2.2) // ~0.33x to ~3x
    // This roll used to pick a rival's emoji (rivals show initials now). Still
    // drawn so every seeded week keeps the exact same rivals and XP.
    rand()
    rivals.push({
      id: `r${hashString(name) % 100000}`,
      name,
      target: Math.round((pace * effort) / 5) * 5,
      curve: 0.6 + rand() * 1.2,
    })
  }
  return rivals
}

/**
  A rival's XP at some point in the week (0 = Monday morning, 1 = Sunday night).
  Each rival works harder on some days than others (seeded), but XP only ever
  goes up, and lands exactly on `target` when the week ends.
*/
export function rivalXpAt(rival: Rival, progress: number, weekKey: string): number {
  const p = Math.min(1, Math.max(0, progress))
  if (p >= 1) return rival.target
  const rand = rng(`${weekKey}|${rival.id}|days`)
  const effort = Array.from({ length: 7 }, () => 0.5 + rand())
  const total = effort.reduce((a, b) => a + b, 0)
  const dayPos = p * 7
  const day = Math.floor(dayPos)
  let done = 0
  for (let d = 0; d < day; d++) done += effort[d]
  done += effort[day] * (dayPos - day)
  const xp = rival.target * Math.pow(done / total, rival.curve)
  return Math.max(0, Math.min(rival.target, Math.round(xp)))
}

export interface Standing {
  id: string
  name: string
  /** Your avatar id (rivals don't have one; they show initials). */
  avatar?: string
  xp: number
  isYou: boolean
  rank: number
}

export function standings(opts: {
  weekKey: string
  division: number
  progress: number
  youXp: number
  youName: string
  youAvatar: string
}): Standing[] {
  const rows: Omit<Standing, 'rank'>[] = rivalsFor(opts.weekKey, opts.division).map((r) => ({
    id: r.id,
    name: r.name,
    xp: rivalXpAt(r, opts.progress, opts.weekKey),
    isYou: false,
  }))
  rows.push({ id: 'you', name: opts.youName || 'You', avatar: opts.youAvatar, xp: opts.youXp, isYou: true })
  // Ties go to you. You earned it.
  rows.sort((a, b) => b.xp - a.xp || (a.isYou ? -1 : b.isYou ? 1 : 0))
  return rows.map((r, i) => ({ ...r, rank: i + 1 }))
}

export type LeagueOutcome = 'promoted' | 'demoted' | 'stayed'

export function outcomeFor(rank: number, total: number, division: number, xp: number): LeagueOutcome {
  if (xp <= 0) return 'stayed'
  if (rank <= PROMOTE_COUNT && division < DIVISIONS.length - 1) return 'promoted'
  if (rank > total - DEMOTE_COUNT && division > 0) return 'demoted'
  return 'stayed'
}

/** Which zone a rank sits in, for coloring the leaderboard. */
export function zoneFor(rank: number, total: number, division: number): 'promote' | 'demote' | 'safe' {
  if (rank <= PROMOTE_COUNT && division < DIVISIONS.length - 1) return 'promote'
  if (rank > total - DEMOTE_COUNT && division > 0) return 'demote'
  return 'safe'
}
