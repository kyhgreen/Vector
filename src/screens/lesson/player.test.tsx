// @vitest-environment jsdom
/*
  Plays real lessons through the real screen (in StrictMode), tapping the
  right answers the way a player would. Proves every exercise type renders
  and grades correctly with the actual content, rewards pay out exactly once,
  and nothing ugly (NaN, undefined, em dashes) reaches the screen.
*/
import { StrictMode } from 'react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { MotionGlobalConfig } from 'motion/react'
import { UNITS } from '../../content'
import type { Exercise } from '../../content/types'
import { MAX_HEARTS } from '../../state/constants'
import { useGame } from '../../state/store'
import LessonScreen from './LessonScreen'

vi.mock('../../lib/confetti', () => ({ celebrate: () => {} }))

const EM_DASH = String.fromCharCode(0x2014)
const strip = (s: string) => s.replace(/\*\*/g, '')

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
  if (!window.matchMedia) {
    window.matchMedia = ((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
  window.scrollTo = (() => {}) as typeof window.scrollTo
  // Only fake the clock (not timers), so the Player's double-tap guard can be stepped past instantly.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 14, 15, 0, 0))
})
afterAll(() => {
  vi.useRealTimers()
  MotionGlobalConfig.skipAnimations = false
})

const initial = useGame.getState()

beforeEach(() => {
  useGame.setState(
    {
      ...initial,
      onboarded: true,
      profile: { ...initial.profile, name: 'Sam', age: 12 },
      lessons: {},
      quizzes: {},
      mistakes: [],
      hearts: MAX_HEARTS,
      heartsUpdatedAt: Date.now(),
      settings: { ...initial.settings, unlockAll: true, sound: false, haptics: false, heartsOn: true },
      stats: { ...initial.stats, lessonsCompleted: 0, events: {} },
      toasts: [],
    },
    false,
  )
})
afterEach(() => cleanup())

function renderAt(path: string) {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/lesson/:lessonId" element={<LessonScreen mode="lesson" />} />
          <Route path="/quiz/:unitId" element={<LessonScreen mode="quiz" />} />
          <Route path="/practice" element={<LessonScreen mode="practice" />} />
          <Route path="/learn" element={<div>LEARN PAGE</div>} />
          <Route path="/unit/:unitId" element={<div>GUIDEBOOK PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </StrictMode>,
  )
}

/** Steps the fake clock past the Player's double-tap guard. */
const tick = () => vi.setSystemTime(new Date(Date.now() + 1000))
const main = () => screen.getByRole('main')

function clean() {
  const text = document.body.textContent ?? ''
  expect(text).not.toMatch(/\bNaN\b|\bundefined\b|\[object Object\]/)
  expect(text.includes(EM_DASH)).toBe(false)
}

async function enabledButton(name: string, root?: HTMLElement): Promise<HTMLButtonElement> {
  return waitFor(
    () => {
      const scope = root ? within(root) : screen
      const b = scope.queryAllByRole('button', { name }).find((x) => !(x as HTMLButtonElement).disabled)
      if (!b) throw new Error(`no enabled "${name}" button`)
      return b as HTMLButtonElement
    },
    { timeout: 2500 },
  )
}

async function find<T extends HTMLElement>(what: string, pick: () => T | undefined | null): Promise<T> {
  return waitFor(
    () => {
      const el = pick()
      if (!el) throw new Error(`not found: ${what}`)
      return el
    },
    { timeout: 2500 },
  )
}

const buttonsIn = (root: HTMLElement) => [...root.querySelectorAll<HTMLButtonElement>('button')].filter((b) => !b.disabled)

async function pickChoice(text: string) {
  const b = await find(text, () => [...main().querySelectorAll<HTMLButtonElement>('button[data-choice]')].find((x) => !x.disabled && x.children[1]?.textContent === strip(text)))
  fireEvent.click(b)
}

/** Answers the exercise on screen. Returns false for types that finish themselves (teach, match). */
async function answer(ex: Exercise, right: boolean): Promise<boolean> {
  switch (ex.type) {
    case 'teach':
      await find(ex.title, () => [...main().querySelectorAll('h2')].find((h) => h.textContent === ex.title))
      tick()
      fireEvent.click(await enabledButton('Continue'))
      return false
    case 'mc': {
      const c = ex.choices.find((x) => !!x.correct === right) ?? ex.choices[0]
      await pickChoice(c.text)
      return true
    }
    case 'scenario': {
      const c = ex.choices.find((x) => !!x.best === right) ?? ex.choices[0]
      await pickChoice(c.text)
      return true
    }
    case 'tf': {
      const want = right ? ex.answer : !ex.answer
      const group = await find('tf group', () => within(main()).queryAllByRole('group', { name: 'True or false' }).find((g) => buttonsIn(g).length === 2))
      const b = buttonsIn(group).find((x) => x.textContent?.startsWith(want ? 'True' : 'False'))!
      fireEvent.click(b)
      return true
    }
    case 'number': {
      const input = await find('number input', () => within(main()).queryAllByLabelText('Your answer').find((i) => !(i as HTMLInputElement).readOnly) as HTMLInputElement | undefined)
      fireEvent.change(input, { target: { value: String(right ? ex.answer : ex.answer + 1000) } })
      return true
    }
    case 'fill': {
      const used = new Set<number>()
      const norm = (w: string) => w.trim().toLowerCase()
      const words = right
        ? ex.answers
        : ex.answers.map((a) => {
            const bi = ex.bank.findIndex((b, i) => !used.has(i) && norm(b) !== norm(a))
            used.add(bi)
            return ex.bank[bi] ?? a
          })
      for (const w of words) {
        const bank = await find('word bank', () => within(main()).queryAllByRole('group', { name: 'Word bank' }).find((g) => buttonsIn(g).length > 0))
        const tile = buttonsIn(bank).find((b) => b.getAttribute('aria-label')?.toLowerCase() === w.toLowerCase())
        expect(tile, `${ex.id}: tile "${w}"`).toBeDefined()
        fireEvent.click(tile!)
      }
      return true
    }
    case 'sort': {
      for (const item of ex.items) {
        const target = right ? item.bucket : (item.bucket + 1) % ex.buckets.length
        const chip = await find(item.text, () => [...main().querySelectorAll<HTMLButtonElement>('button[aria-pressed]')].find((b) => !b.disabled && b.textContent === item.text))
        fireEvent.click(chip)
        fireEvent.click(await enabledButton(`Put it in ${ex.buckets[target]}`))
      }
      return true
    }
    case 'match': {
      for (const p of ex.pairs) {
        const grid = await find('match grid', () => within(main()).queryAllByRole('group', { name: 'Matching pairs' })[0])
        const l = buttonsIn(grid).find((b) => b.textContent === p.left && !b.getAttribute('aria-disabled'))
        const r = buttonsIn(grid).find((b) => b.textContent === p.right && !b.getAttribute('aria-disabled'))
        expect(l && r, `${ex.id}: ${p.left} / ${p.right}`).toBeTruthy()
        fireEvent.click(l!)
        fireEvent.click(r!)
      }
      return false
    }
  }
}

/** Answers, checks, confirms the verdict, and continues. */
async function play(ex: Exercise, right = true) {
  const needsCheck = await answer(ex, right)
  if (ex.type === 'teach') return
  if (needsCheck) {
    tick()
    fireEvent.click(await enabledButton('Check'))
  }
  const footer = document.querySelector('footer') as HTMLElement
  const next = await enabledButton(right ? 'Continue' : 'Got it', footer)
  expect(within(footer).queryByRole('button', { name: right ? 'Got it' : 'Continue' }), `${ex.id} graded wrong`).toBeNull()
  clean()
  tick()
  fireEvent.click(next)
}

async function finishSteps() {
  for (let i = 0; i < 6 && !screen.queryByText('LEARN PAGE'); i++) {
    tick()
    fireEvent.click(await enabledButton('Continue'))
    clean()
  }
  await screen.findByText('LEARN PAGE')
}

describe('lesson player with real content', () => {
  const lessons = UNITS.flatMap((u) => u.lessons)

  it.each(lessons.map((l) => [l.id, l] as const))('plays %s start to finish', async (_id, lesson) => {
    renderAt(`/lesson/${lesson.id}`)
    for (const ex of lesson.exercises) await play(ex)
    await screen.findByText('Total XP')
    clean()
    const s = useGame.getState()
    expect(s.stats.lessonsCompleted).toBe(1)
    expect(s.lessons[lesson.id]?.completions).toBe(1)
    expect(s.hearts).toBe(MAX_HEARTS)
    await finishSteps()
    // Paid exactly once, even in StrictMode.
    expect(useGame.getState().stats.lessonsCompleted).toBe(1)
  }, 20_000)
})

describe('mistakes', () => {
  it('costs a heart, re-asks the question, and remembers it for practice', async () => {
    const lesson = UNITS.flatMap((u) => u.lessons).find((l) => l.exercises.some((e) => e.type === 'mc'))!
    const firstMc = lesson.exercises.find((e) => e.type === 'mc')!
    renderAt(`/lesson/${lesson.id}`)
    for (const ex of lesson.exercises) await play(ex, ex.id !== firstMc.id)
    expect(useGame.getState().hearts).toBe(MAX_HEARTS - 1)
    // The missed one comes back at the end, wearing its rematch badge.
    await screen.findByText('Missed earlier')
    await play(firstMc, true)
    await screen.findByText('Total XP')
    expect(useGame.getState().mistakes).toContain(firstMc.id)
    expect(screen.getByText(/Review your misses/)).toBeTruthy()
  }, 20_000)

  it('pauses the lesson when hearts run out', async () => {
    useGame.setState({ hearts: 0, heartsUpdatedAt: Date.now() })
    const lesson = UNITS[0].lessons[0]
    renderAt(`/lesson/${lesson.id}`)
    await screen.findByText(/^Out of hearts/)
    fireEvent.click(await enabledButton('Quit lesson'))
    await screen.findByText('LEARN PAGE')
  })
})

describe('quiz', () => {
  it('scores at the end, never costs hearts, and offers a retry when failed', async () => {
    const unit = UNITS[0]
    const qs = unit.quiz.exercises
    renderAt(`/quiz/${unit.id}`)
    await screen.findByText(`Question 1 of ${qs.length}`)
    for (const ex of qs) await play(ex, ex.type === 'match')
    await screen.findByText('Not passed yet')
    expect(useGame.getState().hearts).toBe(MAX_HEARTS)
    expect(useGame.getState().quizzes[unit.id]?.attempts).toBe(1)
    clean()
    fireEvent.click(await enabledButton('Try again'))
    await screen.findByText(`Question 1 of ${qs.length}`)
    expect(useGame.getState().quizzes[unit.id]?.attempts).toBe(1)
  }, 20_000)

  it('passes with all right answers', async () => {
    const unit = UNITS[1] ?? UNITS[0]
    renderAt(`/quiz/${unit.id}`)
    for (const ex of unit.quiz.exercises) await play(ex)
    await screen.findByText('Score')
    expect(useGame.getState().quizzes[unit.id]?.passed).toBe(true)
    await finishSteps()
  }, 20_000)
})

describe('practice', () => {
  it('shows a friendly empty state with nothing to practice', async () => {
    renderAt('/practice')
    await screen.findByText('Nothing to practice yet.')
    fireEvent.click(await enabledButton('Back to Learn'))
    await screen.findByText('LEARN PAGE')
  })

  it('plays your mistakes and clears them', async () => {
    const lesson = UNITS[0].lessons[0]
    const qs = lesson.exercises.filter((e) => e.type === 'mc' || e.type === 'tf')
    useGame.setState({ mistakes: qs.map((e) => e.id), hearts: 3, heartsUpdatedAt: Date.now() })
    renderAt('/practice')
    await screen.findByText('Practice')
    // Practice shuffles, so answer whatever shows up.
    for (let i = 0; i < qs.length * 3 && !screen.queryByText('Total XP'); i++) {
      // Wait for the last card to finish leaving (its buttons are locked).
      await waitFor(() => {
        if (main().querySelector('button:disabled')) throw new Error('old card still leaving')
      })
      const text = [...main().querySelectorAll('h2, blockquote')].map((el) => el.textContent ?? '').join(' ')
      const shown = qs.find((q) => text.includes(strip(q.type === 'mc' ? q.prompt : q.type === 'tf' ? q.statement : '')))
      if (!shown) {
        await new Promise((r) => setTimeout(r, 20))
        continue
      }
      await play(shown)
    }
    await screen.findByText('Total XP')
    expect(useGame.getState().mistakes.filter((id) => qs.some((q) => q.id === id))).toEqual([])
    expect(useGame.getState().hearts).toBe(4)
    expect(screen.getByText('+1 heart')).toBeTruthy()
  }, 20_000)
})
