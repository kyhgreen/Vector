/* Habit money math: costs, invested-instead growth, and fun comparisons. */
import { growthByYear, habitCost } from '../../lib/finance'
import { number } from '../../lib/format'
import { RATE_PCT, THINGS, type Thing } from './data'

const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0)

export function habitMath(price: number, perWeek: number, years: number) {
  const p = safe(price)
  const w = safe(perWeek)
  const y = Math.max(1, Math.round(safe(years)))
  const c = habitCost(p, w, y, RATE_PCT)
  const rows = growthByYear(0, c.perYear / 12, RATE_PCT, y)
  return {
    perWeek: safe(c.perWeek),
    perMonth: safe(c.perMonth),
    perYear: safe(c.perYear),
    spent: safe(c.spent),
    invested: safe(c.invested),
    growth: Math.max(0, safe(c.invested) - safe(c.spent)),
    xLabels: rows.map((r) => (r.year === 0 ? 'Now' : `${r.year}y`)),
    spentLine: rows.map((r) => safe(r.contributed)),
    investedLine: rows.map((r) => safe(r.balance)),
  }
}

export interface Equivalent {
  thing: Thing
  /** Rounded count, ready to show. */
  count: number
  /** "6 pairs of sneakers" */
  text: string
}

/** Whole numbers from 3 up, halves below that ("1.5 new bikes"). */
export function roundCount(c: number): number {
  if (!Number.isFinite(c) || c <= 0) return 0
  if (c >= 3) return Math.round(c)
  return Math.max(0.5, Math.round(c * 2) / 2)
}

export function countText(count: number, t: Thing): string {
  const shown = Number.isInteger(count) ? number(count) : count.toFixed(1)
  return `${shown} ${count === 1 ? t.one : t.many}`
}

const make = (thing: Thing, total: number): Equivalent => {
  const count = roundCount(total / thing.price)
  return { thing, count, text: countText(count, thing) }
}

/**
  Picks a few relatable things that `total` dollars could buy: one you could
  buy a stack of, one a handful of, and one big-ticket item. Sorted cheapest first.
*/
export function equivalents(total: number, targets: number[] = [15, 4, 1.5]): Equivalent[] {
  if (!(total > 0)) return []
  const used = new Set<Thing>()
  const out: Equivalent[] = []
  for (const target of targets) {
    let best: Thing | null = null
    let bestScore = Infinity
    for (const t of THINGS) {
      if (used.has(t)) continue
      const c = total / t.price
      if (c < 1) continue
      const score = Math.abs(Math.log(c / target))
      if (score < bestScore) {
        best = t
        bestScore = score
      }
    }
    if (best) {
      used.add(best)
      out.push(make(best, total))
    }
  }
  return out.sort((a, b) => a.thing.price - b.thing.price)
}

/** One big-ticket comparison for a multi-year total (bike or bigger), or null if it's too small. */
export function bigEquivalent(total: number): Equivalent | null {
  const big = THINGS.filter((t) => t.price >= 350 && total / t.price >= 1)
  if (!big.length) return null
  const best = big.reduce((a, b) => (Math.abs(Math.log(total / a.price / 1.5)) <= Math.abs(Math.log(total / b.price / 1.5)) ? a : b))
  return make(best, total)
}

/** "once a week", "3 times a week", "every day", "twice a day" */
export function timesPhrase(perWeek: number): string {
  if (perWeek === 1) return 'once a week'
  if (perWeek === 2) return 'twice a week'
  if (perWeek === 7) return 'every day'
  if (perWeek === 14) return 'twice a day'
  return `${perWeek} times a week`
}
