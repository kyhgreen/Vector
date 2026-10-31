import { describe, expect, it } from 'vitest'
import { UNITS, getExercise } from '../../content'
import { isQuestion, type Exercise } from '../../content/types'
import { rng } from '../../lib/random'
import { initialData } from '../../state/store'
import type { GameData } from '../../state/types'
import { answerOf, explainOf, fillSentence, formatNumberAnswer, promptOf } from './exercises/describe'
import { isCloseEnough, parseTyped } from './exercises/NumberEx'
import {
  advanceRun,
  clock,
  currentItem,
  gradeCurrent,
  isComboMilestone,
  isRunOver,
  lessonResult,
  planSession,
  progressOf,
  quizResult,
  startRun,
  unitIdOf,
  type RunState,
} from './session'

const demo = (): GameData => {
  const d = initialData(new Date(2026, 9, 1))
  return { ...d, onboarded: true, profile: { ...d.profile, age: 12 }, settings: { ...d.settings, unlockAll: true } }
}

const allLessons = UNITS.flatMap((u) => u.lessons)
const allExercises: Exercise[] = [...allLessons.flatMap((l) => l.exercises), ...UNITS.flatMap((u) => u.quiz.exercises)]

/** Plays a run to the end, answering each question right (or wrong first, when `missFirst` says so). */
function playThrough(run: RunState, missFirst: (id: string) => boolean): RunState {
  let s = run
  const missedOnce = new Set<string>()
  for (let guard = 0; guard < 500 && !isRunOver(s); guard++) {
    const it = currentItem(s)!
    if (isQuestion(it.ex)) {
      const miss = missFirst(it.ex.id) && !missedOnce.has(it.ex.id)
      if (miss) missedOnce.add(it.ex.id)
      s = gradeCurrent(s, !miss)
    }
    s = advanceRun(s)
  }
  return s
}

describe('real content works in the player', () => {
  it('has content to test', () => {
    expect(allLessons.length).toBeGreaterThan(0)
    expect(allExercises.length).toBeGreaterThan(0)
  })

  it('every question has a prompt and a right answer that reads like words', () => {
    for (const ex of allExercises) {
      const p = promptOf(ex)
      expect(p.trim().length, ex.id).toBeGreaterThan(0)
      if (!isQuestion(ex)) continue
      const a = answerOf(ex)
      expect(a.trim().length, `${ex.id} answer`).toBeGreaterThan(0)
      for (const s of [p, a, explainOf(ex)]) {
        expect(s, ex.id).not.toMatch(/undefined|NaN|\[object Object\]/)
      }
    }
  })

  it('every exercise can be answered correctly with its own data', () => {
    for (const ex of allExercises) {
      switch (ex.type) {
        case 'mc':
          expect(ex.choices.filter((c) => c.correct).length, ex.id).toBe(1)
          break
        case 'scenario':
          expect(ex.choices.filter((c) => c.best).length, ex.id).toBe(1)
          for (const c of ex.choices) expect(c.outcome.trim().length, ex.id).toBeGreaterThan(0)
          break
        case 'tf':
          expect(typeof ex.answer, ex.id).toBe('boolean')
          break
        case 'match': {
          const lefts = new Set(ex.pairs.map((p) => p.left))
          const rights = new Set(ex.pairs.map((p) => p.right))
          expect(lefts.size, ex.id).toBe(ex.pairs.length)
          expect(rights.size, ex.id).toBe(ex.pairs.length)
          break
        }
        case 'sort':
          expect(ex.buckets.length, ex.id).toBeGreaterThanOrEqual(2)
          for (const it of ex.items) expect(ex.buckets[it.bucket], `${ex.id} ${it.text}`).toBeDefined()
          break
        case 'fill': {
          const blanks = ex.sentence.split(/_{3,}/).length - 1
          expect(blanks, ex.id).toBe(ex.answers.length)
          // Every answer has a tile (case-insensitive, like the grader).
          const bank = ex.bank.map((b) => b.trim().toLowerCase())
          for (const a of ex.answers) expect(bank, `${ex.id} needs "${a}"`).toContain(a.trim().toLowerCase())
          expect(fillSentence(ex.sentence, ex.answers), ex.id).not.toContain('___')
          break
        }
        case 'number': {
          expect(Number.isFinite(ex.answer), ex.id).toBe(true)
          const typed = parseTyped(String(ex.answer))
          expect(typed, ex.id).not.toBeNull()
          expect(isCloseEnough(typed!, ex.answer, ex.tolerance), ex.id).toBe(true)
          expect(formatNumberAnswer(ex), ex.id).not.toMatch(/NaN|undefined/)
          break
        }
        case 'teach':
          expect(ex.title.trim().length, ex.id).toBeGreaterThan(0)
          break
      }
    }
  })

  it('plans every lesson and quiz in demo mode and plays them to the end', () => {
    const data = demo()
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        const out = planSession('lesson', lesson.id, data)
        expect(out.kind, lesson.id).toBe('ok')
        if (out.kind !== 'ok') continue
        const end = playThrough(startRun(out.plan), () => false)
        expect(progressOf(end), lesson.id).toBe(1)
        const r = lessonResult(end, lesson.id, 1000)
        expect(r.mistakes).toBe(0)
        expect(r.total).toBe(lesson.exercises.filter(isQuestion).length)
      }
      const quiz = planSession('quiz', unit.id, data)
      expect(quiz.kind, unit.id).toBe('ok')
    }
  })

  it('redirects for missing or locked lessons', () => {
    expect(planSession('lesson', 'nope', demo()).kind).toBe('redirect')
    expect(planSession('quiz', 'nope', demo()).kind).toBe('redirect')
    const fresh = { ...demo(), settings: { ...demo().settings, unlockAll: false } }
    const lessons = UNITS.filter((u) => u.tier === 1).flatMap((u) => u.lessons)
    if (lessons.length > 1) {
      expect(planSession('lesson', lessons[0].id, fresh).kind).toBe('ok')
      expect(planSession('lesson', lessons[lessons.length - 1].id, fresh).kind).toBe('redirect')
    }
  })
})

