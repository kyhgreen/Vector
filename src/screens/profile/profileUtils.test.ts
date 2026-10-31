import { describe, expect, it } from 'vitest'
import { BADGES } from '../../state/badges'
import { initialData } from '../../state/store'
import type { GameData } from '../../state/types'
import {
  badgeAction,
  badgePreview,
  badgeProgress,
  displayName,
  earnedCount,
  joinedLabel,
  longDate,
  nudgeLine,
  rankFor,
  RANKS,
  safeNum,
  shortDate,
} from './profileUtils'

const EM_DASH = '—'

describe('profile helpers never show junk', () => {
  it('safeNum turns NaN, Infinity, negatives, and non-numbers into safe values', () => {
    expect(safeNum(NaN)).toBe(0)
    expect(safeNum(Infinity)).toBe(0)
    expect(safeNum(-5)).toBe(0)
    expect(safeNum('12')).toBe(0)
    expect(safeNum(undefined)).toBe(0)
    expect(safeNum(7)).toBe(7)
  })

  it('blank names become Money Rookie', () => {
    expect(displayName('')).toBe('Money Rookie')
    expect(displayName('   ')).toBe('Money Rookie')
    expect(displayName(undefined)).toBe('Money Rookie')
    expect(displayName('  Sam ')).toBe('Sam')
  })

  it('dates are friendly or null, never "Invalid Date"', () => {
    expect(joinedLabel('2026-10-03')).toBe('Joined October 2026')
    expect(joinedLabel('garbage')).toBe('Joined recently')
    expect(joinedLabel(undefined)).toBe('Joined recently')
    expect(shortDate('2026-10-03')).toBe('Oct 3, 2026')
    expect(longDate('nope')).toBeNull()
  })

  it('rankFor handles zero, junk, and the max rank', () => {
    expect(rankFor(0).level).toBe(1)
    expect(rankFor(NaN).pct).toBe(0)
    const top = rankFor(1e9)
    expect(top.level).toBe(RANKS.length)
    expect(top.next).toBeUndefined()
    expect(top.pct).toBe(1)
    expect(top.toNext).toBe(0)
    const mid = rankFor(175)
    expect(mid.pct).toBeGreaterThan(0)
    expect(mid.pct).toBeLessThan(1)
    expect(Number.isFinite(mid.toNext)).toBe(true)
  })
})

describe('badge helpers', () => {
  const data = initialData(new Date(2026, 9, 3)) as GameData

  it('progress is always a finite [cur, goal] with goal >= 1', () => {
    for (const b of BADGES) {
      const [cur, goal] = badgeProgress(b, data)
      expect(Number.isFinite(cur)).toBe(true)
      expect(goal).toBeGreaterThanOrEqual(1)
      expect(cur).toBeLessThanOrEqual(goal)
    }
  })

  it('preview shows earned badges first', () => {
    const withBadge = { ...data, badges: { [BADGES[5].id]: '2026-10-03' } }
    const preview = badgePreview(withBadge, 6)
    expect(preview).toHaveLength(6)
    expect(preview[0].id).toBe(BADGES[5].id)
    expect(earnedCount(withBadge)).toBe(1)
  })

  it('every badge has somewhere to go and copy has no em dashes', () => {
    for (const b of BADGES) {
      const a = badgeAction(b.id)
      expect(a.to.startsWith('/')).toBe(true)
      expect(a.label).not.toContain(EM_DASH)
    }
    for (const [c, g] of [
      [0, 5],
      [4, 5],
      [3, 5],
      [1, 10],
    ]) {
      expect(nudgeLine(c, g)).not.toContain(EM_DASH)
      expect(nudgeLine(c, g)).not.toMatch(/NaN|undefined/)
    }
    // Progress is full but the badge hasn't been handed out yet: no "0 to go".
    expect(nudgeLine(1, 1)).not.toMatch(/0 to go/)
  })
})
