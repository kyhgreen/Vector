/*
  The Fakeland market engine. Pure functions, no React.

  Every simulated day gets its own random generator seeded from
  `${seed}:${day}`, so the same seed always replays the exact same market.
  Prices follow a geometric random walk (daily steps) that is nudged by a
  shared "whole market" shock, occasional news, and the odd multi-week
  slide (a "correction") followed by a slow recovery.

  State is saved on the device through useToolState('invest'), so it stays
  small: the price history is down-sampled as it grows.
*/
import { gaussian, pick, rng } from '../../lib/random'
import { ASSETS, COMPANY_NEWS, MARKET_NEWS, SLIDE_END, SLIDE_START, TICKERS, isTicker, type Asset, type Ticker } from './assets'

export const START_CASH = 10_000
export const DAYS_PER_YEAR = 365
/** Fifty pretend years is plenty. After that the time machine needs a nap. */
export const MAX_DAY = DAYS_PER_YEAR * 50
/** Max saved chart points before the history gets thinned out. */
export const HISTORY_MAX = 240
export const NEWS_MAX = 40
/** A drop this big from the high, held without selling, earns Steady Hands. */
export const DIP_LINE = 0.1
/** A drop this big shows the "deep breaths" teaching moment. */
export const SCARY_DIP = 0.15
/** Holding at least this many different things (worth $1+ each) earns the diversify badge. */
export const DIVERSE_COUNT = 4
export const DEFAULT_SEED = 20_261_118

const VERSION = 1
const MARKET_NEWS_ODDS = 1 / 60
const MIN_PRICE = 0.0001
const MAX_PRICE = 10_000_000
const N = ASSETS.length

/** Average log-change from one news jump, across a pool (the jump wobbles 0.7x to 1.3x). */
function avgLogJump(pool: readonly { move: number }[]): number {
  if (!pool.length) return 0
  let sum = 0
  let count = 0
  for (const t of pool) {
    for (let k = 0; k <= 12; k++) {
      sum += Math.log(1 + t.move * (0.7 + (0.6 * k) / 12))
      count++
    }
  }
  return sum / count
}

/*
  News would quietly drag prices away from their stated growth (a -20% day
  needs a +25% day to undo it). These tiny per-day nudges cancel that out, so
  each asset's `drift` really is its typical growth per year.
*/
const MARKET_DRAG = MARKET_NEWS_ODDS * avgLogJump(MARKET_NEWS)
const NEWS_DRAG = ASSETS.map((a) => a.newsOdds * avgLogJump(COMPANY_NEWS[a.ticker] ?? []))

export interface Holding {
  shares: number
  /** Dollars you paid for the shares you still own. */
  cost: number
}
export type Holdings = Partial<Record<Ticker, Holding>>

/** One saved chart point: day, portfolio value, and every price (TICKERS order). */
export interface Point {
  d: number
  v: number
  p: number[]
}

export interface NewsItem {
  id: number
  day: number
  emoji: string
  text: string
  /** null = news about the whole market. */
  ticker: Ticker | null
  /** The price jump it caused (0.12 = +12%). 0 = no single number to show. */
  move: number
}

export interface Slide {
  phase: 'down' | 'up'
  left: number
  /** Extra log-return per day for the whole market (scaled by each asset's beta). */
  perDay: number
  len: number
  total: number
}

/** An active drawdown of at least DIP_LINE from the portfolio's high. */
export interface Dip {
  depth: number
  /** True if you sold something risky while it was going on. */
  sold: boolean
}

/** Snapshot from right before the last time jump (for "this week" changes). */
export interface Jump {
  days: number
  fromDay: number
  prices: number[]
  value: number
}

export interface InvestState {
  v: typeof VERSION
  seed: number
  /** Days since the start. Day 0 is "Day 1". */
  day: number
  cash: number
  /** Current prices, in TICKERS order. */
  prices: number[]
  holdings: Holdings
  history: Point[]
  /** History keeps every `stride`-th day. Doubles each time it gets thinned. */
  stride: number
  /** Newest first. */
  news: NewsItem[]
  newsSeq: number
  slide: Slide | null
  /** Day the market last finished a slide (or the start). */
  calmSince: number
  /** Highest portfolio value so far. */
  peak: number
  dip: Dip | null
  /** Biggest drop from a high so far (0.18 = 18%). */
  worstDrop: number
  trades: number
  lastJump: Jump | null
  /** One-time moments. These survive a reset so they only fire once. */
  flags: { diversified: boolean; heldDip: boolean }
}