describe('the run', () => {
  const lesson = allLessons.find((l) => l.exercises.some((e) => e.type === 'teach') && l.exercises.filter(isQuestion).length >= 2)!

  it('re-queues a missed question until it is right (lesson mode)', () => {
    const firstQ = lesson.exercises.find(isQuestion)!
    let s = startRun({ mode: 'lesson', exercises: lesson.exercises })
    const before = s.queue.length
    while (currentItem(s)!.ex.id !== firstQ.id) s = advanceRun(s)
    s = gradeCurrent(s, false)
    expect(s.queue.length).toBe(before + 1)
    expect(s.queue[s.queue.length - 1].retry).toBe(true)
    expect(s.missed).toEqual([firstQ.id])
    expect(s.finished).not.toContain(firstQ.id)
    const end = playThrough(advanceRun(s), () => false)
    expect(end.correct).toContain(firstQ.id)
    expect(progressOf(end)).toBe(1)
    expect(lessonResult(end, lesson.id, 5).mistakes).toBe(1)
  })

  it('never re-queues in quiz mode and scores right answers only', () => {
    const unit = UNITS[0]
    const qs = unit.quiz.exercises
    const end = playThrough(startRun({ mode: 'quiz', exercises: qs }), (id) => id === qs[0].id)
    expect(end.queue.length).toBe(qs.length)
    const r = quizResult(end, unit.id, 10)
    expect(r.total).toBe(qs.length)
    expect(r.correct).toBe(qs.length - 1)
    expect(r.missedIds).toEqual([qs[0].id])
  })

  it('matching misses count for stats but never come back', () => {
    const match = allExercises.find((e) => e.type === 'match')
    if (!match) return
    let s = startRun({ mode: 'lesson', exercises: [match] })
    s = gradeCurrent(s, false, { requeue: false })
    expect(s.queue.length).toBe(1)
    expect(s.missed).toEqual([match.id])
    expect(isRunOver(advanceRun(s))).toBe(true)
  })

  it('tracks combos and milestones', () => {
    expect([3, 5, 8, 10, 15].every(isComboMilestone)).toBe(true)
    expect([1, 2, 4, 6, 7, 9, 11].some(isComboMilestone)).toBe(false)
    const qs = allExercises.filter(isQuestion).slice(0, 4)
    let s = startRun({ mode: 'practice', exercises: qs })
    for (let i = 0; i < 3; i++) s = advanceRun(gradeCurrent(s, true))
    expect(s.combo).toBe(3)
    s = gradeCurrent(s, false)
    expect(s.combo).toBe(0)
    expect(s.bestCombo).toBe(3)
  })

  it('formats time without NaN', () => {
    expect(clock(67_000)).toBe('1:07')
    expect(clock(Number.NaN)).toBe('0:00')
    expect(clock(-5)).toBe('0:00')
  })
})

