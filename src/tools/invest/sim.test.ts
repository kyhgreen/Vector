import { describe, expect, it } from 'vitest'
import { ASSETS, TICKERS } from './assets'
import { chartWindow, elapsed, moneySigned, pct, price, shares } from './fmt'
import {
  DIVERSE_COUNT,
  HISTORY_MAX,
  MAX_DAY,
  START_CASH,
  advance,
  buy,
  chartPoints,
  diversity,
  freshState,
  holdingCount,
  portfolioValue,
  sanitize,
  sell,
  type InvestState,
} from './sim'

const finite = (s: InvestState) =>
  Number.isFinite(s.cash) && s.prices.every(Number.isFinite) && s.history.every((p) => Number.isFinite(p.v) && p.p.every(Number.isFinite))

describe('market engine', () => {
  it('starts with $10,000 of pretend cash', () => {
    const s = freshState(1)
    expect(s.cash).toBe(START_CASH)
    expect(portfolioValue(s)).toBe(START_CASH)
    expect(s.prices).toHaveLength(ASSETS.length)
  })

  it('replays the exact same market for the same seed', () => {
    const a = advance(freshState(42), 400).state
    const b = advance(advance(freshState(42), 150).state, 250).state
    expect(a.prices).toEqual(b.prices)
    expect(a.day).toBe(400)
  })

  it('different seeds give different markets', () => {
    const a = advance(freshState(1), 60).state
    const b = advance(freshState(2), 60).state
    expect(a.prices).not.toEqual(b.prices)
  })

  it('the savings account grows about 4% a year and never dips', () => {
    let s = freshState(7)
    const r = buy(s, 'SAVE', 1000)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    s = r.state
    const i = TICKERS.indexOf('SAVE')
    let last = s.prices[i]
    for (let k = 0; k < 365; k++) {
      s = advance(s, 1).state
      expect(s.prices[i]).toBeGreaterThanOrEqual(last)
      last = s.prices[i]
    }
    expect(s.prices[i] / ASSETS[i].start).toBeCloseTo(1.04, 3)
  })

  it('never produces NaN, even after fifty years', () => {
    let s = freshState(99)
    const r = buy(s, 'DMOON', 5000)
    if (r.ok) s = r.state
    s = advance(s, MAX_DAY + 500).state
    expect(s.day).toBe(MAX_DAY)
    expect(finite(s)).toBe(true)
    expect(s.history.length).toBeLessThanOrEqual(HISTORY_MAX)
    expect(Number.isFinite(portfolioValue(s))).toBe(true)
    // And the time machine stops politely at the end.
    expect(advance(s, 30).days).toBe(0)
  })

  it('the index fund roughly averages its drift over many markets', () => {
    const i = TICKERS.indexOf('TMIX')
    const d = TICKERS.indexOf('DMOON')
    let logSum = 0
    let moonDown = 0
    const runs = 60
    for (let seed = 1; seed <= runs; seed++) {
      const s = advance(freshState(seed * 7919), 365 * 10).state
      logSum += Math.log(s.prices[i] / ASSETS[i].start) / 10
      if (s.prices[d] < ASSETS[d].start) moonDown++
    }
    const yearly = Math.exp(logSum / runs) - 1
    expect(yearly).toBeGreaterThan(0.04)
    expect(yearly).toBeLessThan(0.12)
    expect(moonDown / runs).toBeGreaterThan(0.5)
  })

  it('writes news into the feed', () => {
    const r = advance(freshState(5), 365)
    expect(r.state.news.length).toBeGreaterThan(0)
    expect(r.state.news[0].day).toBeGreaterThanOrEqual(r.state.news[r.state.news.length - 1].day)
  })
})

