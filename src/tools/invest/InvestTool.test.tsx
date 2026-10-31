// @vitest-environment jsdom
/*
  Smoke test for the whole screen: render it, buy a few things, skip
  through time, sell, and reset. Nothing on screen should ever read NaN,
  undefined, Infinity, or contain an em dash.
*/
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/confetti', () => ({ celebrate: vi.fn() }))

import InvestTool from './index'
import { useGame } from '../../state/store'
import { EVENTS } from '../../state/badges'
import { TICKERS } from './assets'
import { buy, freshState, type InvestState } from './sim'

beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      value: (q: string) => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }),
    })
  }
  Element.prototype.scrollIntoView = () => {}
})

afterEach(cleanup)

// The last one is the em dash, written as an escape so this file never contains one.
const bad = new RegExp('NaN|undefined|Infinity|\\u2014')

function checkText() {
  const text = document.body.textContent ?? ''
  expect(text).not.toMatch(bad)
}

async function buyFrom(name: RegExp, amountLabel: string) {
  fireEvent.click(screen.getByRole('button', { name }))
  const dialog = await screen.findByRole('dialog')
  checkText()
  fireEvent.click(within(dialog).getByRole('button', { name: amountLabel }))
  const submit = within(dialog).getAllByRole('button').find((b) => b.getAttribute('type') === 'submit')!
  expect((submit as HTMLButtonElement).disabled).toBe(false)
  fireEvent.click(submit)
  await act(async () => {
    await new Promise((r) => setTimeout(r, 400))
  })
}

describe('Practice Investing screen', () => {
  it('works end to end without ever showing junk', async () => {
    useGame.getState().resetAll()
    render(<InvestTool />)
    expect(screen.getByRole('region', { name: 'Your portfolio' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Browse the market' })).toBeTruthy()
    checkText()

    await buyFrom(/^Total Market Index/, '$1,000')
    await buyFrom(/^Snack Attack Inc\./, '$500')
    await buyFrom(/^Bedrock Bond Fund/, '$500')
    await buyFrom(/^Savings Account/, '$100')
    checkText()

    const g = useGame.getState()
    expect(g.stats.events[EVENTS.investTrade]).toBe(4)
    expect(g.stats.events[EVENTS.investDiversified]).toBe(1)
    expect(screen.getByText('What you own')).toBeTruthy()
    expect(screen.getByText('Diversity meter')).toBeTruthy()

    // Skip ahead with the buttons and the keyboard.
    for (const label of [/Next day/i, /\+1 week/i, /\+1 month/i, /\+1 year/i]) {
      fireEvent.click(screen.getByRole('button', { name: label }))
      checkText()
    }
    fireEvent.keyDown(window, { key: '4' })
    fireEvent.keyDown(window, { key: '3' })
    checkText()
    const tool = useGame.getState().tools.invest as { day: number }
    expect(tool.day).toBe(1 + 7 + 30 + 365 + 365 + 30)

    // Sell half of the index fund from "What you own".
    const stuff = screen.getAllByRole('button', { name: /^Total Market Index: worth/ })[0]
    fireEvent.click(stuff)
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('tab', { name: 'Sell' }))
    fireEvent.click(within(dialog).getByRole('button', { name: '50%' }))
    checkText()
    const submit = within(dialog).getAllByRole('button').find((b) => b.getAttribute('type') === 'submit')!
    fireEvent.click(submit)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400))
    })
    expect(useGame.getState().stats.events[EVENTS.investTrade]).toBe(5)
    checkText()

    // Fifty years later, the time machine taps out politely.
    for (let i = 0; i < 52; i++) fireEvent.keyDown(window, { key: '4' })
    checkText()
    expect(screen.getByText(/50-year limit/)).toBeTruthy()
    expect((screen.getByRole('button', { name: /Next day/i }) as HTMLButtonElement).disabled).toBe(true)

    // Start over.
    fireEvent.click(screen.getByRole('button', { name: /Start over/i }))
    const resetDialog = await screen.findByRole('dialog')
    fireEvent.click(within(resetDialog).getByRole('button', { name: /Start over/i }))
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400))
    })
    const fresh = useGame.getState().tools.invest as { day: number; cash: number; flags: { diversified: boolean } }
    expect(fresh.day).toBe(0)
    expect(fresh.cash).toBe(10_000)
    expect(fresh.flags.diversified).toBe(true)
    checkText()
  })

  it('Max spends the last cent, and crumbs worth under a cent can still be sold', async () => {
    useGame.getState().resetAll()
    // $5 of DogeMoon that has crashed to $0.0001, and 29 cents of cash (0.29 * 100 is 28.999... in floats).
    let s = freshState(3)
    for (const [t, d] of [['DMOON', 5], ['TMIX', 10_000 - 5 - 0.29]] as const) {
      const r = buy(s, t, d)
      if (!r.ok) throw new Error('buy failed')
      s = r.state
    }
    const i = TICKERS.indexOf('DMOON')
    const state: InvestState = { ...s, prices: s.prices.map((p, k) => (k === i ? 0.0001 : p)) }
    expect(state.cash).toBe(0.29)
    useGame.getState().setToolState('invest', state)
    render(<InvestTool />)

    await buyFrom(/^Total Market Index,/, 'Max')
    expect((useGame.getState().tools.invest as InvestState).cash).toBe(0)

    fireEvent.click(screen.getByRole('button', { name: /^DogeMoon Coin: worth/ }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'All' }))
    const submit = within(dialog).getAllByRole('button').find((b) => b.getAttribute('type') === 'submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    fireEvent.click(submit)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400))
    })
    expect((useGame.getState().tools.invest as InvestState).holdings.DMOON).toBeUndefined()
    checkText()
  })
})
