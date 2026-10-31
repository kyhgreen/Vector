/*
  The lesson player's brain, kept free of React so it can be unit tested.

  planSession()  decides WHAT gets played (lesson, unit quiz, or practice mix).
  startRun() / gradeCurrent() / advanceRun()  track the run as it's played:
    - lesson & practice: a missed question is re-queued at the end until it's
      answered right (Duolingo style)
    - quiz: one shot per question, no re-queue
  lessonResult() / quizResult() / practiceResult()  build what the store wants.
*/
import { getExercise, getLessonInfo, getUnit, quizNodeId } from '../../content'
import { isQuestion, type Exercise, type QuestionExercise, type UnitColor } from '../../content/types'
import { shuffle } from '../../lib/random'
import { canStart } from '../../state/progress'
import type { GameData, LessonResult, QuizResult } from '../../state/types'

export type Mode = 'lesson' | 'quiz' | 'practice'

/** Practice pulls at most this many questions from your mistakes. */
export const PRACTICE_MAX = 10
/** If practice has fewer than this, it tops up with questions from finished lessons. */
export const PRACTICE_MIN = 5

export interface SessionPlan {
  mode: Mode
  /** The lesson id (lesson mode), the unit id (quiz mode), or 'practice'. */
  refId: string
  title: string
  color: UnitColor
  unitId?: string
  exercises: Exercise[]
  /** Quiz only. */
  passPercent: number
}

export type PlanOutcome = { kind: 'ok'; plan: SessionPlan } | { kind: 'redirect' } | { kind: 'empty' }

/** The unit an exercise belongs to, from its id ("t1-u2-l3-e4" → "t1-u2"). */
export function unitIdOf(exerciseId: string): string {
  const m = /^(t\d+-u\d+)/.exec(exerciseId)
  return m ? m[1] : ''
}

export function planSession(mode: Mode, id: string | undefined, data: GameData, rand: () => number = Math.random): PlanOutcome {
  const demo = data.settings.unlockAll

  if (mode === 'lesson') {
    const info = id ? getLessonInfo(id) : undefined
    // Half-written content (no exercises yet) bounces back to Learn instead of crashing.
    if (!info || !info.lesson.exercises?.length) return { kind: 'redirect' }
    if (!demo && !canStart(data, info.unit.tier, info.lesson.id)) return { kind: 'redirect' }
    return {
      kind: 'ok',
      plan: {
        mode,
        refId: info.lesson.id,
        title: info.lesson.title,
        color: info.unit.color,
        unitId: info.unit.id,
        exercises: dedupe(info.lesson.exercises),
        passPercent: 70,
      },
    }
  }

  if (mode === 'quiz') {
    const unit = id ? getUnit(id) : undefined
    if (!unit || !unit.quiz?.exercises?.length) return { kind: 'redirect' }
    if (!demo && !canStart(data, unit.tier, quizNodeId(unit.id))) return { kind: 'redirect' }
    return {
      kind: 'ok',
      plan: {
        mode,
        refId: unit.id,
        title: `${unit.title} quiz`,
        color: unit.color,
        unitId: unit.id,
        exercises: dedupe(unit.quiz.exercises),
        passPercent: unit.quiz.passPercent ?? 70,
      },
    }
  }

  // Practice: your mistakes first, then a top-up from lessons you've finished.
  const picked: QuestionExercise[] = []
  const seen = new Set<string>()
  for (const exId of data.mistakes) {
    if (picked.length >= PRACTICE_MAX) break
    const ex = getExercise(exId)
    if (!ex || !isQuestion(ex) || seen.has(ex.id)) continue
    seen.add(ex.id)
    picked.push(ex)
  }
  if (picked.length < PRACTICE_MIN) {
    const pool: QuestionExercise[] = []
    for (const lessonId of Object.keys(data.lessons)) {
      const info = getLessonInfo(lessonId)
      if (!info) continue
      for (const ex of info.lesson.exercises ?? []) if (isQuestion(ex) && !seen.has(ex.id)) pool.push(ex)
    }
    for (const ex of shuffle(pool, rand)) {
      if (picked.length >= PRACTICE_MIN) break
      if (seen.has(ex.id)) continue
      seen.add(ex.id)
      picked.push(ex)
    }
  }
  if (!picked.length) return { kind: 'empty' }
  const firstUnit = getUnit(unitIdOf(picked[0].id))
  return {
    kind: 'ok',
    plan: {
      mode,
      refId: 'practice',
      title: 'Practice',
      color: firstUnit?.color ?? 'teal',
      exercises: shuffle(picked, rand),
      passPercent: 70,
    },
  }
}

