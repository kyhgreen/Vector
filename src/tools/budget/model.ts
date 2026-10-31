/*
  Budget Builder data: the saved shape, age-aware starter presets, and the
  small bits of math all three tabs share. No React in here, so it's easy
  to test (see model.test.ts).

  Everything is saved with useToolState('budget'). Old or broken saves are
  repaired by normalize(), so the screen never sees NaN or a missing field.
*/
import type { ButtonColor } from '../../components/Button'
import type { TierId } from '../../content/types'
import { addDays, dayKey, parseDay, type DayKey } from '../../lib/dates'
import { money, moneyShort } from '../../lib/format'

export type Tab = 'split' | 'budget' | 'tracker'
export type Period = 'month' | 'week'
export type Group = 'needs' | 'wants' | 'savings'

export interface IncomeLine {
  id: string
  name: string
  amount: number
}

export interface Category {
  id: string
  name: string
  amount: number
  group: Group
}

export interface Expense {
  id: string
  amount: number
  categoryId: string
  /** Snapshot of the category, so old spending still makes sense after a rename or delete. */
  categoryName: string
  group: Group
  note: string
  day: DayKey
  /** When it was logged, for newest-first sorting. */
  at: number
}

export interface SplitResult {
  income: number
  period: Period
  at: number
}

export interface SplitState {
  income: number
  period: Period
  /** The last thing the player calculated. Null until they press Calculate. */
  result: SplitResult | null
}

export interface BudgetData {
  v: 1
  tab: Tab
  split: SplitState
  income: IncomeLine[]
  categories: Category[]
  expenses: Expense[]
  /** Fingerprint of income + categories at the last Save (for the "changed since" hint). */
  savedSig: string | null
  savedAt: number | null
  lastCategoryId: string | null
}

export const TABS: Tab[] = ['split', 'budget', 'tracker']
export const GROUP_ORDER: Group[] = ['needs', 'wants', 'savings']
export const MAX_AMOUNT = 1_000_000
export const MAX_EXPENSES = 600
export const WEEKS_PER_MONTH = 52 / 12

/* ---------- Groups ---------- */

export interface GroupInfo {
  id: Group
  name: string
  /** Share of income in the 50/30/20 rule. */
  pct: number
  color: ButtonColor
  /** Donut color. Chart slots, so it matches the other charts in the app. */
  chart: string
  tagline: string
}

export const GROUPS: Record<Group, GroupInfo> = {
  needs: {
    id: 'needs',
    name: 'Needs',
    pct: 0.5,
    color: 'blue',
    chart: 'var(--chart-1)',
    tagline: 'Must-haves',
  },
  wants: {
    id: 'wants',
    name: 'Wants',
    pct: 0.3,
    color: 'orange',
    chart: 'var(--chart-2)',
    tagline: 'Nice-to-haves',
  },
  savings: {
    id: 'savings',
    name: 'Savings',
    pct: 0.2,
    color: 'green',
    chart: 'var(--chart-4)',
    tagline: 'Goals and emergencies',
  },
}

/* ---------- Age-aware presets ---------- */

/** Example items for the Quick Split rows. */
export const SPLIT_EXAMPLES: Record<TierId, Record<Group, string[]>> = {
  1: {
    needs: ['School lunch', 'Bus fare', 'School supplies'],
    wants: ['Snacks', 'Video games', 'Movies with friends'],
    savings: ['Goal jar', 'New bike fund', 'Emergency fund'],
  },
  2: {
    needs: ['Gas or bus pass', 'Phone bill', 'Work clothes', 'Car insurance'],
    wants: ['Eating out', 'Concerts', 'Streaming', 'New sneakers'],
    savings: ['Emergency fund', 'Car fund', 'College or first apartment'],
  },
}

/** Extra honesty for younger players, whose big needs are usually covered at home. */
export const NEEDS_NOTE: Record<TierId, string> = {
  1: 'Rent and groceries are usually covered at home.',
  2: 'Once you move out, rent goes here too.',
}

