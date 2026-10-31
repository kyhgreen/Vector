import { describe, expect, it } from 'vitest'
import { VAULT } from '../../state/constants'
import { accrueVault } from '../../state/logic'
import { balanceAfter, clock, coins0, coins2, dailyInterest, msToMidnight, opportunityValue, projectCompound, projectSimple, roughTime, ruleOf72, safe } from './vaultMath'

describe('vaultMath', () => {
  it('compounds 100 coins to 104.04 after two days at 2%', () => {
    expect(VAULT.dailyRatePct).toBe(2)
    const p = projectCompound(100, 2)
    expect(p).toHaveLength(3)
    expect(coins2(p[2])).toBe('104.04')
  })

  it('matches the store accrual exactly', () => {
    const start = { balance: 250, lastAccrualDay: '2026-01-01', totalInterest: 0 }
    const { vault } = accrueVault(start, '2026-01-31')
    expect(balanceAfter(250, 30)).toBeCloseTo(vault.balance, 9)
  })

  it('only pays interest on up to the cap', () => {
    expect(dailyInterest(VAULT.interestCap * 3)).toBeCloseTo(VAULT.interestCap * (VAULT.dailyRatePct / 100))
    expect(dailyInterest(-50)).toBe(0)
  })

  it('simple interest stays a straight line under compounding', () => {
    const c = projectCompound(50, 30)
    const s = projectSimple(50, 30)
    expect(s[0]).toBe(50)
    expect(s[30]).toBeCloseTo(50 + 30 * 1)
    expect(c[30]).toBeGreaterThan(s[30])
  })

  it('never returns NaN for junk input', () => {
    expect(safe(NaN)).toBe(0)
    expect(safe(undefined)).toBe(0)
    expect(coins2(NaN)).toBe('0.00')
    expect(coins0(Infinity)).toBe('0')
    expect(projectCompound(NaN, 3).every(Number.isFinite)).toBe(true)
    expect(Number.isFinite(opportunityValue(NaN, NaN))).toBe(true)
  })

  it('opportunity value is the price plus its extra growth', () => {
    expect(opportunityValue(0, 100)).toBeCloseTo(0)
    const v = opportunityValue(40, 0, 30)
    expect(v).toBeCloseTo(balanceAfter(40, 30))
    // Near the cap, extra coins earn less, never more.
    expect(opportunityValue(40, VAULT.interestCap, 30)).toBeCloseTo(40)
  })

  it('formats times and the rule of 72', () => {
    expect(clock(0)).toBe('0:00')
    expect(clock(65_000)).toBe('1:05')
    expect(clock(3_725_000)).toBe('1:02:05')
    expect(roughTime(30_000)).toBe('under a minute')
    expect(roughTime(125 * 60_000)).toBe('2h 5m')
    expect(roughTime(12 * 60_000)).toBe('12m')
    expect(ruleOf72(2)).toBe(36)
    expect(ruleOf72(0)).toBe(0)
    expect(msToMidnight(new Date(2026, 0, 1, 23, 0, 0))).toBe(60 * 60 * 1000)
  })
})