/* ---------- small helpers ---------- */

const fin = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)
export const round2 = (n: number) => Math.round(n * 100) / 100
const sig = (n: number) => Number(n.toPrecision(6))
const clampPrice = (p: number) => (fin(p) ? Math.min(MAX_PRICE, Math.max(MIN_PRICE, p)) : MIN_PRICE)
export const indexOf = (t: Ticker) => TICKERS.indexOf(t)

export function priceOf(s: InvestState, t: Ticker): number {
  return s.prices[indexOf(t)] ?? 0
}

export function portfolioValue(s: InvestState): number {
  let v = s.cash
  for (const t of TICKERS) {
    const h = s.holdings[t]
    if (h) v += h.shares * priceOf(s, t)
  }
  return v
}

export function investedValue(s: InvestState): number {
  return portfolioValue(s) - s.cash
}

/** A safe percent change: 0 when there's nothing to compare against. */
export function change(now: number, then: number): number {
  if (!fin(now) || !fin(then) || then <= 0) return 0
  return now / then - 1
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647)
}

/* ---------- create / load ---------- */

export function freshState(seed: number = DEFAULT_SEED, flags?: InvestState['flags']): InvestState {
  const prices = ASSETS.map((a) => a.start)
  return {
    v: VERSION,
    seed,
    day: 0,
    cash: START_CASH,
    prices,
    holdings: {},
    history: [{ d: 0, v: START_CASH, p: [...prices] }],
    stride: 1,
    news: [],
    newsSeq: 0,
    slide: null,
    calmSince: 0,
    peak: START_CASH,
    dip: null,
    worstDrop: 0,
    trades: 0,
    lastJump: null,
    flags: { diversified: !!flags?.diversified, heldDip: !!flags?.heldDip },
  }
}

export const INITIAL: InvestState = freshState(DEFAULT_SEED)

const validPrices = (p: unknown): p is number[] => Array.isArray(p) && p.length === N && p.every((x) => fin(x) && x > 0)

/**
  Saved data can be old, half-written, or hand-edited. If anything important
  looks off, start a fresh market (keeping the one-time flags).
*/
export function sanitize(raw: unknown): InvestState {
  if (!raw || typeof raw !== 'object') return INITIAL
  const s = raw as InvestState
  const flags = s.flags && typeof s.flags === 'object' ? s.flags : undefined
  if (
    s.v !== VERSION ||
    !fin(s.seed) ||
    !fin(s.day) ||
    s.day < 0 ||
    !fin(s.cash) ||
    s.cash < 0 ||
    !validPrices(s.prices) ||
    !Array.isArray(s.history) ||
    s.history.length === 0 ||
    !s.history.every((p) => p && fin(p.d) && fin(p.v) && validPrices(p.p)) ||
    !Array.isArray(s.news) ||
    !fin(s.peak) ||
    !fin(s.stride) ||
    s.stride < 1
  ) {
    return freshState(fin(s.seed) ? s.seed : DEFAULT_SEED, flags)
  }
  // Holdings: drop anything weird rather than nuking the whole game.
  let holdingsOk = !!s.holdings && typeof s.holdings === 'object'
  if (holdingsOk) {
    for (const [k, h] of Object.entries(s.holdings)) {
      if (!isTicker(k) || !h || !fin(h.shares) || h.shares <= 0 || !fin(h.cost) || h.cost < 0) holdingsOk = false
    }
  }
  const numbersOk = fin(s.worstDrop) && fin(s.calmSince) && fin(s.trades) && fin(s.newsSeq)
  const newsOk = s.news.every((n) => n && typeof n.text === 'string' && fin(n.day) && fin(n.move))
  // A broken slide feeds NaN into every price (which then clamps to $0.0001), so check these too.
  const slideOk = s.slide === null || (!!s.slide && fin(s.slide.perDay) && fin(s.slide.left) && fin(s.slide.len) && fin(s.slide.total))
  const dipOk = s.dip === null || (!!s.dip && fin(s.dip.depth))
  const jumpOk = s.lastJump === null || (!!s.lastJump && fin(s.lastJump.days) && fin(s.lastJump.fromDay) && fin(s.lastJump.value) && validPrices(s.lastJump.prices))
  if (holdingsOk && numbersOk && newsOk && slideOk && dipOk && jumpOk && s.flags && typeof s.flags === 'object') return s

  const holdings: Holdings = {}
  if (s.holdings && typeof s.holdings === 'object') {
    for (const [k, h] of Object.entries(s.holdings)) {
      if (isTicker(k) && h && fin(h.shares) && h.shares > 0) holdings[k] = { shares: h.shares, cost: fin(h.cost) && h.cost >= 0 ? h.cost : 0 }
    }
  }
  return {
    ...s,
    holdings,
    news: s.news.filter((n) => n && typeof n.text === 'string' && fin(n.day)).map((n) => ({ ...n, move: fin(n.move) ? n.move : 0 })),
    worstDrop: fin(s.worstDrop) ? s.worstDrop : 0,
    calmSince: fin(s.calmSince) ? s.calmSince : 0,
    trades: fin(s.trades) ? s.trades : 0,
    newsSeq: fin(s.newsSeq) ? s.newsSeq : s.news.length,
    slide: slideOk ? s.slide : null,
    dip: dipOk ? s.dip : null,
    lastJump: jumpOk ? s.lastJump : null,
    flags: { diversified: !!flags?.diversified, heldDip: !!flags?.heldDip },
  }
}