export const QUICK_FILLS: Record<TierId, Record<Period, { label: string; amount: number }[]>> = {
  1: {
    month: [
      { label: 'Allowance', amount: 40 },
      { label: 'Chores', amount: 80 },
      { label: 'Birthday month', amount: 150 },
    ],
    week: [
      { label: 'Allowance', amount: 10 },
      { label: 'Chores', amount: 20 },
      { label: 'Pet sitting', amount: 35 },
    ],
  },
  2: {
    month: [
      { label: 'Weekend shifts', amount: 400 },
      { label: 'Part-time job', amount: 800 },
      { label: 'Summer job', amount: 1600 },
    ],
    week: [
      { label: 'Babysitting', amount: 60 },
      { label: 'Part-time job', amount: 180 },
      { label: 'Summer job', amount: 400 },
    ],
  },
}

export const INCOME_PRESETS: Record<TierId, string[]> = {
  1: ['Allowance', 'Gifts', 'Chores', 'Job'],
  2: ['Job', 'Allowance', 'Gifts', 'Odd jobs'],
}

export const CATEGORY_IDEAS: Record<TierId, Record<Group, string[]>> = {
  1: {
    needs: ['School lunch', 'Bus fare', 'School supplies', 'Field trips', 'Haircuts'],
    wants: ['Snacks', 'Games', 'Movies', 'Collectibles', 'Gifts for friends', 'Music'],
    savings: ['Goal jar', 'Rainy-day fund', 'Bike fund', 'Big trip fund'],
  },
  2: {
    needs: ['Phone bill', 'Gas', 'Bus pass', 'Car insurance', 'Lunch', 'Work clothes', 'Groceries'],
    wants: ['Eating out', 'Streaming', 'Games', 'Concerts', 'Clothes', 'Hobbies', 'Gifts'],
    savings: ['Emergency fund', 'Car fund', 'College fund', 'Investing', 'First apartment'],
  },
}

export const NOTE_PLACEHOLDER: Record<TierId, string> = {
  1: 'Like "snacks after practice"',
  2: 'Like "lunch before my shift"',
}

/*
  Starter budgets leave a little money unassigned on purpose, so the very
  first thing a player does is plan those last dollars and reach $0 left
  to assign themselves.
*/
const STARTERS: Record<TierId, { split: number; income: [string, number][]; categories: [Group, string, number][] }> = {
  1: {
    split: 40,
    income: [['Allowance', 40]],
    categories: [
      ['needs', 'School lunch', 10],
      ['needs', 'Bus fare', 4],
      ['wants', 'Snacks', 6],
      ['wants', 'Games', 6],
      ['savings', 'Goal jar', 8],
    ],
  },
  2: {
    split: 800,
    income: [['Job', 600]],
    categories: [
      ['needs', 'Phone bill', 40],
      ['needs', 'Gas', 60],
      ['needs', 'Lunch', 80],
      ['wants', 'Eating out', 80],
      ['wants', 'Streaming', 25],
      ['wants', 'Clothes', 60],
      ['savings', 'Emergency fund', 100],
      ['savings', 'Car fund', 80],
    ],
  },
}

/** The example budget. Ids are stable so the screen doesn't reshuffle before the first edit. */
export function starterBudget(tier: TierId): Pick<BudgetData, 'income' | 'categories'> {
  const s = STARTERS[tier]
  return {
    income: s.income.map(([name, amount], i) => ({ id: `s${tier}-i${i}`, name, amount })),
    categories: s.categories.map(([group, name, amount], i) => ({ id: `s${tier}-c${i}`, name, amount, group })),
  }
}

/**
  The example for "Start over". Example ids are fixed, so one is reused only if
  nothing under it was ever called something else. Otherwise spending logged
  under a renamed line ("Games" renamed to "Robux") would quietly move back to
  the example's line.
*/
export function starterForReset(d: Pick<BudgetData, 'categories' | 'expenses'>, tier: TierId): Pick<BudgetData, 'income' | 'categories'> {
  const ex = starterBudget(tier)
  const key = (s: string) => s.trim().toLowerCase()
  const reusable = (c: Category) =>
    d.categories.every((o) => o.id !== c.id || (o.group === c.group && key(o.name) === key(c.name))) &&
    d.expenses.every((e) => e.categoryId !== c.id || key(e.categoryName) === key(c.name))
  return { income: ex.income, categories: ex.categories.map((c) => (reusable(c) ? c : { ...c, id: uid('c') })) }
}

export function freshData(tier: TierId): BudgetData {
  return {
    v: 1,
    tab: 'split',
    split: { income: STARTERS[tier].split, period: 'month', result: null },
    ...starterBudget(tier),
    expenses: [],
    savedSig: null,
    savedAt: null,
    lastCategoryId: null,
  }
}

