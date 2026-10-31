/*
  Pure game rules: no React, no storage. Given some state and the time, they
  return new state. Keeping them pure makes them easy to test (logic.test.ts).
*/
import { addDays, dayKey, daysBetween, weekProgress, weekStart, type DayKey } from '../lib/dates'
import { HEART_REFILL_MS, MAX_HEARTS, VAULT } from './constants'
import { DIVISIONS, outcomeFor, standings } from './league'
import type { LeagueState, StreakState, VaultState } from './types'

/* ---------- Hearts ---------- */

export function normalizeHearts(hearts: number, updatedAt: number, now: number) {
  if (hearts >= MAX_HEARTS) return { hearts: MAX_HEARTS, updatedAt: now, nextInMs: 0 }
  const elapsed = Math.max(0, now - updatedAt)
  const gained = Math.floor(elapsed / HEART_REFILL_MS)
  const h = Math.min(MAX_HEARTS, hearts + gained)
  if (h >= MAX_HEARTS) return { hearts: MAX_HEARTS, updatedAt: now, nextInMs: 0 }
  const newUpdatedAt = updatedAt + gained * HEART_REFILL_MS
  return { hearts: h, updatedAt: newUpdatedAt, nextInMs: HEART_REFILL_MS - (now - newUpdatedAt) }
}

/* ---------- Streak ---------- */

/** Records activity on `today`. Uses streak freezes to cover missed days if it can. */
export function applyStreak(s: StreakState, today: DayKey): StreakState {
  if (s.lastDay === today) return s
  let { count, freezes } = s
  const frozenDays = [...s.frozenDays]
  if (!s.lastDay) {
    count = 1
  } else {
    const gap = daysBetween(s.lastDay, today)
    if (gap <= 0) return s // clock went backwards; ignore
    if (gap === 1) {
      count += 1
    } else {
      const missed = gap - 1
      if (freezes >= missed) {
        freezes -= missed
        for (let i = 1; i <= missed; i++) frozenDays.push(addDays(s.lastDay, i))
        count += 1
      } else {
        count = 1
      }
    }
  }
  return { count, longest: Math.max(s.longest, count), lastDay: today, freezes, frozenDays: frozenDays.slice(-60) }
}

/** The streak number to show right now (0 if it's already broken). */
export function displayStreak(s: StreakState, today: DayKey): number {
  if (!s.lastDay) return 0
  const gap = daysBetween(s.lastDay, today)
  if (gap <= 1) return s.count
  return s.freezes >= gap - 1 ? s.count : 0
}

export type StreakStatus = 'none' | 'done-today' | 'at-risk' | 'broken'

export function streakStatus(s: StreakState, today: DayKey): StreakStatus {
  if (!s.lastDay) return 'none'
  const gap = daysBetween(s.lastDay, today)
  if (gap === 0) return 'done-today'
  if (gap === 1) return 'at-risk'
  return s.freezes >= gap - 1 ? 'at-risk' : 'broken'
}

/* ---------- Coin Vault ---------- */

/** Adds daily compound interest for each full day since the last accrual. */
export function accrueVault(v: VaultState, today: DayKey): { vault: VaultState; earned: number } {
  if (!v.lastAccrualDay) return { vault: { ...v, lastAccrualDay: today }, earned: 0 }
  const days = Math.min(365, daysBetween(v.lastAccrualDay, today))
  if (days <= 0) return { vault: v, earned: 0 }
  let balance = v.balance
  for (let i = 0; i < days; i++) {
    balance += Math.min(balance, VAULT.interestCap) * (VAULT.dailyRatePct / 100)
  }
  const earned = balance - v.balance
  return { vault: { balance, lastAccrualDay: today, totalInterest: v.totalInterest + earned }, earned }
}

/* ---------- League ---------- */

/**
  If a new week has started, settles last week's standings and starts fresh.
  Returns the same object if nothing changed.
*/
export function rollLeague(l: LeagueState, now: Date, youName: string, youAvatar: string): LeagueState {
  const current = weekStart(dayKey(now))
  if (l.weekKey === current) return l
  const final = standings({ weekKey: l.weekKey, division: l.division, progress: 1, youXp: l.weekXp, youName, youAvatar })
  const you = final.find((r) => r.isYou)!
  const outcome = outcomeFor(you.rank, final.length, l.division, l.weekXp)
  const to = Math.max(0, Math.min(DIVISIONS.length - 1, l.division + (outcome === 'promoted' ? 1 : outcome === 'demoted' ? -1 : 0)))
  return {
    weekKey: current,
    division: to,
    weekXp: 0,
    lastResult: l.weekXp > 0 ? { weekKey: l.weekKey, rank: you.rank, outcome, from: l.division, to, seen: false } : l.lastResult,
  }
}

export { weekProgress }
