/*
  The one and only game store. Everything the player has done lives here and
  is saved to the device automatically (localStorage, key "vector-save").
  No accounts, no servers.

  In components:
    const coins = useGame((s) => s.coins)            // read (re-renders on change)
    const finishLesson = useGame((s) => s.finishLesson)
  Outside React:
    useGame.getState().track(EVENTS.budgetSaved)
*/
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getUnit } from '../content'
import { dayKey, weekStart, type DayKey } from '../lib/dates'
import { newlyEarned, getBadge, EVENTS, type EventName } from './badges'
import { AVATARS, COINS, DEFAULT_AVATAR, DOUBLE_XP_MS, MAX_HEARTS, SHOP_ITEMS, XP, type ShopItem } from './constants'
import { accrueVault, applyStreak, displayStreak, normalizeHearts, rollLeague } from './logic'
import { isTierUnlocked } from './progress'
import type { GameData, LessonResult, QuizResult, Reward, Settings, Profile, Toast } from './types'

export function initialData(now: Date = new Date()): GameData {
  const today = dayKey(now)
  return {
    version: 1,
    onboarded: false,
    profile: { name: '', age: 0, avatar: DEFAULT_AVATAR, joinedDay: today },
    settings: { sound: true, haptics: true, dailyGoal: 20, theme: 'system', heartsOn: true, unlockAll: false },
    lessons: {},
    quizzes: {},
    mistakes: [],
    xpTotal: 0,
    xpByDay: {},
    goalDays: [],
    coins: COINS.startingBalance,
    hearts: MAX_HEARTS,
    heartsUpdatedAt: now.getTime(),
    doubleXpUntil: 0,
    streak: { count: 0, longest: 0, lastDay: null, freezes: 0, frozenDays: [] },
    league: { weekKey: weekStart(today), division: 0, weekXp: 0, lastResult: null },
    vault: { balance: 0, lastAccrualDay: null, totalInterest: 0 },
    badges: {},
    ownedAvatars: AVATARS.filter((a) => a.price === 0).map((a) => a.id),
    stats: { lessonsCompleted: 0, perfectLessons: 0, quizzesPassed: 0, perfectQuizzes: 0, practiceDone: 0, coinsEarned: 0, purchases: 0, events: {} },
    tools: {},
  }
}

export type BuyResult = { ok: true } | { ok: false; reason: 'coins' | 'maxed' | 'full' | 'owned' }

interface Actions {
  completeOnboarding(p: { name: string; age: number; dailyGoal: number }): void
  updateSettings(patch: Partial<Settings>): void
  updateProfile(patch: Partial<Profile>): void

  /** Call when a wrong answer should cost a heart. Returns hearts left. */
  loseHeart(now?: Date): number
  /** Saves a missed question for Practice right away (not just when the lesson ends). */
  noteMistake(exerciseId: string): void
  finishLesson(r: LessonResult, now?: Date): Reward
  finishQuiz(r: QuizResult, now?: Date): Reward
  finishPractice(r: { total: number; mistakes: number; correctIds: string[]; missedIds: string[] }, now?: Date): Reward

  buyItem(id: ShopItem['id'], now?: Date): BuyResult
  /** Takes an avatar id from AVATARS. */
  buyAvatar(id: string): BuyResult
  setAvatar(id: string): void

  vaultDeposit(amount: number, now?: Date): boolean
  vaultWithdraw(amount: number, now?: Date): boolean

  /** Settles anything time-based: vault interest, league week rollover. Safe to call often. */
  syncTime(now?: Date): void
  markLeagueResultSeen(): void

  /** Bump an event counter (for badges). */
  track(event: EventName, amount?: number): void
  setToolState(toolId: string, value: unknown): void

  pushToast(t: Omit<Toast, 'id'>): void
  dismissToast(id: string): void
  resetAll(): void
}

export type GameStore = GameData & { toasts: Toast[] } & Actions

let toastSeq = 0