function clone(s: InvestState): InvestState {
  const holdings: Holdings = {}
  for (const t of TICKERS) {
    const h = s.holdings[t]
    if (h) holdings[t] = { ...h }
  }
  return {
    ...s,
    prices: [...s.prices],
    holdings,
    history: [...s.history],
    news: [...s.news],
    slide: s.slide ? { ...s.slide } : null,
    dip: s.dip ? { ...s.dip } : null,
    flags: { ...s.flags },
  }
}

/* ---------- time ---------- */

/**
  Updates the high-water mark. Returns the dip depth if the portfolio just hit
  a new high after a DIP_LINE+ drop that you rode out without selling.
*/
export function updatePeak(s: InvestState, v: number): number | null {
  if (v > s.peak * (1 + 1e-9)) {
    const d = s.dip
    s.peak = v
    s.dip = null
    return d && !d.sold ? d.depth : null
  }
  const dd = s.peak > 0 ? 1 - v / s.peak : 0
  if (dd > s.worstDrop) s.worstDrop = dd
  if (dd >= DIP_LINE) s.dip = s.dip ? { ...s.dip, depth: Math.max(s.dip.depth, dd) } : { depth: dd, sold: false }
  return null
}

function record(s: InvestState, v: number) {
  if (s.day % s.stride !== 0) return
  s.history.push({ d: s.day, v: round2(v), p: s.prices.map(sig) })
  if (s.history.length > HISTORY_MAX) {
    const next = s.stride * 2
    s.history = s.history.filter((p) => p.d % next === 0)
    s.stride = next
  }
}

