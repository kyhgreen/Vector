// @vitest-environment jsdom
/*
  Smoke tests for the profile area: the profile page, the 7-day XP chart,
  the badges list, and every settings write (age, goal, hearts, demo,
  theme, nickname), plus the reset flow landing back on onboarding.
*/
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useGame } from '../../state/store'
import { BADGES } from '../../state/badges'
import { addDays, dayKey } from '../../lib/dates'
import ProfileScreen from './ProfileScreen'
import SettingsScreen from './SettingsScreen'
import BadgesScreen from './BadgesScreen'

const NOW = new Date(2026, 9, 14, 15, 0, 0) // Wednesday, Oct 14 2026

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
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
})
afterAll(() => vi.useRealTimers())

const initial = useGame.getState()
const today = dayKey(NOW)

beforeEach(() => {
  useGame.setState(
    {
      ...initial,
      onboarded: true,
      profile: { ...initial.profile, name: 'Sam', age: 12, joinedDay: '2026-10-01' },
      settings: { ...initial.settings, dailyGoal: 20, sound: false, haptics: false, unlockAll: false, heartsOn: true, theme: 'system' },
      xpByDay: {},
      xpTotal: 0,
      lessons: {},
      badges: {},
      stats: { ...initial.stats, events: {} },
      toasts: [],
    },
    false,
  )
})
afterEach(() => cleanup())

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/profile/settings" element={<SettingsScreen />} />
        <Route path="/profile/badges" element={<BadgesScreen />} />
        <Route path="/welcome" element={<div>welcome screen</div>} />
        <Route path="*" element={<div>elsewhere</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function expectClean(text: string | null) {
  expect(text ?? '').not.toMatch(/NaN|undefined|null|Infinity|\[object/)
  expect(text ?? '').not.toContain('—')
}

describe('profile page', () => {
  it('renders a fresh profile with no junk', () => {
    const { container } = renderAt('/profile')
    expectClean(container.textContent)
    expect(screen.getByText('Sam')).toBeTruthy()
  })

  it('survives a messy old save', () => {
    useGame.setState({
      xpTotal: NaN,
      xpByDay: { [today]: Infinity as unknown as number },
      profile: { ...useGame.getState().profile, name: '   ', joinedDay: 'junk' },
      // A lesson that was removed from the course in an update.
      lessons: { 'gone-lesson': { completions: 1, bestAccuracy: 1, firstDay: today, lastDay: today } },
    })
    const { container } = renderAt('/profile')
    expectClean(container.textContent)
    expect(screen.getByText('Money Rookie')).toBeTruthy()
    expect(screen.getByRole('button', { name: /^Lessons done: 0 of \d+$/ })).toBeTruthy()
  })
})

describe('7-day XP chart', () => {
  it('shows the last 7 days ending today, with the right goal math', () => {
    useGame.setState({
      xpByDay: {
        [today]: 25,
        [addDays(today, -1)]: 10,
        [addDays(today, -6)]: 40,
        [addDays(today, -7)]: 999, // 8 days ago: must not count
      },
    })
    renderAt('/profile')
    const cols = screen.getAllByRole('button', { name: /XP(,|$)/ }).filter((b) => /^(Today|\w+day):/.test(b.getAttribute('aria-label') ?? ''))
    expect(cols).toHaveLength(7)
    expect(cols[6].getAttribute('aria-label')).toBe('Today: 25 XP, goal hit')
    expect(cols[5].getAttribute('aria-label')).toBe('Tuesday: 10 XP, 10 short of the goal')
    expect(cols[0].getAttribute('aria-label')).toBe('Thursday: 40 XP, goal hit')
    expect(screen.getByLabelText('75 XP in the last 7 days')).toBeTruthy()
    expect(screen.getByText('Goal hit 2 of 7 days.')).toBeTruthy()
    expect(screen.getByText('Goal: 20 XP a day')).toBeTruthy()
  })

  it('past days that missed say "short", not "to go"', () => {
    useGame.setState({ xpByDay: { [addDays(today, -1)]: 5 } })
    renderAt('/profile')
    fireEvent.click(screen.getByRole('button', { name: /^Tuesday:/ }))
    expect(screen.getByText('15 short')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^Today:/ }))
    expect(screen.getByText('20 to go')).toBeTruthy()
  })
})

describe('badges screen', () => {
  it('filters earned and locked', () => {
    useGame.setState({ badges: { [BADGES[0].id]: '2026-10-10' } })
    renderAt('/profile/badges')
    expect(screen.getByText(`1 of ${BADGES.length}`)).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: /Earned/ }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    fireEvent.click(screen.getByRole('tab', { name: /Locked/ }))
    expect(screen.getAllByRole('listitem')).toHaveLength(BADGES.length - 1)
  })
})

describe('settings', () => {
  it('writes age, goal, hearts, demo mode, and theme', () => {
    const { container } = renderAt('/profile/settings')
    expectClean(container.textContent)

    fireEvent.click(screen.getByRole('radio', { name: '15 years old' }))
    expect(useGame.getState().profile.age).toBe(15)

    fireEvent.click(screen.getByRole('radio', { name: /^Intense/ }))
    expect(useGame.getState().settings.dailyGoal).toBe(50)

    fireEvent.click(screen.getByRole('checkbox', { name: /Hearts/ }))
    expect(useGame.getState().settings.heartsOn).toBe(false)

    fireEvent.click(screen.getByRole('checkbox', { name: /Demo mode/ }))
    expect(useGame.getState().settings.unlockAll).toBe(true)

    fireEvent.click(screen.getByRole('tab', { name: 'Dark' }))
    expect(useGame.getState().settings.theme).toBe('dark')
  })

  it('arrow keys move through the age radios', () => {
    renderAt('/profile/settings')
    const twelve = screen.getByRole('radio', { name: '12 years old' })
    fireEvent.keyDown(twelve, { key: 'ArrowRight' })
    expect(useGame.getState().profile.age).toBe(13)
  })

  it('tidies the nickname on blur and allows clearing it', () => {
    renderAt('/profile/settings')
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '  Big   Saver ' } })
    fireEvent.blur(input)
    expect(useGame.getState().profile.name).toBe('Big Saver')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.blur(input)
    expect(useGame.getState().profile.name).toBe('')
  })

  it('reset wipes everything and lands on onboarding', async () => {
    useGame.setState({ xpTotal: 120, coins: 90, lessons: { x: { completions: 1, bestAccuracy: 1, firstDay: today, lastDay: today } } })
    renderAt('/profile/settings')
    fireEvent.click(screen.getByRole('button', { name: /Reset progress/ }))
    const dialog = screen.getByRole('dialog')
    expectClean(dialog.textContent)
    expect(within(dialog).getByText(/120 XP/)).toBeTruthy()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset anyway' }))
    const wipe = await screen.findByRole('button', { name: 'Yes, reset everything' }, { timeout: 3000 })
    act(() => {
      fireEvent.click(wipe)
    })
    expect(await screen.findByText('welcome screen')).toBeTruthy()
    const s = useGame.getState()
    expect(s.onboarded).toBe(false)
    expect(s.xpTotal).toBe(0)
    expect(Object.keys(s.lessons)).toHaveLength(0)
  })
})