/* ---------- Repairing saved data ---------- */

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown, max = 60) => (typeof v === 'string' ? v.slice(0, max) : '')
const isGroup = (v: unknown): v is Group => v === 'needs' || v === 'wants' || v === 'savings'
const isPeriod = (v: unknown): v is Period => v === 'month' || v === 'week'
const isTab = (v: unknown): v is Tab => v === 'split' || v === 'budget' || v === 'tracker'
const isDay = (v: unknown): v is DayKey => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)

export const round2 = (n: number) => Math.round(n * 100) / 100

/** Any number in, a safe money amount out: finite, 0 or more, capped, rounded to cents. */
export function cleanAmount(n: unknown): number {
  const v = typeof n === 'number' ? n : typeof n === 'string' ? parseFloat(n) : NaN
  if (!Number.isFinite(v) || v <= 0) return 0
  return round2(Math.min(MAX_AMOUNT, v))
}

function normIncome(v: unknown): IncomeLine[] {
  if (!isObj(v) || typeof v.id !== 'string') return []
  return [{ id: v.id, name: str(v.name, 28), amount: cleanAmount(v.amount) }]
}

function normCategory(v: unknown): Category[] {
  if (!isObj(v) || typeof v.id !== 'string' || !isGroup(v.group)) return []
  return [{ id: v.id, name: str(v.name, 28), amount: cleanAmount(v.amount), group: v.group }]
}

function normExpense(v: unknown): Expense[] {
  if (!isObj(v) || typeof v.id !== 'string' || !isDay(v.day) || !isGroup(v.group)) return []
  const amount = cleanAmount(v.amount)
  if (amount <= 0) return []
  const at = typeof v.at === 'number' && Number.isFinite(v.at) ? v.at : parseDay(v.day).getTime()
  return [{ id: v.id, amount, categoryId: str(v.categoryId, 80), categoryName: str(v.categoryName, 28), group: v.group, note: str(v.note, 40), day: v.day, at }]
}

function normSplit(v: unknown, tier: TierId): SplitState {
  const fallback = freshData(tier).split
  if (!isObj(v)) return fallback
  const r = v.result
  const result: SplitResult | null =
    isObj(r) && cleanAmount(r.income) > 0 && isPeriod(r.period) ? { income: cleanAmount(r.income), period: r.period, at: typeof r.at === 'number' && Number.isFinite(r.at) ? r.at : 0 } : null
  return {
    income: typeof v.income === 'number' ? cleanAmount(v.income) : fallback.income,
    period: isPeriod(v.period) ? v.period : 'month',
    result,
  }
}

/**
  Turns whatever is saved (or nothing) into complete, valid budget data.
  Missing pieces get the age-aware starter values; an empty list the player
  made on purpose stays empty.
*/
export function normalize(raw: unknown, tier: TierId): BudgetData {
  if (!isObj(raw)) return freshData(tier)
  const starter = starterBudget(tier)
  return {
    v: 1,
    tab: isTab(raw.tab) ? raw.tab : 'split',
    split: normSplit(raw.split, tier),
    income: Array.isArray(raw.income) ? raw.income.flatMap(normIncome) : starter.income,
    categories: Array.isArray(raw.categories) ? raw.categories.flatMap(normCategory) : starter.categories,
    expenses: Array.isArray(raw.expenses) ? raw.expenses.flatMap(normExpense).slice(0, MAX_EXPENSES) : [],
    savedSig: typeof raw.savedSig === 'string' ? raw.savedSig : null,
    savedAt: typeof raw.savedAt === 'number' && Number.isFinite(raw.savedAt) ? raw.savedAt : null,
    lastCategoryId: typeof raw.lastCategoryId === 'string' ? raw.lastCategoryId : null,
  }
}

/* ---------- Math ---------- */

const sum = (ns: number[]) => round2(ns.reduce((a, n) => a + (Number.isFinite(n) ? n : 0), 0))

export interface Totals {
  income: number
  byGroup: Record<Group, number>
  assigned: number
  /** income minus everything assigned. Can be negative. */
  left: number
}

