import { describe, expect, it } from 'vitest'
import { bigEquivalent, countText, equivalents, habitMath, roundCount, timesPhrase } from './math'
import { CUSTOM_ID, KID_INITIAL, PRESETS, TEEN_INITIAL, THINGS, currentHabit, sanitize } from './data'

describe('habitMath', () => {
  it('adds up a $5 coffee five times a week', () => {
    const m = habitMath(5, 5, 5)
    expect(m.perWeek).toBe(25)
    expect(m.perYear).toBe(1300)
    expect(m.perMonth).toBeCloseTo(1300 / 12, 6)
    expect(m.spent).toBe(6500)
    expect(m.invested).toBeGreaterThan(m.spent)
    expect(m.growth).toBeCloseTo(m.invested - m.spent, 6)
  })
  it('gives one chart point per year plus today', () => {
    const m = habitMath(6, 2, 10)
    expect(m.xLabels).toHaveLength(11)
    expect(m.xLabels[0]).toBe('Now')
    expect(m.spentLine).toHaveLength(11)
    expect(m.investedLine).toHaveLength(11)
    expect(m.spentLine[10]).toBeCloseTo(m.spent, 6)
  })
  it('never returns NaN or Infinity for junk input', () => {
    for (const [p, w, y] of [
      [NaN, 3, 5],
      [5, Infinity, 5],
      [-4, 2, 0],
      [0, 0, 0],
    ]) {
      const m = habitMath(p, w, y)
      for (const v of [m.perWeek, m.perMonth, m.perYear, m.spent, m.invested, m.growth, ...m.spentLine, ...m.investedLine]) {
        expect(Number.isFinite(v)).toBe(true)
        expect(v).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

describe('equivalents', () => {
  it('is empty for nothing', () => {
    expect(equivalents(0)).toEqual([])
    expect(equivalents(NaN)).toEqual([])
    expect(equivalents(1)).toEqual([])
  })
  it('picks up to three different things, cheapest first', () => {
    const e = equivalents(1300)
    expect(e.length).toBe(3)
    expect(new Set(e.map((x) => x.thing.one)).size).toBe(3)
    for (let i = 1; i < e.length; i++) expect(e[i].thing.price).toBeGreaterThanOrEqual(e[i - 1].thing.price)
    for (const x of e) expect(x.count).toBeGreaterThan(0)
  })
  it('only suggests a big-ticket item when the total covers one', () => {
    expect(bigEquivalent(100)).toBeNull()
    const big = bigEquivalent(6500)
    expect(big).not.toBeNull()
    expect(big!.thing.price).toBeGreaterThanOrEqual(350)
  })
  it('rounds counts in a friendly way', () => {
    expect(roundCount(0)).toBe(0)
    expect(roundCount(0.2)).toBe(0.5)
    expect(roundCount(1.3)).toBe(1.5)
    expect(roundCount(6.4)).toBe(6)
    const sneakers = THINGS.find((t) => t.price === 90)!
    expect(countText(1, sneakers)).toBe('1 pair of sneakers')
    expect(countText(6, sneakers)).toBe('6 pairs of sneakers')
    expect(countText(1.5, sneakers)).toBe('1.5 pairs of sneakers')
  })
})

describe('timesPhrase', () => {
  it('reads like a person wrote it', () => {
    expect(timesPhrase(1)).toBe('once a week')
    expect(timesPhrase(2)).toBe('twice a week')
    expect(timesPhrase(5)).toBe('5 times a week')
    expect(timesPhrase(7)).toBe('every day')
    expect(timesPhrase(14)).toBe('twice a day')
  })
})

describe('saved state', () => {
  it('repairs junk saves', () => {
    const s = sanitize({ presetId: 'nope', perWeek: 99, years: -3, customPrice: 'abc', customName: 42 }, TEEN_INITIAL)
    expect(s.presetId).toBe(TEEN_INITIAL.presetId)
    expect(s.perWeek).toBe(14)
    expect(s.years).toBe(1)
    expect(s.customPrice).toBe(TEEN_INITIAL.customPrice)
    expect(s.customName).toBe('')
    expect(sanitize(undefined, KID_INITIAL)).toEqual(KID_INITIAL)
  })
  it('builds a readable custom habit', () => {
    const h = currentHabit({ ...TEEN_INITIAL, presetId: CUSTOM_ID, customName: '  Energy   drinks ', customPrice: 3 })
    expect(h.name).toBe('Energy drinks')
    expect(h.label).toBe('energy drinks habit')
    expect(h.what).toBe('energy drinks')
    expect(h.price).toBe(3)
    const blank = currentHabit({ ...TEEN_INITIAL, presetId: CUSTOM_ID, customName: '' })
    expect(blank.label).toBe('habit')
  })
  it('has every preset from the spec', () => {
    expect(PRESETS.map((p) => p.price)).toEqual([5, 6, 10, 10, 2, 8])
  })
})
