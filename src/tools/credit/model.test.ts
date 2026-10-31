import { describe, expect, it } from 'vitest'
import { ACTIONS, BANDS, FACTORS, START, advance, bandOf, blockedReason, factorScores, runAction, scoreOf, type ActionId, type Profile } from './model'
import { sanitizeCredit, INITIAL_CREDIT } from './state'

const EM_DASH = '\u2014'

describe('credit model', () => {
  it('starts as fresh credit around 680', () => {
    const s = scoreOf(START)
    expect(s).toBeGreaterThanOrEqual(670)
    expect(s).toBeLessThanOrEqual(700)
  })

  it('factor weights add up to 100%', () => {
    expect(FACTORS.reduce((s, f) => s + f.weight, 0)).toBeCloseTo(1)
  })

  it('bands cover 300 to 850 with no gaps', () => {
    expect(BANDS[0].min).toBe(300)
    expect(BANDS[BANDS.length - 1].max).toBe(850)
    for (let i = 1; i < BANDS.length; i++) expect(BANDS[i].min).toBe(BANDS[i - 1].max + 1)
    expect(bandOf(579).id).toBe('poor')
    expect(bandOf(580).id).toBe('fair')
    expect(bandOf(670).id).toBe('good')
    expect(bandOf(740).id).toBe('veryGood')
    expect(bandOf(800).id).toBe('exceptional')
  })

  it('moves in believable directions', () => {
    const d = (id: ActionId, p: Profile = START) => {
      const o = runAction(p, id)
      return o.after - o.before
    }
    expect(d('pay')).toBeGreaterThanOrEqual(0)
    expect(d('miss')).toBeLessThan(-40)
    expect(d('maxout')).toBeLessThan(-20)
    expect(d('paydown')).toBeGreaterThan(5)
    expect(d('open3')).toBeLessThan(0)
    expect(d('close')).toBeLessThan(0)
    expect(d('year')).toBeGreaterThan(0)
    const maxed = runAction(START, 'maxout').next
    expect(d('paydown', maxed)).toBeGreaterThan(30)
  })

  it('late payments fade and fall off after 7 years', () => {
    const missed = runAction(START, 'miss').next
    const later = advance(missed, 85, true).p
    expect(later.missed.length).toBe(0)
    expect(scoreOf(later)).toBeGreaterThan(scoreOf(missed))
  })

  it('never produces NaN or out-of-range scores, and copy has no em dashes', () => {
    let p = START
    for (let i = 0; i < 400; i++) {
      const a = ACTIONS[(i * 7 + 3) % ACTIONS.length]
      if (blockedReason(p, a.id)) continue
      const o = runAction(p, a.id)
      expect(Number.isFinite(o.after)).toBe(true)
      expect(o.after).toBeGreaterThanOrEqual(300)
      expect(o.after).toBeLessThanOrEqual(850)
      expect(o.title + o.body).not.toContain(EM_DASH)
      expect(o.body).not.toMatch(/NaN|undefined|Infinity/)
      for (const v of Object.values(factorScores(o.next))) expect(Number.isFinite(v)).toBe(true)
      p = o.next
    }
  })

  it('missing more payments never raises the score', () => {
    let p = START
    for (let i = 0; i < 15; i++) {
      const o = runAction(p, 'miss')
      expect(o.after).toBeLessThanOrEqual(o.before)
      p = o.next
    }
    expect(factorScores(p).payment).toBeGreaterThan(0)
  })

  it('pay and open3 explanations match what actually moved', () => {
    let p = START
    for (let i = 0; i < 45; i++) p = runAction(p, 'pay').next
    const maxed = runAction(p, 'pay')
    expect(maxed.factorDelta.payment).toBe(0)
    expect(maxed.body).not.toMatch(/got a bit stronger/)
    const low = runAction(runAction(START, 'paydown').next, 'open3')
    expect(low.factorDelta.owed).toBe(0)
    expect(low.body).not.toMatch(/helped your utilization/)
  })

  it('sanitizes junk saved state', () => {
    expect(sanitizeCredit(undefined)).toEqual(INITIAL_CREDIT)
    expect(sanitizeCredit({ profile: { month: 'x' }, log: 'nope' }).log).toEqual([])
    expect(scoreOf(sanitizeCredit({ profile: { accounts: [{}] } }).profile)).toBeGreaterThanOrEqual(300)
  })
})
