// @vitest-environment jsdom
/*
  League screen smoke + regression tests: the zero-XP state, zone lines at the
  top and bottom leagues, and last week's result sheet (shown once, marked
  seen, and it still celebrates under React StrictMode).
*/
import { StrictMode } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { useGame } from '../../state/store'
import { DIVISIONS } from '../../state/league'
import { addDays, dayKey, weekStart } from '../../lib/dates'
import type { LeagueState } from '../../state/types'
import LeagueScreen from './LeagueScreen'

const celebrate = vi.fn()
vi.mock('../../lib/confetti', () => ({ celebrate: (...a: unknown[]) => celebrate(...a) }))

beforeAll(() => {
  window.matchMedia = ((q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  Element.prototype.scrollIntoView = function () {}
  Element.prototype.scrollTo = function () {} as typeof Element.prototype.scrollTo
})

const initial = useGame.getState()
const thisWeek = weekStart(dayKey())

function setLeague(league: Partial<LeagueState>) {
  useGame.setState(
    {
      ...initial,
      onboarded: true,
      profile: { ...initial.profile, name: 'Sam', avatar: 'coin' },
      settings: { ...initial.settings, sound: false, haptics: false },
      league: { weekKey: thisWeek, division: 2, weekXp: 0, lastResult: null, ...league },
    },
    false,
  )
}

beforeEach(() => celebrate.mockClear())
afterEach(() => cleanup())

const renderLeague = (strict = false) => {
  const tree = (
    <MemoryRouter>
      <LeagueScreen />
    </MemoryRouter>
  )
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree)
}

const BROKEN = /NaN|undefined|Infinity|\[object Object\]/

describe('LeagueScreen', () => {
  it('shows a clean zero-XP state', () => {
    setLeague({ weekXp: 0 })
    renderLeague()
    expect(screen.getByText("You're not in the race yet")).toBeTruthy()
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(15)
    expect(document.body.textContent).not.toMatch(BROKEN)
    expect(screen.getByRole('timer').textContent).toMatch(/\d/)
  })

  it('draws both zone lines in a middle league, and skips the impossible one at the ends', () => {
    setLeague({ division: 2, weekXp: 0 })
    renderLeague()
    expect(screen.getByText('Promotion zone')).toBeTruthy()
    expect(screen.getByText('Demotion zone')).toBeTruthy()
    cleanup()

    setLeague({ division: DIVISIONS.length - 1, weekXp: 0 })
    renderLeague()
    expect(screen.queryByText('Promotion zone')).toBeNull()
    expect(screen.getByText('Demotion zone')).toBeTruthy()
    cleanup()

    setLeague({ division: 0, weekXp: 0 })
    renderLeague()
    expect(screen.getByText('Promotion zone')).toBeTruthy()
    expect(screen.queryByText('Demotion zone')).toBeNull()
  })

  it('shows where you stand once you have XP', () => {
    setLeague({ weekXp: 5000 })
    renderLeague()
    expect(screen.queryByText("You're not in the race yet")).toBeNull()
    expect(document.body.textContent).toContain('5,000 XP')
    expect(document.body.textContent).not.toMatch(BROKEN)
  })

  it("shows last week's result once, then marks it seen", () => {
    setLeague({ division: 3, lastResult: { weekKey: addDays(thisWeek, -7), rank: 2, outcome: 'promoted', from: 2, to: 3, seen: false } })
    renderLeague()
    expect(screen.getByRole('dialog').textContent).toContain('Promoted to Quarter League!')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(useGame.getState().league.lastResult?.seen).toBe(true)
    cleanup()
    renderLeague()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('settles a finished week on open and shows the result', () => {
    setLeague({ weekKey: addDays(thisWeek, -7), division: 2, weekXp: 100_000 })
    renderLeague()
    const l = useGame.getState().league
    expect(l.weekKey).toBe(thisWeek)
    expect(l.weekXp).toBe(0)
    expect(l.division).toBe(3)
    expect(l.lastResult).toMatchObject({ outcome: 'promoted', rank: 1, from: 2, to: 3, seen: false })
    expect(screen.getByRole('dialog').textContent).toContain('Promoted to Quarter League!')
  })

  it('uses the new week right away when the app wakes up on Monday', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      // Left open on Sunday night...
      vi.setSystemTime(new Date(2026, 9, 18, 23, 59, 50))
      setLeague({ weekKey: '2026-10-12', division: 2, weekXp: 0 })
      renderLeague()
      expect(screen.getByRole('timer').textContent).toContain('Last day')
      // ...phone wakes Monday 8am. App.tsx syncs the store before our 15 s tick fires.
      vi.setSystemTime(new Date(2026, 9, 19, 8, 0, 0))
      act(() => useGame.getState().syncTime())
      expect(useGame.getState().league.weekKey).toBe('2026-10-19')
      expect(screen.getByRole('timer').textContent).toContain('Ends in 6d 16h')
    } finally {
      vi.useRealTimers()
    }
  })

  it("doesn't reopen an old sheet after the weekly result is closed", async () => {
    const settle = () => act(() => new Promise((r) => setTimeout(r, 800))) // let exit animations finish
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      vi.setSystemTime(new Date(2026, 9, 18, 23, 59, 50))
      setLeague({ weekKey: '2026-10-12', division: 2, weekXp: 100_000 })
      renderLeague()
      fireEvent.click(screen.getByRole('button', { name: 'How leagues work' }))
      expect(screen.getByRole('dialog')).toBeTruthy()
      // Midnight: the week settles while that sheet is open.
      vi.setSystemTime(new Date(2026, 9, 19, 0, 0, 5))
      act(() => useGame.getState().syncTime())
      await settle()
      expect(screen.getByRole('dialog').textContent).toContain('Promoted')
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
      await settle()
      expect(screen.queryByRole('dialog')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('celebrates a promotion even under StrictMode', async () => {
    setLeague({ division: 3, lastResult: { weekKey: addDays(thisWeek, -7), rank: 1, outcome: 'promoted', from: 2, to: 3, seen: false } })
    renderLeague(true)
    await act(() => new Promise((r) => setTimeout(r, 400)))
    expect(celebrate).toHaveBeenCalledTimes(1)
  })
})
