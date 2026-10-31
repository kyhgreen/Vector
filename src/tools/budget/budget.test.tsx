// @vitest-environment jsdom
/*
  Smoke tests for the Budget Builder screens: Quick Split math (monthly and
  weekly), zero-based "left to assign", the Tracker's month view and
  per-category totals, deleting a category that has spending, persistence,
  and that badge events only fire on real use.
*/
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useGame } from '../../state/store'
import { EVENTS } from '../../state/badges'
import BudgetBuilder from './index'
import { normalize, type BudgetData } from './model'

vi.mock('../../lib/confetti', () => ({ celebrate: () => {} }))

const NOW = new Date(2026, 9, 14, 15, 0, 0) // Oct 14 2026

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

beforeEach(() => {
  useGame.setState(
    {
      ...initial,
      onboarded: true,
      profile: { ...initial.profile, name: 'Sam', age: 12 },
      settings: { ...initial.settings, sound: false, haptics: false },
      badges: {},
      stats: { ...initial.stats, events: {} },
      tools: {},
      toasts: [],
    },
    false,
  )
})
afterEach(() => cleanup())

const saved = (): BudgetData => normalize(useGame.getState().tools.budget, 1)
const events = (name: string) => useGame.getState().stats.events[name] ?? 0
const seed = (patch: Partial<BudgetData>) => useGame.setState({ tools: { budget: { ...normalize(null, 1), ...patch } } })

/** Nothing on screen should ever read like a broken number. */
function expectCleanText() {
  const text = document.body.textContent ?? ''
  expect(text).not.toMatch(/NaN|Infinity|undefined|\[object Object\]|-\$0\b/)
}

describe('Quick Split', () => {
  it('splits monthly and weekly income 50/30/20 and fires the event once per real calculate', async () => {
    seed({ split: { income: 0, period: 'month', result: null } })
    render(<BudgetBuilder />)
    // $0 does not calculate and does not count as use.
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(events(EVENTS.quickSplitUsed)).toBe(0)
    expect(screen.getByRole('alert').textContent).toMatch(/amount/i)

    fireEvent.change(screen.getByLabelText(/monthly income/i), { target: { value: '200' } })
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(events(EVENTS.quickSplitUsed)).toBe(1)
    expect(await screen.findByText('$100')).toBeTruthy()
    expect(screen.getByText('$60')).toBeTruthy()
    // 20% of $200 = $40 a month, $480 a year.
    expect(document.body.textContent).toContain('$480')

    fireEvent.click(screen.getByRole('button', { name: 'Weekly' }))
    expect(screen.getByText(/Numbers changed/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Calculate again' }))
    await screen.findByText('$866.67', { exact: false })
    // $40 a week savings x 52 = $2,080; $200 a week is about $866.67 a month.
    expect(document.body.textContent).toContain('$2,080')
    expect(document.body.textContent).toContain('$866.67')
    expect(saved().split.result).toMatchObject({ income: 200, period: 'week' })
    expectCleanText()
  })
})

describe('My Budget', () => {
  it('tracks left to assign, handles odd input, and saves', () => {
    seed({ tab: 'budget', income: [{ id: 'i1', name: 'Allowance', amount: 40 }], categories: [{ id: 'c1', name: 'Goal jar', amount: 30, group: 'savings' }] })
    render(<BudgetBuilder />)
    expect(document.body.textContent).toContain('$10')
    const amount = screen.getByLabelText('Goal jar, dollars per month')
    fireEvent.change(amount, { target: { value: '-5' } })
    expect(saved().categories[0].amount).toBe(0)
    fireEvent.change(amount, { target: { value: '99999999' } })
    expect(saved().categories[0].amount).toBe(1_000_000)
    expectCleanText()
    fireEvent.change(amount, { target: { value: '40' } })
    expect(screen.getByText('All of your income is planned.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Save budget' }))
    expect(events(EVENTS.budgetSaved)).toBe(1)
    expect(screen.getByText('Saved and up to date.')).toBeTruthy()
    expectCleanText()
  })

  it('fills the leftover into savings and starts over from the example or blank', async () => {
    seed({ tab: 'budget', income: [{ id: 'i1', name: 'Allowance', amount: 40 }], categories: [{ id: 'c1', name: 'Goal jar', amount: 30, group: 'savings' }] })
    render(<BudgetBuilder />)
    fireEvent.click(screen.getByRole('button', { name: 'Put the extra $10 in Goal jar' }))
    expect(saved().categories[0].amount).toBe(40)
    expect(screen.queryByRole('button', { name: /Put the extra/ })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Start over' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Start blank' }))
    expect(saved().income).toEqual([])
    expect(saved().categories).toEqual([])
    expect(screen.getByText('Add some income to get going.')).toBeTruthy()
    expectCleanText()
  })

  it('refuses to save an empty plan and does not count it', () => {
    seed({ tab: 'budget', income: [], categories: [] })
    render(<BudgetBuilder />)
    fireEvent.click(screen.getByRole('button', { name: 'Save budget' }))
    expect(events(EVENTS.budgetSaved)).toBe(0)
    expectCleanText()
  })
})

