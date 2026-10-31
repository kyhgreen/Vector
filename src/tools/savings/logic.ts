/*
  Savings Goals: data shape, cleanup for old/odd saves, and the "when will I
  get there?" math. Kept free of React so it is easy to test.
*/
import type { ButtonColor } from '../../components/Button'
import { periodsToGoal } from '../../lib/finance'
import { duration, money, plural } from '../../lib/format'
import { dayKey, daysBetween, parseDay, type DayKey } from '../../lib/dates'

export type GoalColor = Extract<ButtonColor, 'orange' | 'blue' | 'purple' | 'pink' | 'teal' | 'yellow'>

export interface Goal {
  id: string
  name: string
  emoji: string
  color: GoalColor
  target: number
  saved: number
  /** How much goes in each week. */
  weekly: number
  createdDay: DayKey
  /** Set the day `saved` first reached `target`. */
  doneDay: DayKey | null
}

export interface SavingsData {
  goals: Goal[]
}

export const INITIAL_SAVINGS: SavingsData = { goals: [] }

export const GOAL_COLORS: GoalColor[] = ['orange', 'blue', 'purple', 'pink', 'teal', 'yellow']

/** Anything bigger than this is probably a typo (or a yacht). */
export const MAX_AMOUNT = 1_000_000
export const MAX_NAME = 40

export const GOAL_EMOJIS: { emoji: string; label: string }[] = [
  { emoji: '🎮', label: 'Video game' },
  { emoji: '👟', label: 'Sneakers' },
  { emoji: '📱', label: 'Phone' },
  { emoji: '🎧', label: 'Headphones' },
  { emoji: '🚲', label: 'Bike' },
  { emoji: '🚗', label: 'Car' },
  { emoji: '💻', label: 'Laptop' },
  { emoji: '🎸', label: 'Guitar' },
  { emoji: '✈️', label: 'Trip' },
  { emoji: '🎁', label: 'Gift for someone' },
  { emoji: '🛟', label: 'Emergency fund' },
  { emoji: '🐷', label: 'Just saving' },
]

export const DEFAULT_EMOJI = '🐷'

export interface Idea {
  emoji: string
  name: string
  target: number
}

/** Starter ideas for ages 11 to 14: allowance-sized. */
export const IDEAS_YOUNGER: Idea[] = [
  { emoji: '🎮', name: 'New video game', target: 60 },
  { emoji: '👟', name: 'New sneakers', target: 90 },
  { emoji: '🎧', name: 'Headphones', target: 50 },
  { emoji: '🚲', name: 'Bike upgrade', target: 150 },
]

/** Starter ideas for ages 15 to 18: first-job-sized. */
export const IDEAS_OLDER: Idea[] = [
  { emoji: '🚗', name: 'First car fund', target: 3000 },
  { emoji: '💻', name: 'Laptop for school', target: 700 },
  { emoji: '🛟', name: 'Emergency fund', target: 500 },
  { emoji: '✈️', name: 'Trip with friends', target: 400 },
]

export const isOlder = (age: number) => age >= 15

export function defaultsFor(age: number) {
  return isOlder(age) ? { target: 500, weekly: 25, chips: [10, 25, 50] } : { target: 60, weekly: 10, chips: [5, 10, 20] }
}

/** Rounds to whole cents so floating point never shows up as $10.000000001. */
export const toCents = (n: number) => Math.round(n * 100) / 100

/** Money with cents only when there are cents: $10, $2.50. */
export function cash(n: number): string {
  const v = Number.isFinite(n) ? toCents(n) : 0
  return money(v, { cents: Math.round(v * 100) % 100 !== 0 })
}

