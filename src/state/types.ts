import type { DayKey } from '../lib/dates'
import type { LeagueOutcome } from './league'

export interface LessonRecord {
  completions: number
  bestAccuracy: number // 0..1
  firstDay: DayKey
  lastDay: DayKey
}

export interface QuizRecord {
  attempts: number
  passed: boolean
  bestScore: number // 0..1
}

export interface Settings {
  sound: boolean
  haptics: boolean
  dailyGoal: number
  theme: 'system' | 'light' | 'dark'
  /** When false, wrong answers never cost hearts ("relaxed mode"). */
  heartsOn: boolean
  /** Demo mode: every lesson and tier is open. Handy for judges and demo videos. */
  unlockAll: boolean
}

export interface Profile {
  name: string
  age: number
  avatar: string
  joinedDay: DayKey
}

export interface StreakState {
  count: number
  longest: number
  lastDay: DayKey | null
  freezes: number
  /** Days a streak freeze covered. Shown as ice on the streak calendar. */
  frozenDays: DayKey[]
}

export interface LeagueState {
  weekKey: DayKey
  division: number
  weekXp: number
  lastResult: null | {
    weekKey: DayKey
    rank: number
    outcome: LeagueOutcome
    from: number
    to: number
    seen: boolean
  }
}

export interface VaultState {
  balance: number
  lastAccrualDay: DayKey | null
  totalInterest: number
}

export interface Toast {
  id: string
  emoji: string
  title: string
  body?: string
  tone?: 'badge' | 'info' | 'coins' | 'warning'
}

export interface Stats {
  lessonsCompleted: number
  perfectLessons: number
  quizzesPassed: number
  perfectQuizzes: number
  practiceDone: number
  coinsEarned: number
  purchases: number
  /** Free-form counters that tools and screens bump with `track(name)`. */
  events: Record<string, number>
}

export interface GameData {
  version: 1
  onboarded: boolean
  profile: Profile
  settings: Settings

  lessons: Record<string, LessonRecord>
  quizzes: Record<string, QuizRecord>
  /** Exercise ids the player got wrong, newest first. Feeds Practice mode. */
  mistakes: string[]

  xpTotal: number
  xpByDay: Record<DayKey, number>
  /** Days the daily goal was reached (so the bonus only pays once a day). */
  goalDays: DayKey[]
  coins: number
  hearts: number
  /** When `hearts` was last updated. Refill time counts from here. */
  heartsUpdatedAt: number
  doubleXpUntil: number

  streak: StreakState
  league: LeagueState
  vault: VaultState
  badges: Record<string, DayKey>
  ownedAvatars: string[]
  stats: Stats

  /** Each tool saves its own data here, under its tool id. See useToolState(). */
  tools: Record<string, unknown>
}

export interface LessonResult {
  lessonId: string
  /** Graded exercises in the lesson. */
  total: number
  /** Wrong answers given (a re-asked question that was missed twice counts twice). */
  mistakes: number
  missedIds: string[]
  durationMs: number
}

export interface QuizResult {
  unitId: string
  total: number
  correct: number
  missedIds: string[]
  durationMs: number
}

export interface Reward {
  xp: number
  coins: number
  perfect: boolean
  accuracy: number
  streakBefore: number
  streakAfter: number
  /** True if this finish pushed today's XP past the daily goal. */
  dailyGoalHit: boolean
  /** Badge ids earned by this finish. */
  newBadges: string[]
  /** For quizzes. */
  passed?: boolean
  /** Set when finishing this unlocked the next tier. */
  tierUnlocked?: number
  doubleXp: boolean
}