describe('Tracker', () => {
  const categories = [
    { id: 'c1', name: 'Snacks', amount: 10, group: 'wants' as const },
    { id: 'c2', name: 'Goal jar', amount: 8, group: 'savings' as const },
  ]

  it('logs spending, totals it per category for this month only, and keeps deleted categories', () => {
    seed({
      tab: 'tracker',
      categories,
      expenses: [{ id: 'old', amount: 50, categoryId: 'c1', categoryName: 'Snacks', group: 'wants', note: '', day: '2026-09-20', at: 1 }],
    })
    render(<BudgetBuilder />)
    fireEvent.click(screen.getByRole('button', { name: 'Log it' }))
    expect(events(EVENTS.expenseLogged)).toBe(0)

    fireEvent.change(screen.getByLabelText('How much you spent, in dollars'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: 'Snacks' }))
    fireEvent.click(screen.getByRole('button', { name: 'Log it' }))
    expect(events(EVENTS.expenseLogged)).toBe(1)
    expect(saved().expenses).toHaveLength(2)
    expect(saved().expenses[0]).toMatchObject({ amount: 4, day: '2026-10-14', categoryId: 'c1' })

    // October only counts the $4, not September's $50.
    const cats = screen.getByRole('region', { name: 'Spent vs planned' })
    expect(within(cats).getByText('Snacks').parentElement?.textContent).toContain('$4 / $10')
    expect(within(cats).getByText('$6 left')).toBeTruthy()

    // Older month shows September's spending.
    fireEvent.click(screen.getByRole('button', { name: 'Older month' }))
    expect(screen.getByRole('heading', { name: 'September 2026' })).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'Spent vs planned' })).getByText('Over by $40')).toBeTruthy()
    expectCleanText()
    cleanup()

    // Delete Snacks in My Budget: its spending still shows in the Tracker.
    act(() => useGame.setState({ tools: { budget: { ...saved(), categories: [categories[1]], tab: 'tracker' } } }))
    render(<BudgetBuilder />)
    const cats2 = screen.getByRole('region', { name: 'Spent vs planned' })
    expect(within(cats2).getByText('Deleted, but the spending still counts.')).toBeTruthy()
    expect(within(cats2).getByText('Snacks')).toBeTruthy()
    expectCleanText()
  })

  it('deletes one expense after asking, and switches tabs with number keys', async () => {
    seed({
      tab: 'tracker',
      categories,
      expenses: [
        { id: 'a', amount: 2, categoryId: 'c1', categoryName: 'Snacks', group: 'wants', note: 'chips', day: '2026-10-14', at: 2 },
        { id: 'b', amount: 3, categoryId: 'c1', categoryName: 'Snacks', group: 'wants', note: '', day: '2026-10-14', at: 1 },
      ],
    })
    render(<BudgetBuilder />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete $2 for Snacks' }))
    expect((await screen.findByRole('dialog')).textContent).toContain('("chips")')
    fireEvent.click(screen.getByRole('button', { name: 'Delete it' }))
    expect(saved().expenses.map((e) => e.id)).toEqual(['b'])

    // Typing in a box never switches tabs; a bare key press does.
    fireEvent.keyDown(screen.getByLabelText('How much you spent, in dollars'), { key: '1' })
    expect(saved().tab).toBe('tracker')
    // The pop-up blocks the shortcut until it has fully closed.
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    fireEvent.keyDown(window, { key: '2' })
    expect(saved().tab).toBe('budget')
  })

  it('says something sensible when only savings is planned', () => {
    seed({
      tab: 'tracker',
      categories: [categories[1]],
      expenses: [{ id: 'e', amount: 3, categoryId: 'c2', categoryName: 'Goal jar', group: 'savings', note: '', day: '2026-10-10', at: 1 }],
    })
    render(<BudgetBuilder />)
    const month = screen.getByRole('region', { name: 'October 2026' })
    expect(month.textContent).not.toContain('All $0')
    expect(month.textContent).toContain('Plus $3 saved.')
    expectCleanText()
  })

  it('groups the list by day even when logging order and days disagree', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    seed({
      tab: 'tracker',
      categories,
      expenses: [
        { id: 'a', amount: 1, categoryId: 'c1', categoryName: 'Snacks', group: 'wants', note: '', day: '2026-10-12', at: 300 },
        { id: 'b', amount: 2, categoryId: 'c1', categoryName: 'Snacks', group: 'wants', note: '', day: '2026-10-13', at: 200 },
        { id: 'c', amount: 3, categoryId: 'c1', categoryName: 'Snacks', group: 'wants', note: '', day: '2026-10-12', at: 100 },
      ],
    })
    render(<BudgetBuilder />)
    const list = screen.getByRole('region', { name: "This month's spending" })
    expect(within(list).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Yesterday', 'Oct 12'])
    expect(errors.mock.calls.some((c) => String(c[0]).includes('same key'))).toBe(false)
    errors.mockRestore()
  })
})
