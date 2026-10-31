import { describe, expect, it } from 'vitest'
import { MEDICARE_RATE, estimatePaycheck, federalIncomeTax, roundBreakdown, topBracket, type Breakdown } from './tax'
import { KID_INITIAL, TEEN_INITIAL, sanitize } from './data'

describe('federalIncomeTax', () => {
  it('is zero under the standard deduction', () => {
    expect(federalIncomeTax(11_700)).toBe(0)
    expect(federalIncomeTax(15_000)).toBe(0)
    expect(topBracket(14_000)).toBe(0)
  })
  it('stacks the brackets like stairs', () => {
    expect(federalIncomeTax(30_000)).toBeCloseTo(1_560, 5) // 12k x 10% + 3k x 12%
    expect(federalIncomeTax(80_000)).toBeCloseTo(9_260, 5) // 1,200 + 4,320 + 3,740
    expect(topBracket(30_000)).toBe(0.12)
    expect(topBracket(80_000)).toBe(0.22)
  })
  it('never returns junk', () => {
    expect(federalIncomeTax(NaN)).toBe(0)
    expect(federalIncomeTax(-500)).toBe(0)
  })
})

describe('estimatePaycheck', () => {
  it('matches the spec defaults', () => {
    const r = estimatePaycheck({ wage: 15, hoursPerWeek: 15, tipsPerWeek: 0, stateRatePct: 4, frequency: 'biweekly' })
    expect(MEDICARE_RATE).toBe(0.0145)
    expect(r.perYear.gross).toBe(11_700)
    expect(r.perYear.federal).toBe(0)
    expect(r.perYear.socialSecurity).toBeCloseTo(725.4, 5)
    expect(r.perYear.medicare).toBeCloseTo(169.65, 5)
    expect(r.perYear.takeHome).toBeCloseTo(10_336.95, 5)
    // 450.00 - 27.90 - 6.53 (6.525 rounds up) - 0 - 18.00
    expect(r.perCheck.medicare).toBe(6.53)
    expect(r.perCheck.takeHome).toBe(397.57)
    expect(r.hoursPerCheck).toBe(30)
  })
  it('matches a hand calc for $20/hr x 40 hrs', () => {
    const r = estimatePaycheck({ wage: 20, hoursPerWeek: 40, tipsPerWeek: 0, stateRatePct: 4, frequency: 'biweekly' })
    // 41,600 - 15,000 deduction = 26,600 taxable: 12,000 x 10% + 14,600 x 12% = 2,952
    expect(r.perYear.gross).toBe(41_600)
    expect(r.perYear.federal).toBeCloseTo(2_952, 5)
    expect(r.perYear.socialSecurity).toBeCloseTo(2_579.2, 5)
    expect(r.perYear.medicare).toBeCloseTo(603.2, 5)
    expect(r.perYear.state).toBeCloseTo(1_664, 5)
    expect(r.perYear.takeHome).toBeCloseTo(33_801.6, 5)
    expect(r.perCheck.gross).toBe(1_600)
    expect(r.perCheck.federal).toBe(113.54)
    expect(r.perCheck.takeHome).toBeCloseTo(1_300.06, 5)
    expect(r.topBracket).toBe(0.12)
  })
  it('pay stub lines always add up to take-home (cents and whole dollars)', () => {
    const adds = (b: Breakdown, unit: number) => {
      const out = b.socialSecurity + b.medicare + b.federal + b.state
      expect(Math.abs(b.wages + b.tips - b.gross)).toBeLessThan(unit / 10)
      expect(Math.abs(b.gross - out - b.takeHome)).toBeLessThan(unit / 10)
    }
    for (const wage of [7.25, 13, 14, 15, 15.55, 20, 100]) {
      for (const hoursPerWeek of [1, 8, 15, 16, 40]) {
        for (const tipsPerWeek of [0, 10, 15.5]) {
          for (const stateRatePct of [0, 4, 4.5, 10]) {
            for (const frequency of ['weekly', 'biweekly'] as const) {
              const r = estimatePaycheck({ wage, hoursPerWeek, tipsPerWeek, stateRatePct, frequency })
              adds(r.perCheck, 0.01)
              adds(r.perYear, 0.01)
              adds(roundBreakdown(r.perYear, false), 1)
            }
          }
        }
      }
    }
    // The ages 11 to 14 default used to show $5,408 - $335 - $78 - $216 = $4,778 (it's $4,779).
    const kid = roundBreakdown(estimatePaycheck({ wage: 13, hoursPerWeek: 8, tipsPerWeek: 0, stateRatePct: 4, frequency: 'weekly' }).perYear, false)
    expect(kid.takeHome).toBe(4_779)
  })
  it('adds tips into gross pay', () => {
    const r = estimatePaycheck({ wage: 10, hoursPerWeek: 10, tipsPerWeek: 20, stateRatePct: 0, frequency: 'weekly' })
    expect(r.perCheck.gross).toBeCloseTo(120, 5)
    expect(r.perCheck.tips).toBeCloseTo(20, 5)
  })
  it('handles zero and garbage without NaN', () => {
    const r = estimatePaycheck({ wage: NaN, hoursPerWeek: Infinity, tipsPerWeek: -3, stateRatePct: NaN, frequency: 'weekly' })
    for (const v of [...Object.values(r.perCheck), ...Object.values(r.perYear), r.realHourly, r.keepRate]) expect(Number.isFinite(v)).toBe(true)
    expect(r.perYear.takeHome).toBe(0)
  })
})

describe('sanitize', () => {
  it('fills in missing or broken saved values', () => {
    expect(sanitize(undefined, TEEN_INITIAL)).toEqual(TEEN_INITIAL)
    const s = sanitize({ wage: 'lol', hours: 99, frequency: 'monthly', stateRate: -2 }, KID_INITIAL)
    expect(s.wage).toBe(KID_INITIAL.wage)
    expect(s.hours).toBe(40)
    expect(s.frequency).toBe(KID_INITIAL.frequency)
    expect(s.stateRate).toBe(0)
  })
})
