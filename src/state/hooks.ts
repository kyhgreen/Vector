/* React hooks for reading game state that depends on the clock. */
import { useCallback, useEffect, useState } from 'react'
import { dayKey } from '../lib/dates'
import { MAX_HEARTS } from './constants'
import { displayStreak, normalizeHearts, streakStatus } from './logic'
import { useGame } from './store'

/** Current time, re-rendering every `ms` milliseconds (default 30s). */
export function useNow(ms = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

/** Hearts right now, including any that refilled while the app was closed. */
export function useHearts() {
  const hearts = useGame((s) => s.hearts)
  const updatedAt = useGame((s) => s.heartsUpdatedAt)
  const heartsOn = useGame((s) => s.settings.heartsOn)
  const now = useNow(1000)
  const n = normalizeHearts(hearts, updatedAt, now.getTime())
  return { hearts: heartsOn ? n.hearts : MAX_HEARTS, max: MAX_HEARTS, nextInMs: n.nextInMs, unlimited: !heartsOn }
}

export function useStreak() {
  const streak = useGame((s) => s.streak)
  const now = useNow(60_000)
  const today = dayKey(now)
  return { count: displayStreak(streak, today), status: streakStatus(streak, today), freezes: streak.freezes, longest: streak.longest }
}

export function useXpToday() {
  const byDay = useGame((s) => s.xpByDay)
  const goal = useGame((s) => s.settings.dailyGoal)
  const now = useNow(60_000)
  const xp = byDay[dayKey(now)] ?? 0
  return { xp, goal, done: xp >= goal, pct: Math.min(1, goal ? xp / goal : 0) }
}

/**
  Saved state for a tool, stored on the device with the rest of the game.

    const [goals, setGoals] = useToolState<Goal[]>('savings', EMPTY_GOALS)

  Define the initial value OUTSIDE the component (a module constant), so it
  keeps the same identity between renders.
*/
export function useToolState<T>(toolId: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const stored = useGame((s) => s.tools[toolId]) as T | undefined
  const value = stored === undefined ? initial : stored
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const cur = (useGame.getState().tools[toolId] as T | undefined) ?? initial
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(cur) : next
      useGame.getState().setToolState(toolId, resolved)
    },
    [toolId, initial],
  )
  return [value, setValue]
}
