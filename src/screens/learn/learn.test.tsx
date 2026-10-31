// @vitest-environment jsdom
/*
  Smoke tests for the Learn path and the Guidebook: they render, the popover
  works, locked tiers explain themselves, and nothing ugly (NaN, undefined,
  em dashes) ever leaks onto the screen.
*/
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { pathForTier, UNITS } from '../../content'
import { EVENTS } from '../../state/badges'
import { useGame } from '../../state/store'
import { dayKey } from '../../lib/dates'
import LearnScreen from './LearnScreen'
import GuidebookScreen from './GuidebookScreen'
import { rememberTier } from './learnUtils'

beforeAll(() => {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  ;(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IO
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
  Element.prototype.scrollIntoView = function () {}
  window.scrollTo = (() => {}) as typeof window.scrollTo
})

const initial = useGame.getState()

beforeEach(() => {
  useGame.setState(
    {
      ...initial,
      onboarded: true,
      profile: { ...initial.profile, name: 'Sam', age: 12, joinedDay: dayKey() },
      lessons: {},
      quizzes: {},
      mistakes: [],
      settings: { ...initial.settings, unlockAll: false, sound: false, haptics: false },
      stats: { ...initial.stats, events: {} },
    },
    false,
  )
  rememberTier(null)
})
afterEach(() => cleanup())

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/learn" element={<LearnScreen />} />
        <Route path="/unit/:unitId" element={<GuidebookScreen />} />
        <Route path="*" element={<div>elsewhere</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function expectClean(text: string) {
  expect(text).not.toMatch(/NaN|undefined|null|\[object/)
  expect(text).not.toContain('—')
}

describe('LearnScreen', () => {
  it('renders the tier switcher, quick actions, fun fact, and every tier 1 unit', () => {
    const { container } = renderAt('/learn')
    expect(screen.getAllByText('Money Basics').length).toBeGreaterThan(0)
    expect(screen.getByText('Practice')).toBeTruthy()
    expect(screen.getByText('Fun fact')).toBeTruthy()
    for (const u of UNITS.filter((x) => x.tier === 1)) expect(screen.getByText(u.title)).toBeTruthy()
    // one round node per lesson/quiz
    expect(container.querySelectorAll('[data-node-button]').length).toBe(pathForTier(1).length)
    expectClean(container.textContent ?? '')
  })

  it('opens a popover with a start button for the current node, and closes on Escape', () => {
    const { container } = renderAt('/learn')
    const current = container.querySelector('[data-current="true"] [data-node-button]') as HTMLButtonElement
    expect(current).toBeTruthy()
    fireEvent.click(current)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText(/Start \+\d+ XP/)).toBeTruthy()
    expect(screen.getByText('Lesson 1 of ' + UNITS[0].lessons.length)).toBeTruthy()
    expectClean(screen.getByRole('dialog').textContent ?? '')
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
  })

  it('explains locked nodes instead of starting them', () => {
    const { container } = renderAt('/learn')
    const buttons = Array.from(container.querySelectorAll('[data-node-button]')) as HTMLButtonElement[]
    fireEvent.click(buttons[buttons.length - 1])
    const dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toMatch(/finish .+ first/i)
    expect(within(dialog).getByRole('button').hasAttribute('disabled')).toBe(true)
  })

  it('shows a locked card for Real-World Money when tier 1 is not finished', () => {
    const { container } = renderAt('/learn')
    fireEvent.click(screen.getByRole('tab', { name: /Real-World Money/ }))
    expect(screen.getByText(/Finish Money Basics to unlock/)).toBeTruthy()
    expectClean(container.textContent ?? '')
  })

  it('celebrates when the whole tier is done', () => {
    const lessons: Record<string, { completions: number; bestAccuracy: number; firstDay: string; lastDay: string }> = {}
    const quizzes: Record<string, { attempts: number; passed: boolean; bestScore: number }> = {}
    for (const n of pathForTier(1)) {
      if (n.kind === 'lesson') lessons[n.id] = { completions: 2, bestAccuracy: 0.9, firstDay: dayKey(), lastDay: dayKey() }
      else quizzes[n.unit.id] = { attempts: 1, passed: true, bestScore: 0.85 }
    }
    useGame.setState({ lessons, quizzes })
    rememberTier(1)
    const { container } = renderAt('/learn')
    expect(screen.getByText('You finished Money Basics!')).toBeTruthy()
    const done = container.querySelector('[data-node-button]') as HTMLButtonElement
    fireEvent.click(done)
    expect(screen.getByText('Practice again')).toBeTruthy()
    expect(screen.getByText('Best 90%, played twice')).toBeTruthy()
    expectClean(container.textContent ?? '')
  })
})

function finishTier1() {
  const lessons: Record<string, { completions: number; bestAccuracy: number; firstDay: string; lastDay: string }> = {}
  const quizzes: Record<string, { attempts: number; passed: boolean; bestScore: number }> = {}
  for (const n of pathForTier(1)) {
    if (n.kind === 'lesson') lessons[n.id] = { completions: 1, bestAccuracy: 1, firstDay: dayKey(), lastDay: dayKey() }
    else quizzes[n.unit.id] = { attempts: 1, passed: true, bestScore: 1 }
  }
  useGame.setState({ lessons, quizzes })
}

const selectedTab = () => screen.getAllByRole('tab').find((t) => t.getAttribute('aria-selected') === 'true')

describe('Learn tiers', () => {
  it('does not reopen a remembered tier that has since locked', () => {
    // Picked Real-World Money in demo mode, then demo mode went off (or progress was reset).
    rememberTier(2)
    const { container } = renderAt('/learn')
    expect(selectedTab()?.textContent).toContain('Money Basics')
    expect(screen.queryByText(/Finish Money Basics to unlock/)).toBeNull()
    expect(container.querySelector('[data-current="true"]')).toBeTruthy()
  })

  it('keeps a remembered tier that is still open', () => {
    useGame.setState({ settings: { ...useGame.getState().settings, unlockAll: true } })
    rememberTier(2)
    const { container } = renderAt('/learn')
    expect(selectedTab()?.textContent).toContain('Real-World Money')
    const statuses = Array.from(container.querySelectorAll('[data-node-button]')).map((b) => b.getAttribute('aria-label') ?? '')
    expect(statuses.length).toBe(pathForTier(2).length)
    expect(statuses.some((s) => s.endsWith('Locked.'))).toBe(false)
  })

  it('opens older players on Real-World Money, with Money Basics free to roam', () => {
    useGame.setState({ profile: { ...useGame.getState().profile, age: 16 } })
    const { container } = renderAt('/learn')
    expect(selectedTab()?.textContent).toContain('Real-World Money')
    expect(screen.queryByText(/to unlock/)).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: /Money Basics/ }))
    const labels = Array.from(container.querySelectorAll('[data-node-button]')).map((b) => b.getAttribute('aria-label') ?? '')
    expect(labels.length).toBe(pathForTier(1).length)
    expect(labels.filter((s) => s.endsWith('Locked.')).length).toBe(0)
  })

  it('unlocks Real-World Money for a 12 year old once Money Basics is done, and the popover routes to the right place', () => {
    finishTier1()
    rememberTier(1)
    renderAt('/learn')
    fireEvent.click(screen.getByText(/On to Real-World Money/))
    expect(selectedTab()?.textContent).toContain('Real-World Money')
    const current = document.querySelector('[data-current="true"] [data-node-button]') as HTMLButtonElement
    fireEvent.click(current)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button'))
    expect(screen.getByText('elsewhere')).toBeTruthy()
  })
})

