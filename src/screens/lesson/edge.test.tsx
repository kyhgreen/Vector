// @vitest-environment jsdom
/*
  Edge cases the full play-through tests don't reach: keyboard play, hearts
  off, running out of hearts mid-lesson and refilling, and short practice.
  Plays hand-picked real exercises through the real Player (in StrictMode).
*/
import { StrictMode } from 'react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { MotionGlobalConfig } from 'motion/react'
import { UNITS } from '../../content'
import type { Exercise } from '../../content/types'
import { COINS, MAX_HEARTS } from '../../state/constants'
import { initialData, useGame } from '../../state/store'
import { Player } from './Player'
import { planSession, type SessionPlan } from './session'

vi.mock('../../lib/confetti', () => ({ celebrate: () => {} }))

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
      coins: 100,
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

const lessons = UNITS.flatMap((u) => u.lessons)
const all: Exercise[] = lessons.flatMap((l) => l.exercises)
const first = <T extends Exercise['type']>(type: T) => all.find((e) => e.type === type) as Extract<Exercise, { type: T }>

function lessonPlan(exercises: Exercise[]): SessionPlan {
  return { mode: 'lesson', refId: lessons[0].id, title: 'Test', color: 'green', unitId: UNITS[0].id, exercises, passPercent: 70 }
}

function renderPlan(plan: SessionPlan) {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={['/play']}>
        <Routes>
          <Route path="/play" element={<Player plan={plan} onRetry={() => {}} />} />
          <Route path="/learn" element={<div>LEARN PAGE</div>} />
          <Route path="/practice" element={<div>PRACTICE PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </StrictMode>,
  )
}

const tick = () => vi.setSystemTime(new Date(Date.now() + 1000))
const main = () => screen.getByRole('main')
const footer = () => document.querySelector('footer') as HTMLElement
const key = (target: Element | Window, k: string, code = '') => fireEvent.keyDown(target, { key: k, code })

async function enabledButton(name: string | RegExp, root?: HTMLElement): Promise<HTMLButtonElement> {
  return waitFor(
    () => {
      const b = (root ? within(root) : screen).queryAllByRole('button', { name }).find((x) => !(x as HTMLButtonElement).disabled)
      if (!b) throw new Error(`no enabled "${name}" button`)
      return b as HTMLButtonElement
    },
    { timeout: 2500 },
  )
}

/** Index (on screen) of the choice with this text. */
const choiceIndex = (text: string) =>
  [...main().querySelectorAll<HTMLButtonElement>('button[data-choice]')].findIndex((b) => b.children[1]?.textContent === text.replace(/\*\*/g, ''))

describe('keyboard play', () => {
  it('number keys pick, Enter checks and continues, typing in the number box never triggers shortcuts', async () => {
    const mc = first('mc')
    const num = first('number')
    const teach = first('teach')
    renderPlan(lessonPlan([teach, mc, num]))

    // Teach card: Enter continues.
    await screen.findByText(teach.title)
    tick()
    key(document.body, 'Enter')
    await waitFor(() => expect(choiceIndex(mc.choices[0].text)).toBeGreaterThanOrEqual(0))

    // Multiple choice: number key picks the right one, Enter checks, Enter continues.
    const right = mc.choices.find((c) => c.correct)!
    const pos = choiceIndex(right.text)
    tick()
    key(document.body, String(pos + 1), `Digit${pos + 1}`)
    await enabledButton('Check')
    tick()
    key(document.body, 'Enter')
    await enabledButton('Continue', footer())
    tick()
    key(document.body, 'Enter')

    // Number: digits typed in the box are just typing; Enter in the box checks.
    const input = (await screen.findByLabelText('Your answer')) as HTMLInputElement
    input.focus()
    key(input, '1', 'Digit1')
    fireEvent.change(input, { target: { value: String(num.answer) } })
    expect(within(footer()).queryByRole('button', { name: 'Continue' })).toBeNull()
    tick()
    key(input, 'Enter')
    await enabledButton('Continue', footer())
    expect(useGame.getState().hearts).toBe(MAX_HEARTS)
    tick()
    key(document.body, 'Enter')
    await screen.findByText('Total XP')
    expect(useGame.getState().stats.lessonsCompleted).toBe(1)
  }, 15_000)

  it('fill: number keys drop tiles in, Backspace takes the last one out', async () => {
    const fill = all.find((e) => e.type === 'fill' && e.answers.length === 1) as Extract<Exercise, { type: 'fill' }>
    renderPlan(lessonPlan([fill]))
    const bank = await screen.findByRole('group', { name: 'Word bank' })
    const tiles = within(bank).getAllByRole('button')
    const pos = tiles.findIndex((t) => t.textContent?.startsWith(fill.answers[0]))
    key(document.body, String(pos + 1), `Digit${pos + 1}`)
    await enabledButton('Check')
    key(document.body, 'Backspace')
    await waitFor(() => expect((screen.getByRole('button', { name: 'Check' }) as HTMLButtonElement).disabled).toBe(true))
    key(document.body, String(pos + 1), `Digit${pos + 1}`)
    tick()
    key(document.body, 'Enter')
    await enabledButton('Continue', footer())
  })
})

