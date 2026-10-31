/*
  Every word the League screen says, plus the small helpers that turn
  numbers into readable text. Kept in one place so it's easy to edit
  (and so a test can check there's no em dash hiding anywhere).
*/
import { addDays, dayKey, parseDay, weekStart } from '../../lib/dates'
import { hashString } from '../../lib/random'
import { number, plural } from '../../lib/format'
import { XP } from '../../state/constants'
import { DIVISIONS, DEMOTE_COUNT, PROMOTE_COUNT } from '../../state/league'
import type { LeagueOutcome } from '../../state/league'

/* ---------- Small safe helpers ---------- */

/** Any number in, a finite number out. Keeps NaN far away from the UI. */
export const safe = (n: unknown, fallback = 0): number => (typeof n === 'number' && Number.isFinite(n) ? n : fallback)

/** Clamps a stored division index into the real range. */
export const clampDivision = (d: unknown): number => Math.max(0, Math.min(DIVISIONS.length - 1, Math.floor(safe(d))))

export const divisionName = (d: number): string => DIVISIONS[clampDivision(d)].name

export const leagueName = (d: number): string => `${divisionName(d)} League`

/** Deterministic pick: same seed, same line. So text doesn't reshuffle every render. */
export function pickBy<T>(items: readonly T[], seed: string): T {
  return items[hashString(seed) % items.length]
}

/** 1 -> "1st", 2 -> "2nd", 11 -> "11th", 23 -> "23rd". */
export function ordinal(n: number): string {
  const v = Math.max(0, Math.floor(safe(n)))
  const mod100 = v % 100
  if (mod100 >= 11 && mod100 <= 13) return `${v}th`
  switch (v % 10) {
    case 1:
      return `${v}st`
    case 2:
      return `${v}nd`
    case 3:
      return `${v}rd`
    default:
      return `${v}th`
  }
}

/** Milliseconds until next Monday 00:00 local time (when the league resets). */
export function msUntilReset(now: Date): number {
  const nextMonday = parseDay(addDays(weekStart(dayKey(now)), 7)).getTime()
  return Math.max(0, nextMonday - now.getTime())
}

/** "3d 4h", "5h 12m", "12m" plus a screen-reader version. */
export function timeLeft(ms: number): { short: string; long: string } {
  const t = Math.max(0, safe(ms))
  const days = Math.floor(t / 86_400_000)
  const hours = Math.floor((t % 86_400_000) / 3_600_000)
  const mins = Math.floor((t % 3_600_000) / 60_000)
  if (days >= 1) return { short: `${days}d ${hours}h`, long: `${plural(days, 'day')} ${plural(hours, 'hour')}` }
  if (hours >= 1) return { short: `${hours}h ${mins}m`, long: `${plural(hours, 'hour')} ${plural(mins, 'minute')}` }
  if (mins >= 1) return { short: `${mins}m`, long: plural(mins, 'minute') }
  return { short: 'under 1m', long: 'less than a minute' }
}

/** Rough "that's about 2 lessons" so an XP gap is easy to picture. */
export function lessonsFor(xp: number): string {
  const n = Math.max(1, Math.ceil(Math.max(0, safe(xp)) / XP.lesson))
  return n === 1 ? 'about one lesson' : `about ${plural(n, 'lesson')}`
}

export const xpText = (xp: number) => `${number(Math.max(0, Math.round(safe(xp))))} XP`

/* ---------- Divisions ---------- */

/** Face value printed on each division's coin or bill. */
const GLYPHS: Record<string, string> = {
  Penny: '1¢',
  Nickel: '5¢',
  Dime: '10¢',
  Quarter: '25¢',
  'Half-Dollar': '50¢',
  Dollar: '$1',
  Fiver: '$5',
  Tenner: '$10',
  Twenty: '$20',
  Benjamin: '$100',
}

export function divisionGlyph(d: number): string {
  const name = divisionName(d)
  return GLYPHS[name] ?? name.charAt(0)
}

/** Cents divisions are coins. Dollar divisions are bills. */
export function divisionShape(d: number): 'coin' | 'bill' {
  return divisionGlyph(d).endsWith('¢') ? 'coin' : 'bill'
}

/** The short line under a league's badge: where it sits on the ladder. */
export function divisionQuip(d: number): string {
  const i = clampDivision(d)
  const position = `League ${i + 1} of ${DIVISIONS.length}.`
  if (isBottomDivision(i)) return `${position} Everyone starts here.`
  if (isTopDivision(i)) return `${position} This is the top league.`
  return position
}

