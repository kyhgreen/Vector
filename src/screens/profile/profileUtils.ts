/*
  Small helpers shared by the profile screens (profile, badges, settings).
  Everything here is defensive: old saves, empty names, and weird dates all
  turn into plain text instead of "NaN" or "undefined".
*/
import type { ButtonColor } from '../../components/Button'
import { avatarTint } from '../../components/Avatar'
import { BADGES, type Badge } from '../../state/badges'
import { DEFAULT_AVATAR as DEFAULT_AVATAR_ID } from '../../state/constants'
import type { GameData } from '../../state/types'
import { parseDay, type DayKey } from '../../lib/dates'
import { hashString } from '../../lib/random'
import { getTool } from '../../tools/registry'

export const DEFAULT_NAME = 'Money Rookie'
export const DEFAULT_AVATAR: string = DEFAULT_AVATAR_ID
export const NAME_MAX = 20

/** A number that is safe to show: finite and never negative. */
export const safeNum = (n: unknown): number => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, n) : 0)

export function displayName(name: string | undefined | null): string {
  const n = (name ?? '').trim()
  return n || DEFAULT_NAME
}

function safeDate(key: DayKey | undefined | null): Date | null {
  if (!key || typeof key !== 'string') return null
  const d = parseDay(key)
  return Number.isFinite(d.getTime()) ? d : null
}

/** "Joined October 2026" */
export function joinedLabel(key: DayKey | undefined | null): string {
  const d = safeDate(key)
  if (!d) return 'Joined recently'
  return `Joined ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
}

/** "Oct 3, 2026" (or null if the date is junk). */
export function shortDate(key: DayKey | undefined | null): string | null {
  const d = safeDate(key)
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
}

/** "October 3, 2026" */
export function longDate(key: DayKey | undefined | null): string | null {
  const d = safeDate(key)
  return d ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null
}

/* ---------- Avatar color ---------- */

/** Each avatar has its own color (the ring around it), so swapping avatars changes the accent too. */
export function avatarColor(id: string): ButtonColor {
  return avatarTint(id || DEFAULT_AVATAR)
}

/* ---------- Money titles (levels from total XP) ---------- */

export interface Rank {
  xp: number
  title: string
  emoji: string
}

export const RANKS: Rank[] = [
  { xp: 0, title: 'Beginner', emoji: '🌱' },
  { xp: 100, title: 'Coin Counter', emoji: '🪙' },
  { xp: 250, title: 'Budget Builder', emoji: '📒' },
  { xp: 500, title: 'Steady Saver', emoji: '🏦' },
  { xp: 1000, title: 'Interest Earner', emoji: '📈' },
  { xp: 2000, title: 'Investor', emoji: '💼' },
  { xp: 4000, title: 'Money Expert', emoji: '👑' },
]

export function rankFor(xpTotal: number) {
  const xp = safeNum(xpTotal)
  let i = 0
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].xp) i = k
  const rank = RANKS[i]
  const next = RANKS[i + 1]
  const pct = next ? Math.min(1, Math.max(0, (xp - rank.xp) / (next.xp - rank.xp))) : 1
  return { rank, next, pct, toNext: next ? Math.max(0, Math.ceil(next.xp - xp)) : 0, level: i + 1 }
}

/* ---------- Badges ---------- */

/** [current, goal] for a badge, cleaned up so it can always be shown. */
export function badgeProgress(b: Badge, data: GameData): [number, number] {
  try {
    const [cur, goal] = b.progress(data)
    const g = Math.max(1, safeNum(goal))
    return [Math.min(g, Math.floor(safeNum(cur))), g]
  } catch {
    return [0, 1]
  }
}

export function badgeRatio(b: Badge, data: GameData): number {
  const [cur, goal] = badgeProgress(b, data)
  return goal > 0 ? cur / goal : 0
}

export const isBadgeEarned = (b: Badge, data: GameData) => !!data.badges?.[b.id]

export function earnedCount(data: GameData): number {
  return BADGES.filter((b) => isBadgeEarned(b, data)).length
}

/** Earned badges, newest first. */
export function earnedBadges(data: GameData): Badge[] {
  return BADGES.filter((b) => isBadgeEarned(b, data)).sort((a, b) => (data.badges[b.id] ?? '').localeCompare(data.badges[a.id] ?? ''))
}

/** Locked badges, closest to done first. */
export function lockedBadges(data: GameData): Badge[] {
  return BADGES.filter((b) => !isBadgeEarned(b, data))
    .map((b) => ({ b, r: badgeRatio(b, data) }))
    .sort((x, y) => y.r - x.r)
    .map((x) => x.b)
}

/** The profile preview: earned first, then the locked ones you're closest to. */
export function badgePreview(data: GameData, n = 6): Badge[] {
  return [...earnedBadges(data), ...lockedBadges(data)].slice(0, n)
}

const TOOL_FOR_BADGE: Record<string, string> = {
  budget: 'budget',
  goal: 'savings',
  'goal-done': 'savings',
  trade: 'invest',
  diversify: 'invest',
  'diamond-hands': 'invest',
  credit: 'credit',
  debt: 'debt',
  paycheck: 'paycheck',
  habit: 'habit',
}

/** Where to send someone who wants to go earn a badge. */
export function badgeAction(id: string): { to: string; label: string } {
  const toolId = TOOL_FOR_BADGE[id]
  if (toolId) {
    const tool = getTool(toolId)
    return tool ? { to: `/tools/${tool.id}`, label: `Open ${tool.title}` } : { to: '/tools', label: 'Open tools' }
  }
  switch (id) {
    case 'practice-1':
      return { to: '/practice', label: 'Practice' }
    case 'vault':
    case 'vault-interest':
      return { to: '/shop', label: 'Visit the vault' }
    case 'shop':
      return { to: '/shop', label: 'Go shopping' }
    case 'league-up':
      return { to: '/league', label: 'See the league' }
    default:
      return { to: '/learn', label: 'Start a lesson' }
  }
}

const EARNED_LINES = ['Nice work.', 'Well done.', 'Good work.', 'This one stays on your profile.']

/** A short line for an earned badge. Same badge always gets the same line. */
export function earnedLine(id: string): string {
  return EARNED_LINES[hashString(id) % EARNED_LINES.length]
}

/** A nudge for a locked badge, based on how close you are. */
export function nudgeLine(cur: number, goal: number): string {
  const left = Math.max(0, goal - cur)
  if (cur <= 0) return 'Not started yet.'
  if (left <= 0) return 'Done. It shows up after your next lesson.'
  if (left === 1) return 'One more to go.'
  if (cur / goal >= 0.5) return `Over halfway. ${left} to go.`
  return `${left} to go.`
}
