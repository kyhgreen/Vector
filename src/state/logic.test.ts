import { beforeEach, describe, expect, it } from 'vitest'
import { HEART_REFILL_MS, MAX_HEARTS } from './constants'
import { rivalsFor, rivalXpAt, standings } from './league'
import { accrueVault, applyStreak, displayStreak, normalizeHearts, rollLeague } from './logic'
import { initialData, useGame } from './store'
import type { StreakState } from './types'

// Node has no localStorage; give zustand's persist a throwaway one.
const mem = new Map<string, string>()
;(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: () => null,
  length: 0,
}

const fresh: StreakState = { count: 0, longest: 0, lastDay: null, freezes: 0, frozenDays: [] }

describe('streaks', () => {
  it('starts, continues, and resets', () => {
    let s = applyStreak(fresh, '2026-10-01')
    expect(s.count).toBe(1)
    s = applyStreak(s, '2026-10-01')
    expect(s.count).toBe(1)
    s = applyStreak(s, '2026-10-02')
    expect(s.count).toBe(2)
    s = applyStreak(s, '2026-10-05')
    expect(s.count).toBe(1)
    expect(s.longest).toBe(2)
  })

  it('uses streak freezes to cover missed days', () => {
    let s: StreakState = { ...fresh, count: 5, longest: 5, lastDay: '2026-10-01', freezes: 2 }
    expect(displayStreak(s, '2026-10-03')).toBe(5)
    s = applyStreak(s, '2026-10-03')
    expect(s.count).toBe(6)
    expect(s.freezes).toBe(1)
    expect(s.frozenDays).toEqual(['2026-10-02'])
  })

  it('shows 0 once the streak is broken', () => {
    const s: StreakState = { ...fresh, count: 9, lastDay: '2026-10-01' }
    expect(displayStreak(s, '2026-10-02')).toBe(9)
    expect(displayStreak(s, '2026-10-03')).toBe(0)
  })
})

describe('hearts', () => {
  it('refills one heart per interval, capped at max', () => {
    const t0 = 1_000_000
    expect(normalizeHearts(2, t0, t0 + HEART_REFILL_MS * 2 + 5).hearts).toBe(4)
    expect(normalizeHearts(2, t0, t0 + HEART_REFILL_MS * 10).hearts).toBe(MAX_HEARTS)
    const n = normalizeHearts(3, t0, t0 + HEART_REFILL_MS / 2)
    expect(n.hearts).toBe(3)
    expect(n.nextInMs).toBe(HEART_REFILL_MS / 2)
  })
})

describe('coin vault', () => {
  it('compounds daily', () => {
    const { vault, earned } = accrueVault({ balance: 100, lastAccrualDay: '2026-10-01', totalInterest: 0 }, '2026-10-03')
    expect(vault.balance).toBeCloseTo(104.04)
    expect(earned).toBeCloseTo(4.04)
  })
})

describe('league', () => {
  it('is deterministic for a given week', () => {
    expect(rivalsFor('2026-10-12', 0)).toEqual(rivalsFor('2026-10-12', 0))
    expect(rivalsFor('2026-10-12', 0)).not.toEqual(rivalsFor('2026-10-19', 0))
  })

  it('rival XP grows over the week and ends at target', () => {
    const r = rivalsFor('2026-10-12', 2)[0]
    expect(rivalXpAt(r, 0, '2026-10-12')).toBe(0)
    expect(rivalXpAt(r, 1, '2026-10-12')).toBe(r.target)
  })

  it('promotes a big week and settles on rollover', () => {
    const top = standings({ weekKey: '2026-10-12', division: 0, progress: 1, youXp: 5000, youName: 'Me', youAvatar: 'coin' })
    expect(top[0].isYou).toBe(true)
    const rolled = rollLeague({ weekKey: '2026-10-12', division: 0, weekXp: 5000, lastResult: null }, new Date(2026, 9, 20), 'Me', '😎')
    expect(rolled.weekKey).toBe('2026-10-19')
    expect(rolled.division).toBe(1)
    expect(rolled.weekXp).toBe(0)
    expect(rolled.lastResult?.outcome).toBe('promoted')
  })
})

describe('store', () => {
  beforeEach(() => useGame.setState({ ...initialData(), toasts: [] }))

  it('awards xp, coins, streak, and a badge for the first lesson', () => {
    const r = useGame.getState().finishLesson({ lessonId: 't1-u1-l1', total: 6, mistakes: 0, missedIds: [], durationMs: 60_000 }, new Date(2026, 9, 18, 12))
    const s = useGame.getState()
    expect(r.perfect).toBe(true)
    expect(r.xp).toBe(15)
    expect(s.xpTotal).toBe(15)
    expect(s.streak.count).toBe(1)
    expect(s.badges['first-lesson']).toBeDefined()
    expect(s.badges['perfect-1']).toBeDefined()
    expect(s.lessons['t1-u1-l1'].completions).toBe(1)
  })

  it('loses hearts and refills them in the shop', () => {
    const g = useGame.getState()
    g.loseHeart()
    g.loseHeart()
    expect(useGame.getState().hearts).toBe(MAX_HEARTS - 2)
    useGame.setState({ coins: 100 })
    expect(useGame.getState().buyItem('heart-refill').ok).toBe(true)
    expect(useGame.getState().hearts).toBe(MAX_HEARTS)
    expect(useGame.getState().coins).toBeLessThan(100 + 21) // paid 30, maybe earned a badge
  })

  it('does not take hearts in relaxed mode', () => {
    useGame.getState().updateSettings({ heartsOn: false })
    useGame.getState().loseHeart()
    expect(useGame.getState().hearts).toBe(MAX_HEARTS)
  })

  it('moves coins in and out of the vault', () => {
    useGame.setState({ coins: 50 })
    expect(useGame.getState().vaultDeposit(30)).toBe(true)
    expect(useGame.getState().vault.balance).toBe(30)
    expect(useGame.getState().vaultWithdraw(40)).toBe(false)
    expect(useGame.getState().vaultWithdraw(10)).toBe(true)
  })
})

describe('league rivals over a week', () => {
  it('never lose XP as the week goes on', () => {
    for (const division of [0, 4, 9]) {
      for (const r of rivalsFor('2026-10-12', division)) {
        let prev = 0
        for (let step = 0; step <= 7 * 24; step++) {
          const xp = rivalXpAt(r, step / (7 * 24), '2026-10-12')
          expect(xp).toBeGreaterThanOrEqual(prev)
          prev = xp
        }
        expect(prev).toBe(r.target)
      }
    }
  })
})

describe('mistakes for practice', () => {
  beforeEach(() => useGame.setState({ ...initialData(), toasts: [] }))

  it('saves a missed question right away', () => {
    useGame.getState().noteMistake('t1-u1-l1-e2')
    useGame.getState().noteMistake('t1-u1-l1-e2')
    expect(useGame.getState().mistakes).toEqual(['t1-u1-l1-e2'])
  })

  it('will not sell a heart refill in relaxed mode', () => {
    useGame.setState({ coins: 100 })
    useGame.getState().updateSettings({ heartsOn: false })
    expect(useGame.getState().buyItem('heart-refill').ok).toBe(false)
    expect(useGame.getState().coins).toBe(100)
  })
})
