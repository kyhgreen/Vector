import { describe, expect, it } from 'vitest'
import { UNITS, pathForTier } from './index'
import { validateUnit } from './validate'

describe('content', () => {
  it('has units in both tiers', () => {
    expect(UNITS.some((u) => u.tier === 1)).toBe(true)
    expect(UNITS.some((u) => u.tier === 2)).toBe(true)
  })

  for (const unit of UNITS) {
    it(`${unit.id} (${unit.title}) follows the content rules`, () => {
      expect(validateUnit(unit)).toEqual([])
    })
  }

  it('has unique unit orders within each tier', () => {
    for (const tier of [1, 2] as const) {
      const orders = UNITS.filter((u) => u.tier === tier).map((u) => u.order)
      expect(new Set(orders).size).toBe(orders.length)
    }
  })

  it('has unique exercise ids across all content', () => {
    const ids = UNITS.flatMap((u) => [
      ...u.lessons.flatMap((l) => l.exercises.map((e) => e.id)),
      ...u.quiz.exercises.map((e) => e.id),
    ])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('builds a path for each tier', () => {
    expect(pathForTier(1).length).toBeGreaterThan(0)
    expect(pathForTier(2).length).toBeGreaterThan(0)
  })
})