export function totals(d: Pick<BudgetData, 'income' | 'categories'>): Totals {
  const byGroup: Record<Group, number> = { needs: 0, wants: 0, savings: 0 }
  for (const g of GROUP_ORDER) byGroup[g] = sum(d.categories.filter((c) => c.group === g).map((c) => c.amount))
  const income = sum(d.income.map((l) => l.amount))
  const assigned = sum(GROUP_ORDER.map((g) => byGroup[g]))
  return { income, byGroup, assigned, left: round2(income - assigned) }
}

export type LeftState = 'empty' | 'zero' | 'under' | 'over'

export function leftState(t: Totals): LeftState {
  if (t.income <= 0 && t.assigned <= 0) return 'empty'
  if (Math.abs(t.left) < 0.005) return 'zero'
  return t.left > 0 ? 'under' : 'over'
}

/** Fingerprint of the plan, to tell if it changed since the last Save. */
export function signature(d: Pick<BudgetData, 'income' | 'categories'>): string {
  return JSON.stringify([d.income.map((l) => [l.name, l.amount]), d.categories.map((c) => [c.group, c.name, c.amount])])
}

/** Money with cents only when there are cents: $12, $4.50. */
export function fmt(n: number): string {
  if (!Number.isFinite(n)) return '$0'
  const cents = Math.abs(Math.round(n * 100)) % 100 !== 0
  return money(n, { cents })
}

/** For tight spots like the middle of a donut: $1.2M instead of $1,200,000. */
export function fmtShort(n: number): string {
  return Number.isFinite(n) && Math.abs(n) >= 100_000 ? moneyShort(n) : fmt(n)
}

/** "50%" from 0.5. Never NaN. */
export function pctText(fraction: number): string {
  return Number.isFinite(fraction) ? `${Math.round(fraction * 100)}%` : '0%'
}

let seq = 0
/** Short unique id. (crypto.randomUUID isn't available on plain-http LAN previews.) */
export function uid(prefix = 'x'): string {
  seq = (seq + 1) % 1_000_000
  return `${prefix}${Date.now().toString(36)}${seq.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`
}

export const displayName = (name: string, fallback = 'Unnamed') => name.trim() || fallback

/* ---------- Dates ---------- */

export type MonthKey = string // "2026-10"

export const monthOf = (day: DayKey): MonthKey => day.slice(0, 7)

export function monthLabel(month: MonthKey): string {
  const [y, m] = month.split('-').map(Number)
  if (!y || !m) return 'This month'
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function dayLabel(day: DayKey, today: DayKey = dayKey()): string {
  if (day === today) return 'Today'
  if (day === addDays(today, -1)) return 'Yesterday'
  return parseDay(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Days left in the month after today (0 on the last day). */
export function daysLeftInMonth(now: Date = new Date()): number {
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return Math.max(0, last - now.getDate())
}

/* ---------- Tracker ---------- */

export interface CategoryProgress {
  key: string
  name: string
  group: Group
  planned: number
  spent: number
  /** True for categories that were deleted from My Budget but still have spending. */
  orphan: boolean
}

/**
  Spent vs planned for each category in a month. Spending on categories
  that no longer exist is grouped by its old name so nothing disappears.
*/
export function categoryProgress(categories: Category[], expenses: Expense[]): CategoryProgress[] {
  const spent = new Map<string, number>()
  const orphans = new Map<string, CategoryProgress>()
  const ids = new Set(categories.map((c) => c.id))
  for (const e of expenses) {
    if (ids.has(e.categoryId)) {
      spent.set(e.categoryId, (spent.get(e.categoryId) ?? 0) + e.amount)
    } else {
      const key = `old:${e.group}:${e.categoryName.toLowerCase()}`
      const o = orphans.get(key) ?? { key, name: displayName(e.categoryName), group: e.group, planned: 0, spent: 0, orphan: true }
      o.spent = round2(o.spent + e.amount)
      orphans.set(key, o)
    }
  }
  const rows: CategoryProgress[] = categories.map((c) => ({
    key: c.id,
    name: displayName(c.name),
    group: c.group,
    planned: c.amount,
    spent: round2(spent.get(c.id) ?? 0),
    orphan: false,
  }))
  return [...rows, ...orphans.values()]
}

/** How full a progress bar should be (0..1), safe for a $0 plan. */
export function fillRatio(spent: number, planned: number): number {
  if (planned > 0) return Math.max(0, Math.min(1, spent / planned))
  return spent > 0 ? 1 : 0
}

export const isOver = (spent: number, planned: number) => round2(spent - planned) > 0.004