describe('trading', () => {
  it('buys fractional shares and never spends more cash than you have', () => {
    const s = freshState(3)
    const r = buy(s, 'TMIX', 250)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.cash).toBe(START_CASH - 250)
    expect(r.state.holdings.TMIX?.shares).toBeCloseTo(2.5)
    const big = buy(r.state, 'SNAK', 999_999)
    expect(big.ok).toBe(true)
    if (!big.ok) return
    expect(big.state.cash).toBe(0)
    expect(buy(big.state, 'SNAK', 10)).toEqual({ ok: false, reason: 'noCash' })
  })

  it('rejects junk amounts', () => {
    const s = freshState(3)
    expect(buy(s, 'TMIX', 0).ok).toBe(false)
    expect(buy(s, 'TMIX', Number.NaN).ok).toBe(false)
    expect(sell(s, 'TMIX', 10)).toEqual({ ok: false, reason: 'notOwned' })
  })

  it('sells part or all of a holding', () => {
    let s = freshState(3)
    const b = buy(s, 'MEOW', 1000)
    if (!b.ok) throw new Error('buy failed')
    s = b.state
    const half = sell(s, 'MEOW', 500)
    if (!half.ok) throw new Error('sell failed')
    expect(half.state.cash).toBe(START_CASH - 500)
    expect(half.state.holdings.MEOW?.cost).toBeCloseTo(500)
    const all = sell(half.state, 'MEOW', 'all')
    if (!all.ok) throw new Error('sell all failed')
    expect(all.state.holdings.MEOW).toBeUndefined()
    expect(all.state.cash).toBeCloseTo(START_CASH)
  })

  it('flags diversification once you own four things', () => {
    let s = freshState(3)
    let first = 0
    for (const t of ['SAVE', 'BNDY', 'TMIX', 'SNAK', 'MEOW'] as const) {
      const r = buy(s, t, 100)
      if (!r.ok) throw new Error('buy failed')
      if (r.firstDiversified) first++
      s = r.state
    }
    expect(holdingCount(s)).toBe(5)
    expect(first).toBe(1)
    expect(s.flags.diversified).toBe(true)
    expect(DIVERSE_COUNT).toBe(4)
    expect(diversity(s).level).toBeGreaterThanOrEqual(3)
  })

  it('counts a $1 buy as worth $1, even when the float math says 0.9999999', () => {
    let s = freshState(5)
    // Find a day where at least one price has the 0.9999999 problem.
    const fuzzy = (st: InvestState) => st.prices.some((p, k) => k > 0 && (1 / p) * p < 1)
    while (!fuzzy(s)) s = advance(s, 1).state
    for (const t of ['BNDY', 'KNIT', 'TMIX', 'SNAK', 'MEOW', 'HOVR', 'DMOON'] as const) {
      const r = buy(s, t, 1)
      if (!r.ok) throw new Error('buy failed')
      s = r.state
    }
    expect(holdingCount(s)).toBe(7)
    expect(s.flags.diversified).toBe(true)
  })

  it('a sale can be the trade that earns the diversify badge', () => {
    // Three real holdings plus 90 cents of a fourth that grows past $1 on its own.
    let s = freshState(3)
    for (const [t, d] of [['SAVE', 100], ['BNDY', 100], ['TMIX', 100], ['SNAK', 0.9]] as const) {
      const r = buy(s, t, d)
      if (!r.ok) throw new Error('buy failed')
      s = r.state
    }
    expect(holdingCount(s)).toBe(3)
    for (let k = 0; k < 400 && holdingCount(s) < DIVERSE_COUNT; k++) s = advance(s, 7).state
    expect(holdingCount(s)).toBe(DIVERSE_COUNT)
    expect(s.flags.diversified).toBe(false)
    const r = sell(s, 'TMIX', 10)
    if (!r.ok) throw new Error('sell failed')
    expect(r.firstDiversified).toBe(true)
    expect(r.state.flags.diversified).toBe(true)
  })

  it('can always sell crumbs worth less than a cent', () => {
    const b = buy(freshState(3), 'DMOON', 5)
    if (!b.ok) throw new Error('buy failed')
    const i = TICKERS.indexOf('DMOON')
    const crumbs: InvestState = { ...b.state, prices: b.state.prices.map((p, k) => (k === i ? 0.0001 : p)) }
    const r = sell(crumbs, 'DMOON', 'all')
    if (!r.ok) throw new Error('sell failed')
    expect(r.state.holdings.DMOON).toBeUndefined()
  })
})