export function newId(): string {
  return `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

const num = (v: unknown, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const clampAmount = (v: unknown) => toCents(Math.min(MAX_AMOUNT, Math.max(0, num(v))))
const isDay = (v: unknown): v is DayKey => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)

/** Makes any saved value safe to render: no NaN, no missing fields, no junk. */
export function sanitize(raw: unknown): SavingsData {
  const list = raw && typeof raw === 'object' && Array.isArray((raw as SavingsData).goals) ? (raw as SavingsData).goals : []
  const goals: Goal[] = []
  const seen = new Set<string>()
  for (const [i, g] of (list as unknown[]).entries()) {
    if (!g || typeof g !== 'object') continue
    const r = g as Partial<Goal>
    // A missing or repeated id gets one based on its position, never a random one: this runs on
    // every render and every save, so a random id would change each time and the buttons would miss.
    const base = typeof r.id === 'string' && r.id ? r.id : `goal-${i}`
    let id = base
    for (let n = 2; seen.has(id); n++) id = `${base}-${n}`
    seen.add(id)
    const target = clampAmount(r.target)
    const saved = clampAmount(r.saved)
    const done = target > 0 && saved >= target
    goals.push({
      id,
      name: typeof r.name === 'string' && r.name.trim() ? r.name.trim().slice(0, MAX_NAME) : 'Untitled goal',
      emoji: typeof r.emoji === 'string' && r.emoji ? r.emoji : DEFAULT_EMOJI,
      color: GOAL_COLORS.includes(r.color as GoalColor) ? (r.color as GoalColor) : GOAL_COLORS[goals.length % GOAL_COLORS.length],
      target,
      saved,
      weekly: clampAmount(r.weekly),
      createdDay: isDay(r.createdDay) ? r.createdDay : dayKey(),
      doneDay: done ? (isDay(r.doneDay) ? r.doneDay : dayKey()) : null,
    })
  }
  return { goals }
}

export const isDone = (g: Pick<Goal, 'target' | 'saved'>) => g.target > 0 && g.saved >= g.target

export function progressOf(g: Pick<Goal, 'target' | 'saved'>): number {
  if (!(g.target > 0)) return 0
  return Math.max(0, Math.min(1, g.saved / g.target))
}

/** "75%". Never says 100% until you are actually there. */
export function percentLabel(g: Pick<Goal, 'target' | 'saved'>): string {
  if (isDone(g)) return '100%'
  if (!(g.target > 0) || !(g.saved > 0)) return '0%'
  // saved * 100 / target, not saved / target * 100: 29 / 50 * 100 is 57.99999999999999.
  return `${Math.min(99, Math.floor((g.saved * 100) / g.target + 1e-9))}%`
}

/** Active goals newest first, then finished ones (most recent win first). */
export function sortGoals(goals: Goal[]): Goal[] {
  const active = goals.filter((g) => !isDone(g)).reverse()
  const done = goals.filter(isDone).sort((a, b) => (b.doneDay ?? '').localeCompare(a.doneDay ?? ''))
  return [...active, ...done]
}

const cents = (n: number) => (Number.isFinite(n) ? Math.round(n * 100) : 0)

/**
  Weeks until the goal, or Infinity if the weekly amount rounds to $0.
  Done in whole cents: in dollars, $2.10 at $0.15 a week comes out to 15 weeks instead of 14.
*/
export const weeksLeft = (g: Pick<Goal, 'target' | 'saved' | 'weekly'>) => periodsToGoal(cents(g.target), cents(g.saved), cents(g.weekly))

/** 20 years. Past this, we stop pretending a date means anything. */
const FAR_WEEKS = 52 * 20

export function etaDate(weeks: number, now: Date = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  d.setDate(d.getDate() + weeks * 7)
  return d
}

/** "Dec 20", "Jan 3, 2027", or "Mar 2029" for far-off dates. */
export function formatDate(d: Date, now: Date = new Date(), far = false): string {
  if (far) return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString('en-US', sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' })
}

/** "9 weeks", "about 6 months", "2 years 3 months". */
export function weeksPhrase(weeks: number): string {
  if (weeks <= 12) return plural(weeks, 'week')
  if (weeks <= 104) {
    const months = Math.round((weeks * 7) / 30.44)
    return `about ${months === 12 ? 'a year' : `${months} months`}`
  }
  return duration(Math.round((weeks * 12) / 52))
}

export type EtaTone = 'done' | 'ok' | 'none' | 'far' | 'empty'

/** The finish-date sentence. Never shows NaN or Infinity. */
export function eta(target: number, saved: number, weekly: number, now: Date = new Date()): { tone: EtaTone; text: string; weeks: number } {
  if (!(cents(target) > 0)) return { tone: 'empty', text: 'Add a price to see a finish date.', weeks: 0 }
  if (cents(saved) >= cents(target)) return { tone: 'done', text: 'You have saved enough for this goal.', weeks: 0 }
  if (!(cents(weekly) > 0)) return { tone: 'none', text: 'Add a weekly amount to see a finish date.', weeks: Infinity }
  const weeks = weeksLeft({ target, saved, weekly })
  if (weeks > FAR_WEEKS) return { tone: 'far', text: `${cash(weekly)} a week takes over 20 years. Try saving more each week.`, weeks }
  const when = formatDate(etaDate(weeks, now), now, weeks > 52)
  return { tone: 'ok', text: `${cash(weekly)} a week gets you there in ${weeksPhrase(weeks)}, around ${when}.`, weeks }
}

/** "At $12 a week you'd finish 2 weeks sooner." Null when it wouldn't help. */
export function speedUpTip(target: number, saved: number, weekly: number): string | null {
  if (!(cents(target) > 0) || cents(saved) >= cents(target) || !(cents(weekly) > 0)) return null
  const now = weeksLeft({ target, saved, weekly })
  if (now < 3 || now > FAR_WEEKS) return null
  const bump = weekly >= 50 ? 10 : weekly >= 20 ? 5 : weekly >= 5 ? 2 : 1
  const faster = weeksLeft({ target, saved, weekly: weekly + bump })
  const diff = now - faster
  if (diff < 1) return null
  return `At ${cash(weekly + bump)} a week you'd finish ${plural(diff, 'week')} sooner.`
}

/** How long a finished goal took, said nicely. */
export function tookPhrase(g: Pick<Goal, 'createdDay' | 'doneDay'>, today: DayKey = dayKey()): string {
  const end = g.doneDay ?? today
  const days = Math.max(0, daysBetween(g.createdDay, end))
  if (days === 0) return 'Same day you started.'
  if (days < 14) return `Took ${plural(days, 'day')}.`
  const weeks = Math.round(days / 7)
  if (weeks <= 104) return `Took ${plural(weeks, 'week')}.`
  return `Took ${duration(Math.round(days / 30.44))}.`
}

export function doneOnPhrase(g: Pick<Goal, 'doneDay'>, now: Date = new Date()): string {
  if (!g.doneDay) return 'Done.'
  return `Done on ${formatDate(parseDay(g.doneDay), now)}.`
}

export interface GoalDraft {
  name: string
  emoji: string
  target: number
  saved: number
  weekly: number
}

/** The first thing stopping the form from saving, written kindly. Null when it's good to go. */
export function draftProblem(d: GoalDraft, mode: 'new' | 'edit'): string | null {
  if (!d.name.trim()) return 'Give the goal a name.'
  // Same rounding the save uses, so a $0.004 price or $89.999 of $90 can't sneak through.
  if (!(toCents(d.target) > 0)) return 'Add a price first.'
  if (mode === 'new' && toCents(d.saved) >= toCents(d.target)) return 'You already have enough saved for this price.'
  return null
}
