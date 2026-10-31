import { describe, expect, it } from 'vitest'
import { futureValue, growthByYear, loanPayment, minimumPaymentPayoff, payoff, periodsToGoal, split503020, yearsToDouble } from './finance'

describe('finance math', () => {
  it('splits 50/30/20', () => {
    expect(split503020(1000)).toEqual({ needs: 500, wants: 300, savings: 200 })
  })

  it('grows money with compound interest', () => {
    // $1,000 at 12%/yr compounded monthly for 1 year ≈ $1,126.83
    expect(futureValue(1000, 0, 12, 1)).toBeCloseTo(1126.83, 1)
    const rows = growthByYear(0, 100, 0, 2)
    expect(rows).toHaveLength(3)
    expect(rows[2].balance).toBeCloseTo(2400)
    expect(rows[2].interest).toBeCloseTo(0)
  })

  it('applies the rule of 72', () => {
    expect(yearsToDouble(8)).toBe(9)
  })

  it('counts periods to a goal', () => {
    expect(periodsToGoal(100, 0, 20)).toBe(5)
    expect(periodsToGoal(100, 90, 20)).toBe(1)
    expect(periodsToGoal(100, 100, 20)).toBe(0)
    expect(periodsToGoal(100, 0, 0)).toBe(Infinity)
  })

  it('computes an amortized loan payment', () => {
    // $10,000 at 6% for 60 months ≈ $193.33/month
    expect(loanPayment(10000, 6, 60)).toBeCloseTo(193.33, 1)
    expect(loanPayment(1200, 0, 12)).toBeCloseTo(100)
  })

  it('pays off a debt with a fixed payment', () => {
    const r = payoff(1000, 0, 100)
    expect(r.months).toBe(10)
    expect(r.totalInterest).toBeCloseTo(0)
    expect(payoff(1000, 24, 10).never).toBe(true) // $10 never covers $20/mo interest
  })

  it('shows minimum payments take far longer than a fixed payment', () => {
    const min = minimumPaymentPayoff(3000, 24)
    const fixed = payoff(3000, 24, 150)
    expect(min.months).toBeGreaterThan(fixed.months)
    expect(min.totalInterest).toBeGreaterThan(fixed.totalInterest)
  })
})