describe('practice planning', () => {
  it('is empty with no mistakes and no finished lessons', () => {
    expect(planSession('practice', 'practice', demo()).kind).toBe('empty')
  })

  it('uses your mistakes first, skips missing ids, and tops up from finished lessons', () => {
    const q = allExercises.filter(isQuestion)
    const lesson = allLessons.find((l) => l.exercises.filter(isQuestion).length >= 6)!
    const data: GameData = {
      ...demo(),
      mistakes: ['ghost-id', q[0].id, q[0].id],
      lessons: { [lesson.id]: { completions: 1, bestAccuracy: 1, firstDay: '2026-10-01', lastDay: '2026-10-01' } },
    }
    const out = planSession('practice', 'practice', data, rng(7))
    expect(out.kind).toBe('ok')
    if (out.kind !== 'ok') return
    const ids = out.plan.exercises.map((e) => e.id)
    expect(ids).toContain(q[0].id)
    expect(ids).not.toContain('ghost-id')
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBe(5)
    expect(out.plan.exercises.every(isQuestion)).toBe(true)
  })

  it('caps practice at 10', () => {
    const q = allExercises.filter(isQuestion).slice(0, 14)
    const out = planSession('practice', 'practice', { ...demo(), mistakes: q.map((e) => e.id) })
    expect(out.kind === 'ok' && out.plan.exercises.length).toBe(10)
  })

  it('knows which unit an exercise is from', () => {
    expect(unitIdOf('t1-u2-l3-e4')).toBe('t1-u2')
    expect(unitIdOf('t2-u1-q-e1')).toBe('t2-u1')
    expect(getExercise(allExercises[0].id)).toBeDefined()
  })
})

describe('number typing', () => {
  it('reads friendly formats', () => {
    expect(parseTyped('1,200')).toBe(1200)
    expect(parseTyped('$40')).toBe(40)
    expect(parseTyped('12.5%')).toBe(12.5)
    expect(parseTyped('.5')).toBe(0.5)
    expect(parseTyped('abc')).toBeNull()
    expect(parseTyped('')).toBeNull()
    expect(isCloseEnough(0.1 + 0.2, 0.3)).toBe(true)
    expect(isCloseEnough(41, 40)).toBe(false)
    expect(isCloseEnough(41, 40, 1)).toBe(true)
  })

  it('shows money answers with cents the way money is written', () => {
    expect(formatNumberAnswer({ answer: 15.3, prefix: '$' })).toBe('$15.30')
    expect(formatNumberAnswer({ answer: 1200, prefix: '$' })).toBe('$1,200')
    expect(formatNumberAnswer({ answer: 7.5, suffix: '%' })).toBe('7.5%')
    expect(formatNumberAnswer({ answer: 6, suffix: 'months' })).toBe('6 months')
  })
})

describe('copy rules', () => {
  it('has no em dashes anywhere in the lesson player', () => {
    const EM_DASH = String.fromCharCode(0x2014)
    const files = import.meta.glob<string>(['./**/*.ts', './**/*.tsx'], { query: '?raw', import: 'default', eager: true })
    expect(Object.keys(files).length).toBeGreaterThan(5)
    for (const [file, text] of Object.entries(files)) {
      expect(text.includes(EM_DASH), file).toBe(false)
    }
  })
})
