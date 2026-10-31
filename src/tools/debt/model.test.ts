import { describe, expect, it } from 'vitest'
import { activeDebts, chartMonths, budgetTooSmall, cardCompare, defaultsFor, isTie, loanStats, sameOrder, sampleMonths, sanitizeDebt, simulate, termCompare, SNOW_DEFAULTS } from './model'

describe('debt lab model', () => {
  it('your bigger payment beats minimum payments', () => {
    const r = cardCompare({ balance: 2000, apr: 22, payment: 100 })
    expect(r.mine.never).toBe(false)
    expect(r.min.never).toBe(false)
    expect(r.mine.months).toBeLessThan(r.min.months)
    expect(r.mine.totalInterest).toBeLessThan(r.min.totalInterest)
    expect(r.firstMin).toBeGreaterThanOrEqual(25)
  })

  it('flags a payment that never covers the interest', () => {
    const r = cardCompare({ balance: 5000, apr: 24, payment: 50 })
    expect(r.mine.never).toBe(true)
    expect(r.belowMin).toBe(true)
    expect(cardCompare({ balance: 500, apr: 0, payment: 0 }).mine.never).toBe(true)
  })

  it('longer loans cost more interest but less per month', () => {
    const rows = termCompare({ kind: 'car', amount: 15000, rate: 7, years: 5 })
    expect(rows.map((r) => r.years)).toEqual([3, 5, 7])
    expect(rows[0].payment).toBeGreaterThan(rows[2].payment)
    expect(rows[0].interest).toBeLessThan(rows[2].interest)
    expect(termCompare({ kind: 'student', amount: 27000, rate: 6.5, years: 10 }).length).toBe(4)
    const zero = loanStats(1200, 0, 1)
    expect(zero.payment).toBeCloseTo(100)
    expect(zero.interest).toBeCloseTo(0)
  })

  it('avalanche never pays more interest than snowball', () => {
    const s = simulate(SNOW_DEFAULTS.debts, 100, 'snowball')
    const a = simulate(SNOW_DEFAULTS.debts, 100, 'avalanche')
    expect(s.never || a.never).toBe(false)
    expect(a.totalInterest).toBeLessThanOrEqual(s.totalInterest + 0.01)
    expect(s.firstWin).toBeLessThanOrEqual(a.firstWin)
    expect(s.order[0].name).toBe('Phone payment plan')
    expect(a.order[0].name).toBe('Mall store card')
    expect(sameOrder(s, a)).toBe(false)
    expect(s.order.length).toBe(3)
  })

  it('same payoff order is not a tie when the extra money went to different debts', () => {
    const debts = [
      { id: 1, name: 'A', balance: 1000, apr: 0, min: 400 },
      { id: 2, name: 'B', balance: 5000, apr: 30, min: 100 },
    ]
    const s = simulate(debts, 300, 'snowball')
    const a = simulate(debts, 300, 'avalanche')
    expect(sameOrder(s, a)).toBe(true)
    expect(s.totalInterest - a.totalInterest).toBeGreaterThan(10)
    expect(isTie(s, a)).toBe(false)
    const one = [{ id: 1, name: 'Solo', balance: 800, apr: 20, min: 50 }]
    expect(isTie(simulate(one, 20, 'snowball'), simulate(one, 20, 'avalanche'))).toBe(true)
  })

  it('one plan can stall while the other finishes', () => {
    const debts = [
      { id: 1, name: 'A', balance: 1000, apr: 0, min: 0 },
      { id: 2, name: 'B', balance: 5000, apr: 30, min: 0 },
    ]
    expect(simulate(debts, 130, 'snowball').never).toBe(true)
    expect(simulate(debts, 130, 'avalanche').never).toBe(false)
  })

  it('a payment can beat the interest and still take over 50 years', () => {
    const r = cardCompare({ balance: 10000, apr: 3, payment: 30 })
    expect(30).toBeGreaterThan(r.interest)
    expect(r.mine.never).toBe(true)
  })

  it('handles debts that can never be paid off', () => {
    const debts = [{ id: 1, name: 'Yikes card', balance: 10000, apr: 30, min: 10 }]
    expect(budgetTooSmall(debts, 0)).toBe(true)
    const r = simulate(debts, 0, 'snowball')
    expect(r.never).toBe(true)
    expect(r.months).toBe(Infinity)
  })

  it('ignores empty debts and names blank ones', () => {
    const d = activeDebts([
      { id: 1, name: '  ', balance: 100, apr: 10, min: 10 },
      { id: 2, name: 'Zero', balance: 0, apr: 10, min: 10 },
    ])
    expect(d.length).toBe(1)
    expect(d[0].name).toBe('Debt 1')
    expect(simulate([], 50, 'avalanche').months).toBe(0)
  })

  it('samples long charts into a small number of points', () => {
    expect(sampleMonths(12).length).toBe(13)
    const long = sampleMonths(400)
    expect(long.length).toBeLessThan(40)
    expect(long[long.length - 1]).toBe(400)
    for (const span of [1, 3, 12, 26, 40, 50, 99, 180, 300, 600]) {
      const m = chartMonths(span)
      const n = m.length
      expect(m[n - 1]).toBeGreaterThanOrEqual(span)
      expect(n).toBeLessThanOrEqual(31)
      expect((n - 1) % Math.ceil(n / 6)).toBe(0)
    }
  })

  it('sanitizes junk saved state', () => {
    expect(sanitizeDebt(undefined, 16)).toEqual(defaultsFor(16))
    const s = sanitizeDebt({ tab: 'nope', card: { balance: 'x', apr: -5, payment: Infinity }, loan: { years: 99 }, snow: { debts: [{ id: 1 }, { id: 1 }, 7], extra: NaN } }, 12)
    expect(s.tab).toBe('card')
    expect(s.card.apr).toBe(0)
    expect(Number.isFinite(s.card.payment)).toBe(true)
    expect(s.loan.years).toBe(20)
    expect(s.snow.debts.length).toBe(2)
    expect(new Set(s.snow.debts.map((d) => d.id)).size).toBe(2)
    expect(s.snow.extra).toBe(100)
  })
})