describe('diamond hands', () => {
  it('fires after riding out a 10%+ dip to a new high', () => {
    let found = false
    for (let seed = 1; seed <= 40 && !found; seed++) {
      let s = freshState(seed)
      const r = buy(s, 'HOVR', START_CASH)
      if (!r.ok) continue
      s = r.state
      for (let k = 0; k < 365 * 6; k += 7) {
        const res = advance(s, 7)
        s = res.state
        if (res.firstHeldDip) {
          expect(res.heldDip).toBeGreaterThanOrEqual(0.1)
          expect(s.flags.heldDip).toBe(true)
          found = true
          break
        }
      }
    }
    expect(found).toBe(true)
  })

  it('does not count if you sold during the dip', () => {
    const s = freshState(1)
    const b = buy(s, 'TMIX', 5000)
    if (!b.ok) throw new Error('buy failed')
    const dipped: InvestState = { ...b.state, dip: { depth: 0.12, sold: false } }
    const sold = sell(dipped, 'TMIX', 100)
    if (!sold.ok) throw new Error('sell failed')
    expect(sold.state.dip?.sold).toBe(true)
  })
})

describe('saved data', () => {
  it('survives junk and keeps the one-time flags', () => {
    expect(sanitize(null).cash).toBe(START_CASH)
    expect(sanitize({ v: 1, cash: 'lots' }).cash).toBe(START_CASH)
    const s = advance(freshState(8), 30).state
    expect(sanitize(JSON.parse(JSON.stringify(s)))).toEqual(s)
    const broken = { ...s, prices: [1, 2], flags: { diversified: true, heldDip: false } }
    const fixed = sanitize(broken)
    expect(fixed.day).toBe(0)
    expect(fixed.flags.diversified).toBe(true)
  })

  it('throws out a broken slide instead of turning every price into dust', () => {
    const s = advance(freshState(8), 30).state
    const broken = JSON.parse(JSON.stringify({ ...s, slide: { phase: 'down', left: 5 }, lastJump: { days: 7 } }))
    const fixed = sanitize(broken)
    expect(fixed.slide).toBeNull()
    expect(fixed.lastJump).toBeNull()
    expect(fixed.day).toBe(30)
    const later = advance(fixed, 30).state
    expect(finite(later)).toBe(true)
    later.prices.forEach((p, k) => expect(p).toBeGreaterThan(ASSETS[k].start * 0.2))
  })

  it('always has at least one chart point for today', () => {
    const s = advance(freshState(8), 3).state
    const pts = chartPoints(s)
    expect(pts[pts.length - 1].d).toBe(s.day)
  })
})

describe('formatting', () => {
  it('never shows NaN', () => {
    expect(price(Number.NaN)).toBe('$0.00')
    expect(pct(Number.NaN)).toBe('0%')
    expect(shares(Number.NaN)).toBe('0')
    expect(elapsed(Number.NaN)).toBe('0 days')
    expect(pct(0.1234)).toBe('+12.3%')
    expect(pct(-0.05)).toBe('−5.0%')
    expect(moneySigned(0.3)).toBe('$0')
    expect(moneySigned(-0.4)).toBe('$0')
    expect(moneySigned(-0.4, true)).toBe('−$0.40')
    expect(moneySigned(412)).toBe('+$412')
  })

  it('picks a tight chart window that contains every value', () => {
    const vals = [10_000, 10_120, 9_870, 10_300]
    const w = chartWindow(vals)
    expect(w.base).toBeLessThanOrEqual(9_870)
    expect(w.base + w.range).toBeGreaterThanOrEqual(10_300)
    expect(w.range).toBeLessThan(5_000)
    expect(chartWindow([])).toEqual({ base: 0, range: 1 })
    // All cash: a flat line plotted from $0, not a zero-height window.
    expect(chartWindow([10_000, 10_000, 10_000]).base).toBe(0)
  })
})