describe('hearts', () => {
  const [a, b] = all.filter((e) => e.type === 'mc') as Extract<Exercise, { type: 'mc' }>[]
  const pickWrong = async (ex: typeof a) => {
    const wrong = ex.choices.find((c) => !c.correct)!
    await waitFor(() => expect(choiceIndex(wrong.text)).toBeGreaterThanOrEqual(0))
    fireEvent.click(main().querySelectorAll<HTMLButtonElement>('button[data-choice]')[choiceIndex(wrong.text)])
    tick()
    fireEvent.click(await enabledButton('Check'))
  }
  const pickRight = async (ex: typeof a) => {
    const right = ex.choices.find((c) => c.correct)!
    await waitFor(() => expect(choiceIndex(right.text)).toBeGreaterThanOrEqual(0))
    fireEvent.click(main().querySelectorAll<HTMLButtonElement>('button[data-choice]')[choiceIndex(right.text)])
    tick()
    fireEvent.click(await enabledButton('Check'))
    tick()
    fireEvent.click(await enabledButton('Continue', footer()))
  }

  it('relaxed mode: misses are free and an empty heart count never blocks', async () => {
    useGame.setState({ hearts: 0, settings: { ...useGame.getState().settings, heartsOn: false } })
    renderPlan(lessonPlan([a]))
    await pickWrong(a)
    tick()
    fireEvent.click(await enabledButton('Got it', footer()))
    expect(screen.queryByText(/^Out of hearts/)).toBeNull()
    await pickRight(a)
    await screen.findByText('Total XP')
    expect(useGame.getState().hearts).toBe(0)
  })

  it('losing the last heart pauses the lesson; a refill picks it back up', async () => {
    useGame.setState({ hearts: 1, heartsUpdatedAt: Date.now() })
    renderPlan(lessonPlan([a, b]))
    await pickWrong(a)
    expect(useGame.getState().hearts).toBe(0)
    tick()
    fireEvent.click(await enabledButton('Got it', footer()))
    await screen.findByText(/^Out of hearts/)
    // Keys are dead while the sheet is up.
    tick()
    key(document.body, 'Enter')
    key(document.body, '1', 'Digit1')
    expect(screen.queryByRole('button', { name: 'Check' })?.hasAttribute('disabled')).toBe(true)
    fireEvent.click(await enabledButton(/Refill/))
    await waitFor(() => expect(screen.queryByText(/^Out of hearts/)).toBeNull())
    await pickRight(b)
    await pickRight(a)
    await screen.findByText('Total XP')
    expect(useGame.getState().stats.lessonsCompleted).toBe(1)
    expect(useGame.getState().mistakes).toContain(a.id)
  })
})

describe('results numbers', () => {
  it('daily goal shows the real XP and its coins are not counted twice', async () => {
    const tf = first('tf')
    useGame.setState({ xpByDay: {}, goalDays: [], coins: 0, settings: { ...useGame.getState().settings, dailyGoal: 10 } })
    renderPlan(lessonPlan([tf]))
    const group = await screen.findByRole('group', { name: 'True or false' })
    fireEvent.click(within(group).getAllByRole('button')[tf.answer ? 0 : 1])
    tick()
    fireEvent.click(await enabledButton('Check'))
    tick()
    fireEvent.click(await enabledButton('Continue', footer()))
    await screen.findByText('Total XP')
    // Summary shows the lesson's coins; the goal step adds its own +10.
    expect(screen.getByText(`+${COINS.lessonFirstTime + COINS.lessonPerfectBonus} coins`)).toBeTruthy()
    tick()
    fireEvent.click(await enabledButton('Continue'))
    await screen.findByText('1-day streak')
    tick()
    fireEvent.click(await enabledButton('Continue'))
    await screen.findByText('Daily goal reached')
    const xp = useGame.getState().xpTotal - initial.xpTotal
    expect(xp).toBeGreaterThan(10)
    expect(screen.getByText(`You earned ${xp} XP today. Your goal was 10.`)).toBeTruthy()
  })
})

describe('short practice', () => {
  it('plays just your two mistakes when nothing else is finished', () => {
    const qs = all.filter((e) => e.type === 'tf').slice(0, 2)
    const d = initialData(new Date(2026, 9, 1))
    const out = planSession('practice', 'practice', { ...d, mistakes: qs.map((q) => q.id) }, () => 0.3)
    expect(out.kind).toBe('ok')
    if (out.kind === 'ok') expect(out.plan.exercises.map((e) => e.id).sort()).toEqual(qs.map((q) => q.id).sort())
  })
})
