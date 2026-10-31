import { describe, expect, it } from 'vitest'
import { draftProblem, eta, percentLabel, sanitize, sortGoals, speedUpTip, tookPhrase, weeksPhrase, type Goal } from './logic'

const now = new Date(2026, 9, 18) // Oct 18, 2026

const goal = (p: Partial<Goal>): Goal => ({
  id: 'x',
  name: 'Sneakers',
  emoji: '👟',
  color: 'orange',
  target: 90,
  saved: 0,
  weekly: 10,
  createdDay: '2026-10-01',
  doneDay: null,
  ...p,
})

describe('savings goals', () => {
  it('writes the ETA sentence with a date', () => {
    const r = eta(90, 0, 10, now)
    expect(r.tone).toBe('ok')
    expect(r.weeks).toBe(9)
    expect(r.text).toBe('$10 a week gets you there in 9 weeks, around Dec 20.')
  })

  it('handles $0 a week, no target, and done goals without NaN', () => {
    expect(eta(90, 0, 0, now).tone).toBe('none')
    expect(eta(0, 0, 10, now).tone).toBe('empty')
    expect(eta(90, 95, 10, now).tone).toBe('done')
    for (const r of [eta(NaN, NaN, NaN, now), eta(90, 0, 0.0001, now)]) {
      expect(r.text).not.toMatch(/NaN|Infinity|undefined/)
    }
  })

  it('shows years for far goals and the year for next-year dates', () => {
    expect(eta(3000, 0, 25, now).text).toMatch(/2029/)
    expect(eta(200, 0, 10, now).text).toMatch(/2027/)
    expect(weeksPhrase(1)).toBe('1 week')
    expect(weeksPhrase(26)).toBe('about 6 months')
  })

  it('suggests a faster plan only when it helps', () => {
    expect(speedUpTip(90, 0, 10)).toMatch(/sooner/)
    expect(speedUpTip(90, 85, 10)).toBeNull()
    expect(speedUpTip(90, 0, 0)).toBeNull()
  })

  it('never says 100% early', () => {
    expect(percentLabel({ target: 1000, saved: 999.9 })).toBe('99%')
    expect(percentLabel({ target: 100, saved: 100 })).toBe('100%')
  })

  it('cleans up junk saves', () => {
    const data = sanitize({ goals: [{ name: '', target: 'lots', saved: -4 }, null, 7, { id: 'a', target: 50, saved: 60 }] })
    expect(data.goals).toHaveLength(2)
    expect(data.goals[0].name).toBe('Untitled goal')
    expect(data.goals[0].target).toBe(0)
    expect(data.goals[0].saved).toBe(0)
    expect(data.goals[1].doneDay).not.toBeNull()
    expect(sanitize(undefined).goals).toEqual([])
    expect(sanitize('nope').goals).toEqual([])
  })

  it('sorts active goals first', () => {
    const a = goal({ id: 'a' })
    const b = goal({ id: 'b', saved: 90, doneDay: '2026-10-10' })
    const c = goal({ id: 'c' })
    expect(sortGoals([a, b, c]).map((g) => g.id)).toEqual(['c', 'a', 'b'])
  })

  it('validates the form kindly', () => {
    expect(draftProblem({ name: ' ', emoji: '🐷', target: 10, saved: 0, weekly: 1 }, 'new')).toMatch(/name/)
    expect(draftProblem({ name: 'Game', emoji: '🐷', target: 0, saved: 0, weekly: 1 }, 'new')).toMatch(/price/)
    expect(draftProblem({ name: 'Game', emoji: '🐷', target: 10, saved: 10, weekly: 1 }, 'new')).toMatch(/already/)
    expect(draftProblem({ name: 'Game', emoji: '🐷', target: 10, saved: 10, weekly: 1 }, 'edit')).toBeNull()
  })

  it('describes how long a goal took', () => {
    expect(tookPhrase({ createdDay: '2026-10-01', doneDay: '2026-10-01' })).toMatch(/Same day/)
    expect(tookPhrase({ createdDay: '2026-10-01', doneDay: '2026-10-05' })).toMatch(/4 days/)
    expect(tookPhrase({ createdDay: '2026-08-01', doneDay: '2026-10-01' })).toMatch(/9 weeks/)
  })

  it('gets the math right with cents and awkward numbers', () => {
    // 29 / 50 * 100 is 57.99999999999999 in floating point.
    expect(percentLabel({ target: 50, saved: 29 })).toBe('58%')
    expect(percentLabel({ target: 1, saved: 0.29 })).toBe('29%')
    expect(percentLabel({ target: 0, saved: 5 })).toBe('0%')
    // $2.10 at $0.15 a week is 14 weeks, not 15.
    expect(eta(2.1, 0, 0.15, now).weeks).toBe(14)
    expect(eta(1.05, 0, 0.35, now).weeks).toBe(3)
    // Less than a cent a week is $0 a week, so no finish line (and no "$0 a week takes 20 years").
    expect(eta(90, 0, 0.004, now).tone).toBe('none')
    expect(speedUpTip(90, 0, 0.004)).toBeNull()
    expect(eta(90, 89.999, 10, now).tone).toBe('done')
    expect(eta(90, NaN, 10, now).text).not.toMatch(/NaN|Invalid/)
    expect(draftProblem({ name: 'Game', emoji: '🐷', target: 0.004, saved: 0, weekly: 1 }, 'new')).toMatch(/price/)
    expect(draftProblem({ name: 'Game', emoji: '🐷', target: 90, saved: 89.999, weekly: 1 }, 'new')).toMatch(/already/)
  })

  it('keeps the same ids every time it cleans a save', () => {
    const raw = { goals: [{ name: 'A', target: 10 }, { id: 'dup', name: 'B', target: 10 }, { id: 'dup', name: 'C', target: 10 }] }
    const ids = sanitize(raw).goals.map((g) => g.id)
    expect(sanitize(raw).goals.map((g) => g.id)).toEqual(ids)
    expect(new Set(ids).size).toBe(3)
  })

  it('never shows NaN, Infinity, undefined, or an em dash', () => {
    const bad = /NaN|Infinity|undefined|Invalid|—/
    for (const target of [0, 0.5, 60, 3000, 1_000_000])
      for (const saved of [0, 0.29, 59.99, 60, 999_999])
        for (const weekly of [0, 0.01, 0.15, 2.5, 25, 1_000_000]) {
          const texts = [eta(target, saved, weekly, now).text, speedUpTip(target, saved, weekly) ?? '', percentLabel({ target, saved })]
          for (const t of texts) expect(t).not.toMatch(bad)
        }
  })
})