export const useGame = create<GameStore>()(
  persist(
    (set, get) => {
      /**
        Applies a change, then awards any badges it unlocked (each badge pays
        out coins and pops a toast). Returns the ids of new badges.
      */
      const commit = (patch: Partial<GameData>): string[] => {
        let next = { ...get(), ...patch } as GameStore
        const earnedAll: string[] = []
        for (let guard = 0; guard < 4; guard++) {
          const earned = newlyEarned(next)
          if (!earned.length) break
          const day = dayKey()
          const badges = { ...next.badges }
          for (const id of earned) badges[id] = day
          const gain = earned.length * COINS.badge
          next = {
            ...next,
            badges,
            coins: next.coins + gain,
            stats: { ...next.stats, coinsEarned: next.stats.coinsEarned + gain },
          }
          earnedAll.push(...earned)
        }
        const toasts = [
          ...next.toasts,
          ...earnedAll.map((id) => {
            const b = getBadge(id)!
            return { id: `t${++toastSeq}`, emoji: b.emoji, title: `Badge unlocked: ${b.name}`, body: `+${COINS.badge} coins. ${b.description}`, tone: 'badge' as const }
          }),
        ]
        set({ ...next, toasts })
        return earnedAll
      }

      /** XP + streak + daily goal + league, shared by lessons, quizzes, and practice. */
      const earnXp = (s: GameStore, baseXp: number, now: Date) => {
        const today = dayKey(now)
        const doubled = s.doubleXpUntil > now.getTime()
        const xp = baseXp * (doubled ? 2 : 1)
        const before = s.xpByDay[today] ?? 0
        const after = before + xp
        const goal = s.settings.dailyGoal
        const dailyGoalHit = before < goal && after >= goal && !s.goalDays.includes(today)
        const league = rollLeague(s.league, now, s.profile.name, s.profile.avatar)
        const streakBefore = displayStreak(s.streak, today)
        const streak = applyStreak(s.streak, today)
        const xpByDay = pruneDays({ ...s.xpByDay, [today]: after })
        return {
          xp,
          doubled,
          dailyGoalHit,
          streakBefore,
          patch: {
            xpTotal: s.xpTotal + xp,
            xpByDay,
            goalDays: dailyGoalHit ? [...s.goalDays, today].slice(-120) : s.goalDays,
            league: { ...league, weekXp: league.weekXp + xp },
            streak,
          } satisfies Partial<GameData>,
          bonusCoins: dailyGoalHit ? COINS.dailyGoal : 0,
        }
      }

      const timeEvents = (s: GameStore, now: Date) => {
        const h = now.getHours()
        const events = { ...s.stats.events }
        if (h < 8) events[EVENTS.earlyLesson] = (events[EVENTS.earlyLesson] ?? 0) + 1
        if (h >= 21) events[EVENTS.lateLesson] = (events[EVENTS.lateLesson] ?? 0) + 1
        return events
      }

      return {
        ...initialData(),
        toasts: [],

        completeOnboarding({ name, age, dailyGoal }) {
          const s = get()
          commit({ onboarded: true, profile: { ...s.profile, name: name.trim(), age }, settings: { ...s.settings, dailyGoal } })
        },

        updateSettings(patch) {
          set({ settings: { ...get().settings, ...patch } })
        },

        updateProfile(patch) {
          set({ profile: { ...get().profile, ...patch } })
        },

        loseHeart(now = new Date()) {
          const s = get()
          if (!s.settings.heartsOn) return MAX_HEARTS
          const n = normalizeHearts(s.hearts, s.heartsUpdatedAt, now.getTime())
          const hearts = Math.max(0, n.hearts - 1)
          set({ hearts, heartsUpdatedAt: n.hearts >= MAX_HEARTS ? now.getTime() : n.updatedAt })
          return hearts
        },

        noteMistake(exerciseId) {
          set({ mistakes: mergeMistakes(get().mistakes, [exerciseId]) })
        },

        finishLesson(r, now = new Date()) {
          const s = get()
          const today = dayKey(now)
          const perfect = r.mistakes === 0
          const accuracy = r.total ? r.total / (r.total + r.mistakes) : 1
          const prev = s.lessons[r.lessonId]
          const x = earnXp(s, XP.lesson + (perfect ? XP.lessonPerfectBonus : 0), now)
          const coins = (prev ? COINS.lessonRepeat : COINS.lessonFirstTime) + (perfect ? COINS.lessonPerfectBonus : 0) + x.bonusCoins
          const lessons = {
            ...s.lessons,
            [r.lessonId]: prev
              ? { ...prev, completions: prev.completions + 1, bestAccuracy: Math.max(prev.bestAccuracy, accuracy), lastDay: today }
              : { completions: 1, bestAccuracy: accuracy, firstDay: today, lastDay: today },
          }
          const tier2Before = isTierUnlocked(s, 2)
          const next: Partial<GameData> = {
            ...x.patch,
            lessons,
            coins: s.coins + coins,
            mistakes: mergeMistakes(s.mistakes, r.missedIds),
            stats: {
              ...s.stats,
              lessonsCompleted: s.stats.lessonsCompleted + 1,
              perfectLessons: s.stats.perfectLessons + (perfect ? 1 : 0),
              coinsEarned: s.stats.coinsEarned + coins,
              events: timeEvents(s, now),
            },
          }
          const tier2After = isTierUnlocked({ ...s, ...next } as GameData, 2)
          const newBadges = commit(next)
          return {
            xp: x.xp,
            coins,
            perfect,
            accuracy,
            streakBefore: x.streakBefore,
            streakAfter: get().streak.count,
            dailyGoalHit: x.dailyGoalHit,
            newBadges,
            doubleXp: x.doubled,
            tierUnlocked: !tier2Before && tier2After ? 2 : undefined,
          }
        },

        finishQuiz(r, now = new Date()) {
          const s = get()
          const unit = getUnit(r.unitId)
          const passPct = unit?.quiz.passPercent ?? 70
          const score = r.total ? r.correct / r.total : 0
          const passed = score * 100 >= passPct
          const perfect = r.correct === r.total
          const prev = s.quizzes[r.unitId]
          const firstPass = passed && !prev?.passed
          const x = earnXp(s, passed ? XP.quizPass + (perfect ? XP.quizPerfectBonus : 0) : XP.quizFail, now)
          const coins = (firstPass ? COINS.quizPass + (perfect ? COINS.quizPerfectBonus : 0) : passed ? 3 : 0) + x.bonusCoins
          const tier2Before = isTierUnlocked(s, 2)
          const next: Partial<GameData> = {
            ...x.patch,
            quizzes: {
              ...s.quizzes,
              [r.unitId]: {
                attempts: (prev?.attempts ?? 0) + 1,
                passed: passed || !!prev?.passed,
                bestScore: Math.max(prev?.bestScore ?? 0, score),
              },
            },
            coins: s.coins + coins,
            mistakes: mergeMistakes(s.mistakes, r.missedIds),
            stats: {
              ...s.stats,
              quizzesPassed: s.stats.quizzesPassed + (firstPass ? 1 : 0),
              perfectQuizzes: s.stats.perfectQuizzes + (passed && perfect ? 1 : 0),
              coinsEarned: s.stats.coinsEarned + coins,
              events: timeEvents(s, now),
            },
          }
          const tier2After = isTierUnlocked({ ...s, ...next } as GameData, 2)
          const newBadges = commit(next)
          return {
            xp: x.xp,
            coins,
            perfect,
            accuracy: score,
            passed,
            streakBefore: x.streakBefore,
            streakAfter: get().streak.count,
            dailyGoalHit: x.dailyGoalHit,
            newBadges,
            doubleXp: x.doubled,
            tierUnlocked: !tier2Before && tier2After ? 2 : undefined,
          }
        },

        finishPractice(r, now = new Date()) {
          const s = get()
          const perfect = r.mistakes === 0
          const x = earnXp(s, XP.practice, now)
          const coins = COINS.practice + x.bonusCoins
          const n = normalizeHearts(s.hearts, s.heartsUpdatedAt, now.getTime())
          const hearts = Math.min(MAX_HEARTS, n.hearts + 1)
          const cleared = new Set(r.correctIds)
          const next: Partial<GameData> = {
            ...x.patch,
            coins: s.coins + coins,
            hearts,
            heartsUpdatedAt: hearts >= MAX_HEARTS ? now.getTime() : n.updatedAt,
            mistakes: mergeMistakes(s.mistakes.filter((id) => !cleared.has(id)), r.missedIds),
            stats: { ...s.stats, practiceDone: s.stats.practiceDone + 1, coinsEarned: s.stats.coinsEarned + coins, events: timeEvents(s, now) },
          }
          const newBadges = commit(next)
          return {
            xp: x.xp,
            coins,
            perfect,
            accuracy: r.total ? r.total / (r.total + r.mistakes) : 1,
            streakBefore: x.streakBefore,
            streakAfter: get().streak.count,
            dailyGoalHit: x.dailyGoalHit,
            newBadges,
            doubleXp: x.doubled,
          }
        },

        buyItem(id, now = new Date()) {
          const s = get()
          const item = SHOP_ITEMS.find((i) => i.id === id)!
          if (s.coins < item.price) return { ok: false, reason: 'coins' }
          const base: Partial<GameData> = { coins: s.coins - item.price, stats: { ...s.stats, purchases: s.stats.purchases + 1 } }
          if (id === 'streak-freeze') {
            if (s.streak.freezes >= (item.maxOwned ?? 99)) return { ok: false, reason: 'maxed' }
            commit({ ...base, streak: { ...s.streak, freezes: s.streak.freezes + 1 } })
          } else if (id === 'heart-refill') {
            const n = normalizeHearts(s.hearts, s.heartsUpdatedAt, now.getTime())
            if (n.hearts >= MAX_HEARTS || !s.settings.heartsOn) return { ok: false, reason: 'full' }
            commit({ ...base, hearts: MAX_HEARTS, heartsUpdatedAt: now.getTime() })
          } else {
            commit({ ...base, doubleXpUntil: Math.max(now.getTime(), s.doubleXpUntil) + DOUBLE_XP_MS })
          }
          return { ok: true }
        },

        buyAvatar(id) {
          const s = get()
          const item = AVATARS.find((a) => a.id === id)
          if (!item) return { ok: false, reason: 'owned' }
          if (s.ownedAvatars.includes(id)) return { ok: false, reason: 'owned' }
          if (s.coins < item.price) return { ok: false, reason: 'coins' }
          commit({
            coins: s.coins - item.price,
            ownedAvatars: [...s.ownedAvatars, id],
            profile: { ...s.profile, avatar: id },
            stats: { ...s.stats, purchases: s.stats.purchases + 1 },
          })
          return { ok: true }
        },

        setAvatar(id) {
          const s = get()
          if (s.ownedAvatars.includes(id)) set({ profile: { ...s.profile, avatar: id } })
        },

        vaultDeposit(amount, now = new Date()) {
          const s = get()
          const n = Math.floor(amount)
          if (n <= 0 || n > s.coins) return false
          const { vault } = accrueVault(s.vault, dayKey(now))
          const events = { ...s.stats.events, [EVENTS.vaultDeposit]: (s.stats.events[EVENTS.vaultDeposit] ?? 0) + 1 }
          commit({ coins: s.coins - n, vault: { ...vault, balance: vault.balance + n }, stats: { ...s.stats, events } })
          return true
        },

        vaultWithdraw(amount, now = new Date()) {
          const s = get()
          const { vault } = accrueVault(s.vault, dayKey(now))
          const n = Math.floor(amount)
          if (n <= 0 || n > Math.floor(vault.balance)) return false
          commit({ coins: s.coins + n, vault: { ...vault, balance: vault.balance - n } })
          return true
        },

        syncTime(now = new Date()) {
          const s = get()
          const today = dayKey(now)
          const { vault } = accrueVault(s.vault, today)
          const league = rollLeague(s.league, now, s.profile.name, s.profile.avatar)
          const patch: Partial<GameData> = {}
          if (vault !== s.vault) patch.vault = vault
          if (league !== s.league) {
            patch.league = league
            if (league.lastResult && !league.lastResult.seen && league.lastResult.outcome === 'promoted' && league.lastResult.weekKey !== s.league.lastResult?.weekKey) {
              patch.stats = {
                ...s.stats,
                events: { ...s.stats.events, [EVENTS.leaguePromoted]: (s.stats.events[EVENTS.leaguePromoted] ?? 0) + 1 },
              }
            }
          }
          if (Object.keys(patch).length) commit(patch)
        },

        markLeagueResultSeen() {
          const l = get().league
          if (l.lastResult && !l.lastResult.seen) set({ league: { ...l, lastResult: { ...l.lastResult, seen: true } } })
        },

        track(event, amount = 1) {
          const s = get()
          commit({ stats: { ...s.stats, events: { ...s.stats.events, [event]: (s.stats.events[event] ?? 0) + amount } } })
        },

        setToolState(toolId, value) {
          set({ tools: { ...get().tools, [toolId]: value } })
        },

        pushToast(t) {
          set({ toasts: [...get().toasts, { ...t, id: `t${++toastSeq}` }] })
        },

        dismissToast(id) {
          set({ toasts: get().toasts.filter((t) => t.id !== id) })
        },

        resetAll() {
          set({ ...initialData(), toasts: [] })
        },
      }
    },
    {
      name: 'vector-save',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Save the game data only; skip toasts and functions.
      partialize: (s) => {
        const { toasts: _t, ...rest } = s
        const data: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(rest)) if (typeof v !== 'function') data[k] = v
        return data as unknown as GameStore
      },
      // Fill in any fields added in later versions so old saves never crash.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameData>
        const base = initialData()
        const avatars = migrateAvatars(p.profile?.avatar, p.ownedAvatars)
        return {
          ...current,
          ...base,
          ...p,
          profile: { ...base.profile, ...p.profile, avatar: avatars.avatar },
          ownedAvatars: avatars.ownedAvatars,
          settings: { ...base.settings, ...p.settings },
          streak: { ...base.streak, ...p.streak },
          league: { ...base.league, ...p.league },
          vault: { ...base.vault, ...p.vault },
          stats: { ...base.stats, ...p.stats, events: { ...p.stats?.events } },
        } as GameStore
      },
    },
  ),
)