const FACTS: Record<string, string> = {
  Penny: 'In recent years, a penny has cost the U.S. Mint almost 4 cents to make.',
  Nickel: 'A nickel is only 25% nickel. The other 75% is copper.',
  Dime: "The dime is the smallest U.S. coin, but it's worth more than a penny or a nickel.",
  Quarter: 'A quarter has 119 ridges around its edge.',
  'Half-Dollar': 'Half-dollars are still made, but mostly for collectors.',
  Dollar: 'Dollar bills are made mostly of cotton, not regular paper.',
  Fiver: 'Abraham Lincoln is on the $5 bill.',
  Tenner: 'Alexander Hamilton, the first Secretary of the Treasury, is on the $10 bill.',
  Twenty: 'Most U.S. ATMs give out only $20 bills.',
  Benjamin: 'Benjamin Franklin is on the $100 bill. He was never president.',
}

export const divisionFact = (d: number) => FACTS[divisionName(d)] ?? 'Each league is named after a U.S. coin or bill.'

export const isTopDivision = (d: number) => clampDivision(d) === DIVISIONS.length - 1
export const isBottomDivision = (d: number) => clampDivision(d) === 0

/** The rules line under the league title, adjusted for the top and bottom leagues. */
export function rulesLine(d: number): string {
  if (isTopDivision(d)) return `This is the top league. Bottom ${DEMOTE_COUNT} move down.`
  if (isBottomDivision(d)) return `Top ${PROMOTE_COUNT} move up. No one moves down from Penny.`
  return `Top ${PROMOTE_COUNT} move up. Bottom ${DEMOTE_COUNT} move down.`
}

/** Status text for a division on the ladder sheet. */
export function ladderStatus(d: number, current: number): string {
  if (d < current) return "You've already moved past this league."
  if (d === current) {
    if (isTopDivision(d)) return `You're in the top league. Stay out of the bottom ${DEMOTE_COUNT} to keep your spot.`
    return `This is your league. Finish in the top ${PROMOTE_COUNT} this week to move up.`
  }
  const steps = d - current
  return steps === 1
    ? `The next league up. Finish in the top ${PROMOTE_COUNT} this week to get here.`
    : `${steps} leagues above yours. You can move up one league each week.`
}

/* ---------- Rivals ---------- */

const BIOS = [
  'Tracks every purchase in a spreadsheet.',
  'Saves half of every birthday gift.',
  'Uses coupons at the grocery store.',
  'Sells lemonade on summer weekends.',
  'Keeps savings in a jar on the dresser.',
  'Checks every receipt before leaving the store.',
  'Compares prices before buying anything.',
  'Is learning how compound interest works.',
  'Waits for free shipping before ordering online.',
  'Puts part of each allowance into savings.',
  'Collects coins from different years.',
  'Is building an emergency fund.',
  'Packs lunch to save money.',
  "Walks two neighbors' dogs after school.",
  'Keeps one jar for saving and one for spending.',
  'Checks the clearance rack first.',
  'Is saving up for a new bike.',
  'Can split a restaurant bill in their head.',
]

export const rivalBio = (name: string) => pickBy(BIOS, `bio|${name}`)

const STATUSES = [
  'Studying',
  'Practicing',
  'Finishing a lesson',
  'Reviewing notes',
  'Comparing prices',
  'Reading the fine print',
  'Working on a budget',
  'Saving for a bike',
  'Counting change',
  'Doing math homework',
  'Taking a quiz',
  'Checking a receipt',
]

const NAP_STATUSES = ['Taking a break', 'Offline', 'Away', 'At practice']

/** One short line under a rival's name. Changes each day so the board doesn't look frozen. */
export function rivalStatus(id: string, weekKey: string, dayIndex: number, recentGain: number): string {
  if (recentGain >= 25) return 'Very active today'
  if (recentGain <= 0) return pickBy(NAP_STATUSES, `nap|${weekKey}|${id}|${dayIndex}`)
  return pickBy(STATUSES, `st|${weekKey}|${id}|${dayIndex}`)
}

/** How a rival plays the week, from the shape of their XP curve. */
export function rivalStyle(curve: number): { label: string } {
  const c = safe(curve, 1)
  if (c < 0.9) return { label: 'Earns most XP early in the week' }
  if (c > 1.35) return { label: 'Earns most XP near the end of the week' }
  return { label: 'Earns XP at a steady pace' }
}

/** One line of news above the leaderboard. */
export function rivalReport(opts: { hotName?: string; hotGain: number; everyoneZero: boolean; seed: string }): string {
  if (opts.everyoneZero) {
    return pickBy(['New week. Everyone starts at 0 XP.', 'No one has earned XP yet this week.'], opts.seed)
  }
  if (opts.hotName && opts.hotGain >= 10) {
    const g = number(opts.hotGain)
    return pickBy([`${opts.hotName} earned ${g} XP in the last 12 hours.`, `${opts.hotName} picked up ${g} XP in the last 12 hours.`], opts.seed)
  }
  return pickBy(['No rival has earned much XP in the last 12 hours.', 'The board has been quiet for the last 12 hours.'], opts.seed)
}

/* ---------- Your week ---------- */

export type YouMessage = {
  tone: 'promote' | 'safe' | 'demote'
  title: string
  body: string
  /** Progress toward the next line to cross (promotion zone or safety). */
  goal?: { current: number; target: number; label: string }
}