describe('GuidebookScreen', () => {
  it('a locked tier 2 guidebook says to finish Money Basics, not "earlier units"', () => {
    const unit = UNITS.find((u) => u.tier === 2)!
    renderAt(`/unit/${unit.id}`)
    expect(screen.getByText('Finish Money Basics first.')).toBeTruthy()
  })

  it('renders the guidebook sections and tracks one visit', () => {
    const unit = UNITS[0]
    const { container } = renderAt(`/unit/${unit.id}`)
    expect(screen.getByText(unit.title)).toBeTruthy()
    expect(screen.getByText('Key ideas', { selector: 'h3' })).toBeTruthy()
    expect(screen.getByText('Fun facts', { selector: 'h3' })).toBeTruthy()
    expect(screen.getByText('Words to know')).toBeTruthy()
    expect(screen.getByText('Start lesson')).toBeTruthy()
    expect(useGame.getState().stats.events[EVENTS.guidebookOpened]).toBe(1)
    expectClean(container.textContent ?? '')
  })

  it('offers the quiz once every lesson in the unit is done', () => {
    const unit = UNITS[0]
    const lessons = Object.fromEntries(unit.lessons.map((l) => [l.id, { completions: 1, bestAccuracy: 1, firstDay: dayKey(), lastDay: dayKey() }]))
    useGame.setState({ lessons })
    renderAt(`/unit/${unit.id}`)
    expect(screen.getByText('Take the quiz')).toBeTruthy()
  })

  it('handles a unit that does not exist', () => {
    const { container } = renderAt('/unit/nope')
    expect(screen.getByText('Guidebook not found')).toBeTruthy()
    expectClean(container.textContent ?? '')
  })
})