/** Moves the market forward one day. Mutates `s` (a working copy). */
function stepDay(s: InvestState, fresh: NewsItem[]): number | null {
  const day = s.day + 1
  const r = rng(`${s.seed}:${day}`)
  const zm = gaussian(r)
  let common = 0
  const say = (emoji: string, text: string, ticker: Ticker | null, move: number) => {
    fresh.push({ id: ++s.newsSeq, day, emoji, text, ticker, move: Math.round(move * 10_000) / 10_000 })
  }

  // Slides: a few weeks of drops, then a slower climb back.
  if (s.slide) {
    common += s.slide.perDay
    s.slide.left -= 1
    if (s.slide.left <= 0) {
      if (s.slide.phase === 'down') {
        const upLen = Math.max(10, Math.round(s.slide.len * (2 + r() * 3)))
        // Markets have always climbed back eventually. Some slides fully heal, some take longer.
        const regain = -s.slide.total * (0.8 + r() * 0.4)
        say(SLIDE_END.emoji, SLIDE_END.text, null, 0)
        s.slide = { phase: 'up', left: upLen, perDay: regain / upLen, len: upLen, total: regain }
      } else {
        s.slide = null
        s.calmSince = day
      }
    }
  } else {
    const calm = day - s.calmSince
    const odds = calm < 90 ? 0 : calm > 330 ? 1 / 60 : 1 / 400
    if (r() < odds) {
      const len = 8 + Math.floor(r() * 18)
      const total = Math.log(1 - (0.13 + r() * 0.15))
      s.slide = { phase: 'down', left: len - 1, perDay: total / len, len, total }
      common += total / len
      say(SLIDE_START.emoji, SLIDE_START.text, null, 0)
    }
  }

  if (r() < MARKET_NEWS_ODDS) {
    const t = pick(MARKET_NEWS, r)
    const jump = t.move * (0.7 + r() * 0.6)
    common += Math.log(1 + jump)
    say(t.emoji, t.text, null, jump)
  }

  ASSETS.forEach((a, i) => {
    let lr: number
    if (a.vol === 0) {
      lr = Math.log(1 + a.drift) / DAYS_PER_YEAR
    } else {
      const shock = a.corr * zm + Math.sqrt(Math.max(0, 1 - a.corr * a.corr)) * gaussian(r)
      lr =
        Math.log(1 + a.drift) / DAYS_PER_YEAR -
        NEWS_DRAG[i] -
        a.beta * MARKET_DRAG +
        (a.vol / Math.sqrt(DAYS_PER_YEAR)) * shock +
        a.beta * common
      const pool = COMPANY_NEWS[a.ticker]
      if (pool && pool.length && a.newsOdds > 0 && r() < a.newsOdds) {
        const t = pick(pool, r)
        const jump = t.move * (0.7 + r() * 0.6)
        lr += Math.log(1 + jump)
        say(t.emoji, t.text, a.ticker, jump)
      }
    }
    s.prices[i] = clampPrice(s.prices[i] * Math.exp(lr))
  })

  s.day = day
  const v = portfolioValue(s)
  const held = updatePeak(s, v)
  record(s, v)
  return held
}

export interface AdvanceResult {
  state: InvestState
  days: number
  before: number
  after: number
  /** Headlines from this jump, newest first. */
  news: NewsItem[]
  /** Depth of the dip you rode out, if you just hit a new high after one. */
  heldDip: number | null
  /** True the very first time that happens (track the event once). */
  firstHeldDip: boolean
}

export function advance(prev: InvestState, days: number): AdvanceResult {
  const s = clone(prev)
  const n = Math.max(0, Math.min(Math.floor(fin(days) ? days : 0), MAX_DAY - s.day))
  const before = portfolioValue(prev)
  const fresh: NewsItem[] = []
  let heldDip: number | null = null
  for (let i = 0; i < n; i++) {
    const h = stepDay(s, fresh)
    if (h !== null) heldDip = Math.max(heldDip ?? 0, h)
  }
  fresh.reverse()
  s.news = [...fresh, ...s.news].slice(0, NEWS_MAX)
  if (n > 0) s.lastJump = { days: n, fromDay: prev.day, prices: [...prev.prices], value: round2(before) }
  const firstHeldDip = heldDip !== null && !s.flags.heldDip
  if (heldDip !== null) s.flags.heldDip = true
  return { state: s, days: n, before, after: portfolioValue(s), news: fresh, heldDip, firstHeldDip }
}

/* ---------- trading ---------- */

export type TradeFail = 'tooSmall' | 'noCash' | 'notOwned'
export type TradeResult =
  | { ok: true; state: InvestState; shares: number; amount: number; firstDiversified: boolean }
  | { ok: false; reason: TradeFail }

function afterTrade(s: InvestState): boolean {
  s.trades += 1
  if (!s.flags.diversified && holdingCount(s) >= DIVERSE_COUNT) {
    s.flags.diversified = true
    return true
  }
  return false
}

/** Buy `dollars` worth (fractional shares are fine). Never spends more than your cash. */
export function buy(prev: InvestState, t: Ticker, dollars: number): TradeResult {
  if (prev.cash < 0.01) return { ok: false, reason: 'noCash' }
  const amount = round2(Math.min(fin(dollars) ? dollars : 0, prev.cash))
  if (amount < 0.01) return { ok: false, reason: 'tooSmall' }
  const s = clone(prev)
  const price = priceOf(s, t)
  const shares = amount / price
  const h = s.holdings[t]
  s.holdings[t] = { shares: (h?.shares ?? 0) + shares, cost: round2((h?.cost ?? 0) + amount) }
  s.cash = round2(Math.max(0, s.cash - amount))
  const firstDiversified = afterTrade(s)
  return { ok: true, state: s, shares, amount, firstDiversified }
}

