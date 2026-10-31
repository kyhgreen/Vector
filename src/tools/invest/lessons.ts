/*
  The words: the tip of the moment, jump recaps, and the diversity meter.
  Pure functions, no React. House rules: short, plain, honest, and no em dashes.
*/
import type { ButtonColor } from '../../components/Button'
import { money } from '../../lib/format'
import { pick, rng } from '../../lib/random'
import { ASSET_BY_TICKER, type Asset, type Ticker } from './assets'
import { jumpWord, pctPlain } from './fmt'
import { SCARY_DIP, change, diversity, drawdown, portfolioValue, priceOf, type Diversity, type InvestState } from './sim'

/* ---------- the tip of the moment ---------- */

export interface Lesson {
  id: string
  emoji: string
  title: string
  body: string
}

const TIPS: Omit<Lesson, 'id'>[] = [
  { emoji: '⏳', title: 'Stay in for years', body: 'Nobody can reliably pick the best day to buy. Investors who stay in for many years usually do better.' },
  { emoji: '⚖️', title: 'Growth comes with risk', body: 'Investments that can grow faster can also drop further.' },
  { emoji: '🌎', title: 'Index funds spread risk', body: 'One fund owns hundreds of companies, so one company doing badly has a small effect.' },
  { emoji: '📰', title: 'News is short term', body: 'Headlines can move prices for a few days. Over many years, prices follow company profits.' },
  { emoji: '🐢', title: 'Low risk for money you need soon', body: "Savings and bonds barely move, so they suit money you'll need in the next year or two." },
]

/** The single most useful tip for right now. One tip per screen is plenty. */
export function lessonsFor(s: InvestState): Lesson[] {
  const out: Lesson[] = []
  const total = portfolioValue(s)
  const div = diversity(s)
  const dd = drawdown(s)
  const cashShare = total > 0 ? s.cash / total : 1

  if (div.invested > 0 && dd >= SCARY_DIP) {
    out.push({
      id: 'dip',
      emoji: '🧘',
      title: `Down ${pctPlain(dd)} from your high`,
      body: s.dip?.sold
        ? 'Selling on the way down locked in part of the loss.'
        : 'Selling now locks in the loss. Holding gives it time to recover.',
    })
  }

  if (div.count === 1 && div.top && cashShare < 0.05) {
    const t = div.top.asset
    out.push({
      id: 'one-basket',
      emoji: '🧺',
      title: 'All in one investment',
      body:
        t.ticker === 'TMIX'
          ? 'This fund holds hundreds of companies, which helps. Adding some bonds would make the swings smaller.'
          : t.ticker === 'SAVE'
            ? 'Savings is safe but grows slowly. Over many years, investments that swing more usually grow more.'
            : `Every dollar is in ${t.short}, so if it drops, your whole portfolio drops.`,
    })
  }

  const moon = s.holdings.DMOON
  const moonShare = moon && total > 0 ? (moon.shares * priceOf(s, 'DMOON')) / total : 0
  if (moonShare >= 0.25) {
    out.push({
      id: 'meme',
      emoji: '🎢',
      title: 'Lots of meme coin',
      body: `${pctPlain(moonShare)} of your money is in a meme coin. Its price swings wildly, so only put in what you can afford to lose.`,
    })
  }

  if (div.invested < 1 && s.day >= 30) {
    out.push({
      id: 'idle',
      emoji: '😴',
      title: "Cash doesn't grow",
      body: `After ${s.day} days, your ${money(s.cash)} is still ${money(s.cash)}. Even savings pays 4% a year.`,
    })
  }

  if (out.length === 0) {
    const tip = TIPS[Math.floor(s.day / 30) % TIPS.length]
    out.push({ id: `tip-${tip.emoji}`, ...tip })
  }
  return out.slice(0, 1)
}

/* ---------- jump recap ---------- */

