import { describe, expect, it } from 'vitest'
import {
  ageThen,
  calculate,
  defaultsFor,
  earlyBird,
  earlyBirdLine,
  MONTHLY_STOPS,
  ruleOf72,
  sanitize,
  shareLine,
  START_STOPS,
  type GrowthInputs,
} from './logic'

const bad = /NaN|Infinity|undefined|null|\u2014/

describe('growth calculator', () => {
  it('picks age-sized defaults and cleans junk saves', () => {
    expect(sanitize(null, 12)).toEqual(defaultsFor(12))
    expect(sanitize(undefined, 17)).toEqual(defaultsFor(17))
    expect(defaultsFor(12).monthly).toBeLessThan(defaultsFor(17).monthly)
    const s = sanitize({ start: 99999, monthly: -5, rate: 7.3, years: 0, extra: 'lol' }, 12)
    expect(s).toEqual({ start: 10000, monthly: 0, rate: 7.5, years: 1 })
    expect(sanitize({ start: 'lots', monthly: NaN, rate: null, years: 12.6 }, 12)).toEqual({ ...defaultsFor(12), years: 13 })
    expect(START_STOPS[0]).toBe(0)
    expect(MONTHLY_STOPS[MONTHLY_STOPS.length - 1]).toBe(500)
  })

  it('adds up what you put in versus what growth earned', () => {
    const r = calculate({ start: 100, monthly: 20, rate: 7, years: 20 })
    expect(r.contributed).toBe(4900)
    expect(r.total).toBeGreaterThan(r.contributed)
    expect(r.growth).toBeCloseTo(r.total - r.contributed, 6)
    expect(r.balanceByYear).toHaveLength(21)
    expect(r.contributedByYear[0]).toBe(100)
  })

  it('explains 0% and zero money kindly', () => {
    const zeroRate: GrowthInputs = { start: 100, monthly: 20, rate: 0, years: 10 }
    expect(calculate(zeroRate).growth).toBe(0)
    expect(shareLine(calculate(zeroRate))).toMatch(/No growth/)
    const nothing: GrowthInputs = { start: 0, monthly: 0, rate: 7, years: 10 }
    expect(shareLine(calculate(nothing))).toMatch(/Add some money/)
    expect(shareLine(calculate({ start: 500, monthly: 100, rate: 7, years: 30 }))).toMatch(/% of the total/)
  })

  it('races the early bird against the late starter', () => {
    const e = earlyBird(50, 7)
    expect(e.borrowed).toBe(false)
    expect(e.early).toBeGreaterThan(e.late)
    expect(e.extraIn).toBe(6000)
    expect(earlyBirdLine(e, 7)).toMatch(/ends up \d+x that amount ahead/)
    const flat = earlyBird(50, 0)
    expect(flat.gap).toBeCloseTo(flat.extraIn, 6)
    expect(earlyBird(0, 7).borrowed).toBe(true)
  })

  it('does the Rule of 72', () => {
    expect(ruleOf72(7, 1000).title).toBe('At 7%, your money doubles about every 10 years')
    expect(ruleOf72(0, 1000).title).toMatch(/never doubles/)
    expect(ruleOf72(0.5, 0).body).toMatch(/Rule of 72/)
    expect(ruleOf72(0.5, 0).body).not.toMatch(/grow to/)
  })

  it('knows how old you will be', () => {
    expect(ageThen(13, 20)).toBe("You'd be 33")
    expect(ageThen(NaN, 20)).toBeNull()
  })

  it('never shows NaN, Infinity, or an em dash', () => {
    for (const start of [0, 10, 10000])
      for (const monthly of [0, 5, 500])
        for (const rate of [0, 0.5, 4, 7, 12])
          for (const years of [1, 20, 50]) {
            const i = { start, monthly, rate, years }
            const r = calculate(i)
            const e = earlyBird(monthly, rate)
            const rule = ruleOf72(rate, start)
            for (const text of [shareLine(r), earlyBirdLine(e, rate), rule.title, rule.body]) expect(text).not.toMatch(bad)
            for (const n of [r.total, r.contributed, r.growth, r.growthShare, e.early, e.late, e.gap]) expect(Number.isFinite(n)).toBe(true)
          }
  })
})