/**
  The "here's where you stand" message. `rows` must be sorted by rank.
  Ties go to you, so to pass someone you need to match their XP.
*/
export function youMessage(rows: { name: string; xp: number; isYou: boolean; rank: number }[], division: number): YouMessage | null {
  const total = rows.length
  const youIdx = rows.findIndex((r) => r.isYou)
  if (youIdx < 0 || total === 0) return null
  const you = rows[youIdx]
  const above = rows[youIdx - 1]
  const below = rows[youIdx + 1]
  const canPromote = !isTopDivision(division)
  const canDemote = !isBottomDivision(division)
  const promoteLine = Math.min(PROMOTE_COUNT, total)
  const safeLine = total - DEMOTE_COUNT

  if (you.rank === 1) {
    const leadBy = below ? Math.max(0, you.xp - below.xp) : 0
    if (!canPromote) {
      return {
        tone: 'promote',
        title: 'First place in the top league',
        body:
          below && leadBy > 0
            ? `${xpText(leadBy)} ahead of ${below.name}.`
            : below
              ? `Tied with ${below.name}, and ties go to you.`
              : 'This is the top league.',
      }
    }
    return {
      tone: 'promote',
      title: "You're in first",
      body:
        below && leadBy > 0
          ? `${xpText(leadBy)} ahead of ${below.name}. Stay in the top ${PROMOTE_COUNT} until Monday to move up.`
          : below
            ? `${below.name} is right behind you. Stay in the top ${PROMOTE_COUNT} until Monday to move up.`
            : `Stay in the top ${PROMOTE_COUNT} until Monday to move up.`,
    }
  }

  if (canPromote && you.rank <= promoteLine) {
    const gap = above ? above.xp - you.xp : 0
    return {
      tone: 'promote',
      title: 'Promotion zone',
      body: above ? `Stay in the top ${PROMOTE_COUNT} to move up. ${xpText(gap)} more passes ${above.name}.` : `Stay in the top ${PROMOTE_COUNT} to move up.`,
    }
  }

  if (canDemote && you.rank > safeLine && safeLine >= 1) {
    const target = rows[safeLine - 1]
    const need = Math.max(1, target.xp - you.xp)
    return {
      tone: 'demote',
      title: 'Demotion zone',
      body: `Earn ${xpText(need)} to get out of the bottom ${DEMOTE_COUNT}. That's ${lessonsFor(need)}.`,
      goal: { current: you.xp, target: target.xp, label: 'Progress out of the demotion zone' },
    }
  }

  if (canPromote) {
    const target = rows[promoteLine - 1]
    const need = Math.max(1, target.xp - you.xp)
    return {
      tone: 'safe',
      title: `${ordinal(you.rank)} place`,
      body: `${xpText(need)} more puts you in the top ${PROMOTE_COUNT}. That's ${lessonsFor(need)}.`,
      goal: { current: you.xp, target: target.xp, label: `Progress to the top ${PROMOTE_COUNT}` },
    }
  }

  const gap = above ? above.xp - you.xp : 0
  return {
    tone: 'safe',
    title: `${ordinal(you.rank)} place`,
    body: above ? `You're out of the demotion zone. ${xpText(Math.max(1, gap))} more passes ${above.name}.` : "You're out of the demotion zone.",
  }
}

/* ---------- Last week's result ---------- */

export function resultCopy(r: { outcome: LeagueOutcome; rank: number; from: number; to: number; weekKey: string }): {
  title: string
  body: string
  button: string
} {
  const finished = `You finished ${ordinal(r.rank)} last week.`
  if (r.outcome === 'promoted') {
    return {
      title: `Promoted to ${leagueName(r.to)}!`,
      body: `${finished} You moved up from the ${leagueName(r.from)}.`,
      button: 'Continue',
    }
  }
  if (r.outcome === 'demoted') {
    return {
      title: `Moved down to ${leagueName(r.to)}`,
      body: `${finished} Finish in the top ${PROMOTE_COUNT} this week to move back up.`,
      button: 'Got it',
    }
  }
  if (isTopDivision(r.to) && r.rank <= PROMOTE_COUNT) {
    return {
      title: `Still in ${leagueName(r.to)}`,
      body: `${finished} This is the highest league.`,
      button: 'Got it',
    }
  }
  if (isTopDivision(r.to)) {
    return {
      title: `Still in ${leagueName(r.to)}`,
      body: `${finished} Stay out of the bottom ${DEMOTE_COUNT} to keep your spot.`,
      button: 'Got it',
    }
  }
  return {
    title: `Still in ${leagueName(r.to)}`,
    body: `${finished} Finish in the top ${PROMOTE_COUNT} this week to move up.`,
    button: 'Got it',
  }
}

/** Every string pool above, for the no-em-dash test. */
export const ALL_COPY_POOLS: readonly (readonly string[])[] = [Object.values(FACTS), BIOS, STATUSES, NAP_STATUSES]