export interface Recap {
  emoji: string
  text: string
  mood: 'up' | 'down' | 'flat'
  change: number
  pct: number
  headlines: number
}

const fill = (lines: string[], r: () => number, amt: string, span: string) => pick(lines, r).replace('{amt}', amt).replace('{span}', span)

const UP_SMALL = ['Up {amt} {span}.']
const UP_BIG = ['Up {amt} {span}.']
const DOWN_SMALL = ['Down {amt} {span}. Small dips are normal.']
const DOWN_BIG = ['Down {amt} {span}. Drops this size happen from time to time.']
const CASH_LINES = ["Nothing moved. Cash that isn't invested doesn't grow."]

/** What happened during the last time jump. Null before the first one. */
export function recapFor(s: InvestState): Recap | null {
  const j = s.lastJump
  if (!j) return null
  const now = portfolioValue(s)
  const diff = now - j.value
  const p = change(now, j.value)
  const r = rng(`${s.seed}:recap:${s.day}`)
  const span = jumpWord(j.days)
  const headlines = s.news.filter((n) => n.day > j.fromDay).length
  const invested = now - s.cash
  if (invested < 1 && Math.abs(diff) < 0.5) {
    return { emoji: '😴', text: pick(CASH_LINES, r), mood: 'flat', change: 0, pct: 0, headlines }
  }
  if (Math.abs(p) < 0.0005) {
    return { emoji: '😐', text: `Barely moved ${span}.`, mood: 'flat', change: diff, pct: p, headlines }
  }
  const amt = Math.abs(diff) >= 100 ? money(Math.abs(diff)) : money(Math.abs(diff), { cents: true })
  if (p > 0) {
    const big = p >= 0.03
    return { emoji: big ? '🚀' : '📈', text: fill(big ? UP_BIG : UP_SMALL, r, amt, span), mood: 'up', change: diff, pct: p, headlines }
  }
  const big = p <= -0.03
  return { emoji: big ? '🎢' : '📉', text: fill(big ? DOWN_BIG : DOWN_SMALL, r, amt, span), mood: 'down', change: diff, pct: p, headlines }
}

/* ---------- the diversity meter ---------- */

export const DIVERSITY_LABELS: Record<Diversity['level'], { title: string; color: ButtonColor }> = {
  0: { title: 'Nothing invested', color: 'gray' },
  1: { title: 'All in one place', color: 'red' },
  2: { title: 'A little spread out', color: 'orange' },
  3: { title: 'Fairly spread out', color: 'teal' },
  4: { title: 'Well spread out', color: 'green' },
}

/** The line after the meter's label. Reads as "<label>. <line>" */
export function diversityLine(d: Diversity): string {
  if (d.level === 0 || !d.top) return 'Buy a few different things to fill this up.'
  const name = d.top.asset.short
  if (d.level === 1) return d.count <= 1 ? `It's all in ${name}.` : `Almost all of it is in ${name}.`
  if (d.level === 2) return `${capital(name)} is ${pctPlain(d.topShare)} of it, so a drop there hurts the total.`
  if (d.level === 3) return `Your biggest is ${name}, at ${pctPlain(d.topShare)}.`
  return 'A drop in one holding has only a small effect on the total.'
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Groups for the risk mix donut (the chart has four colors, so four groups). */
export function riskMix(s: InvestState): { name: string; value: number }[] {
  const groups = [
    { name: 'Cash', value: s.cash },
    { name: 'Low risk', value: 0 },
    { name: 'Whole market', value: 0 },
    { name: 'Risky picks', value: 0 },
  ]
  for (const [t, h] of Object.entries(s.holdings) as [Ticker, { shares: number }][]) {
    const a: Asset = ASSET_BY_TICKER[t]
    const v = h.shares * priceOf(s, t)
    const g = a.risk <= 1 ? 1 : a.risk === 2 ? 2 : 3
    groups[g].value += v
  }
  return groups.map((g) => ({ ...g, value: Math.max(0, g.value) }))
}