/** Sell `dollars` worth, or everything with 'all'. */
export function sell(prev: InvestState, t: Ticker, dollars: number | 'all'): TradeResult {
  const h = prev.holdings[t]
  if (!h || h.shares <= 0) return { ok: false, reason: 'notOwned' }
  const price = priceOf(prev, t)
  const worth = h.shares * price
  const want = dollars === 'all' ? worth : fin(dollars) ? dollars : 0
  if (want < 0.01 && dollars !== 'all') return { ok: false, reason: 'tooSmall' }
  const s = clone(prev)
  let shares: number
  let amount: number
  if (dollars === 'all' || want >= worth - 0.005) {
    shares = h.shares
    amount = round2(worth)
    delete s.holdings[t]
  } else {
    shares = want / price
    amount = round2(want)
    const left = h.shares - shares
    s.holdings[t] = { shares: left, cost: round2(h.cost * (left / h.shares)) }
  }
  s.cash = round2(s.cash + amount)
  if (s.dip && t !== 'SAVE') s.dip = { ...s.dip, sold: true }
  // Prices move between trades, so a sale can be the trade that first finds
  // four things worth $1+. Report it, or the flag gets set with no badge.
  const firstDiversified = afterTrade(s)
  return { ok: true, state: s, shares, amount, firstDiversified }
}

/* ---------- reading the portfolio ---------- */

export interface HoldingView {
  asset: Asset
  shares: number
  value: number
  cost: number
  gain: number
  gainPct: number
  /** Share of the whole portfolio (cash included), 0..1. */
  weight: number
}

/** Your holdings, biggest first. */
export function holdingsList(s: InvestState): HoldingView[] {
  const total = portfolioValue(s)
  const out: HoldingView[] = []
  for (const a of ASSETS) {
    const h = s.holdings[a.ticker]
    if (!h) continue
    const value = h.shares * priceOf(s, a.ticker)
    out.push({ asset: a, shares: h.shares, value, cost: h.cost, gain: value - h.cost, gainPct: change(value, h.cost), weight: total > 0 ? value / total : 0 })
  }
  return out.sort((x, y) => y.value - x.value)
}

/** "Worth $1+" with room for float fuzz: a $1 buy is (1 / price) * price, which is often 0.9999999. */
const ONE_DOLLAR = 0.995

/** Different things you own that are worth at least $1. */
export function holdingCount(s: InvestState): number {
  let c = 0
  for (const t of TICKERS) {
    const h = s.holdings[t]
    if (h && h.shares * priceOf(s, t) >= ONE_DOLLAR) c++
  }
  return c
}

export interface Diversity {
  /** 0 = nothing invested, 1 = one basket ... 4 = nicely spread out. */
  level: 0 | 1 | 2 | 3 | 4
  count: number
  /** "Effective number of holdings": 4 equal holdings = 4, one giant + crumbs is close to 1. */
  effective: number
  top: HoldingView | null
  /** Top holding's share of your invested money, 0..1. */
  topShare: number
  invested: number
}

export function diversity(s: InvestState): Diversity {
  const list = holdingsList(s)
  const invested = list.reduce((a, h) => a + h.value, 0)
  if (invested < 0.01) return { level: 0, count: 0, effective: 0, top: null, topShare: 0, invested: 0 }
  const hhi = list.reduce((a, h) => a + (h.value / invested) ** 2, 0)
  const effective = hhi > 0 ? 1 / hhi : 0
  const count = list.filter((h) => h.value >= ONE_DOLLAR).length
  const top = list[0] ?? null
  const topShare = top ? top.value / invested : 0
  const level = count <= 1 || topShare >= 0.85 ? 1 : effective < 2.5 ? 2 : effective < 3.6 ? 3 : 4
  return { level, count, effective, top, topShare, invested }
}

/** Chart points: the saved history plus today, if today isn't saved yet. */
export function chartPoints(s: InvestState): Point[] {
  const last = s.history[s.history.length - 1]
  if (last && last.d === s.day) return s.history
  return [...s.history, { d: s.day, v: round2(portfolioValue(s)), p: [...s.prices] }]
}

/** Current drop from the high, 0..1. */
export function drawdown(s: InvestState): number {
  const v = portfolioValue(s)
  return s.peak > 0 ? Math.max(0, 1 - v / s.peak) : 0
}