function dedupe<E extends Exercise>(list: E[]): E[] {
  const seen = new Set<string>()
  return list.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)))
}

/* ---------- The run ---------- */

export interface Item {
  ex: Exercise
  /** Unique per appearance, so a re-asked question mounts fresh. */
  key: string
  /** True when this is a re-ask of a question missed earlier. */
  retry: boolean
}

export interface RunState {
  mode: Mode
  queue: Item[]
  index: number
  /** Unique exercises in the session (teach cards included). */
  uniqueTotal: number
  /** Unique graded questions in the session. */
  gradedTotal: number
  /** Unique ids that are done (teach continued, question answered right, or quiz question answered). */
  finished: string[]
  /** Unique ids answered wrong at least once. */
  missed: string[]
  /** Unique ids answered right at some point. */
  correct: string[]
  /** Wrong answers given. A question missed twice counts twice. */
  mistakes: number
  combo: number
  bestCombo: number
}

export function startRun(plan: Pick<SessionPlan, 'mode' | 'exercises'>): RunState {
  return {
    mode: plan.mode,
    queue: plan.exercises.map((ex) => ({ ex, key: ex.id, retry: false })),
    index: 0,
    uniqueTotal: plan.exercises.length,
    gradedTotal: plan.exercises.filter(isQuestion).length,
    finished: [],
    missed: [],
    correct: [],
    mistakes: 0,
    combo: 0,
    bestCombo: 0,
  }
}

const addUnique = (list: string[], id: string) => (list.includes(id) ? list : [...list, id])

export const currentItem = (s: RunState): Item | undefined => s.queue[s.index]
export const isRunOver = (s: RunState) => s.index >= s.queue.length
export const progressOf = (s: RunState) => (s.uniqueTotal ? Math.min(1, s.finished.length / s.uniqueTotal) : 0)

/**
  Records the answer to the current question.
  `requeue: false` (used by matching) means a miss still counts for stats but
  the question isn't asked again.
*/
export function gradeCurrent(s: RunState, correct: boolean, opts: { requeue?: boolean } = {}): RunState {
  const item = currentItem(s)
  if (!item || !isQuestion(item.ex)) return s
  const id = item.ex.id
  if (correct) {
    const combo = s.combo + 1
    return {
      ...s,
      finished: addUnique(s.finished, id),
      correct: addUnique(s.correct, id),
      combo,
      bestCombo: Math.max(s.bestCombo, combo),
    }
  }
  const base = { ...s, mistakes: s.mistakes + 1, missed: addUnique(s.missed, id), combo: 0 }
  if (s.mode === 'quiz' || opts.requeue === false) return { ...base, finished: addUnique(s.finished, id) }
  const attempt = s.queue.filter((q) => q.ex.id === id).length
  return { ...base, queue: [...s.queue, { ex: item.ex, key: `${id}#${attempt}`, retry: true }] }
}

/** Moves to the next item. Teach cards count as finished once you continue past them. */
export function advanceRun(s: RunState): RunState {
  const item = currentItem(s)
  if (!item) return s
  const finished = item.ex.type === 'teach' ? addUnique(s.finished, item.ex.id) : s.finished
  return { ...s, finished, index: s.index + 1 }
}

/** Combo milestones worth a little celebration: 3, 5, 8, then every 5. */
export function isComboMilestone(n: number): boolean {
  return n === 3 || n === 5 || n === 8 || (n >= 10 && n % 5 === 0)
}

export function lessonResult(s: RunState, lessonId: string, durationMs: number): LessonResult {
  return { lessonId, total: s.gradedTotal, mistakes: s.mistakes, missedIds: s.missed, durationMs }
}

export function quizResult(s: RunState, unitId: string, durationMs: number): QuizResult {
  return { unitId, total: s.gradedTotal, correct: s.correct.length, missedIds: s.missed, durationMs }
}

export function practiceResult(s: RunState) {
  return { total: s.gradedTotal, mistakes: s.mistakes, correctIds: s.correct, missedIds: s.missed }
}

/** "1:07" style. Never NaN. */
export function clock(ms: number): string {
  const total = Number.isFinite(ms) ? Math.max(0, Math.round(ms / 1000)) : 0
  const m = Math.floor(total / 60)
  const sec = total % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}