/*
  Avatars used to be emoji. Old saves get the drawing at the same spot in the
  shop (same price), so nobody loses a purchase. Anything unknown is dropped,
  the free ones are always owned, and you can only wear something you own.
*/
const LEGACY_AVATARS: Record<string, string> = {
  '😎': 'coin',
  '🙂': 'piggy',
  '🤓': 'wallet',
  '🦊': 'sprout',
  '🐸': 'receipt',
  '🐼': 'calculator',
  '🐙': 'card',
  '🦄': 'chart',
  '🤖': 'bills',
  '👽': 'bank',
  '🐉': 'safe',
  '👑': 'goldbar',
}

function avatarIdFrom(v: unknown): string | null {
  if (typeof v !== 'string') return null
  if (AVATARS.some((a) => a.id === v)) return v
  return LEGACY_AVATARS[v] ?? null
}

export function migrateAvatars(avatar: unknown, owned: unknown): { avatar: string; ownedAvatars: string[] } {
  const have = new Set<string>(AVATARS.filter((a) => a.price === 0).map((a) => a.id))
  if (Array.isArray(owned)) {
    for (const o of owned) {
      const id = avatarIdFrom(o)
      if (id) have.add(id)
    }
  }
  const wearing = avatarIdFrom(avatar)
  return {
    avatar: wearing && have.has(wearing) ? wearing : DEFAULT_AVATAR,
    ownedAvatars: AVATARS.filter((a) => have.has(a.id)).map((a) => a.id),
  }
}

function mergeMistakes(existing: string[], added: string[]): string[] {
  const set = new Set<string>()
  const out: string[] = []
  for (const id of [...added, ...existing]) {
    if (!set.has(id)) {
      set.add(id)
      out.push(id)
    }
  }
  return out.slice(0, 60)
}

function pruneDays(byDay: Record<DayKey, number>): Record<DayKey, number> {
  const keys = Object.keys(byDay).sort()
  if (keys.length <= 120) return byDay
  const out: Record<DayKey, number> = {}
  for (const k of keys.slice(-120)) out[k] = byDay[k]
  return out
}
