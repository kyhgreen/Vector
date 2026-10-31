// @vitest-environment jsdom
/*
  Shop smoke + regression tests: buying power-ups and avatars charges once
  (even on a double tap while the sheet is closing), the Double XP timer reads
  right, and the vault never lets you move coins you don't have.
*/
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { useGame } from '../../state/store'
import { BADGES } from '../../state/badges'
import { DOUBLE_XP_MS, MAX_HEARTS } from '../../state/constants'
import { dayKey } from '../../lib/dates'
import ShopScreen from './ShopScreen'

beforeAll(() => {
  // Report reduced motion so confetti (canvas) stays off in jsdom.
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
})

const initial = useGame.getState()

beforeEach(() => {
  useGame.setState(
    {
      ...initial,
      onboarded: true,
      coins: 200,
      hearts: MAX_HEARTS,
      doubleXpUntil: 0,
      streak: { ...initial.streak, freezes: 0 },
      vault: { balance: 0, lastAccrualDay: dayKey(), totalInterest: 0 },
      ownedAvatars: initial.ownedAvatars,
      profile: { ...initial.profile, name: 'Sam', age: 12, avatar: 'coin' },
      settings: { ...initial.settings, sound: false, haptics: false, heartsOn: true },
      toasts: [],
      // Every badge already earned, so badge payouts don't muddy the coin math.
      badges: Object.fromEntries(BADGES.map((b) => [b.id, dayKey()])),
    },
    false,
  )
})
afterEach(() => cleanup())

const renderShop = () =>
  render(
    <MemoryRouter>
      <ShopScreen />
    </MemoryRouter>,
  )

function expectClean(text: string) {
  expect(text).not.toMatch(/NaN|undefined|Infinity|\[object/)
  expect(text).not.toContain('—')
}

describe('ShopScreen', () => {
  it('renders without junk on screen', () => {
    const { container } = renderShop()
    expect(screen.getByText('Coin Vault')).toBeTruthy()
    expectClean(container.textContent ?? '')
  })

  it('charges once when Buy is tapped twice while the sheet closes', () => {
    renderShop()
    fireEvent.click(screen.getByRole('button', { name: /Buy Streak Freeze for 40 coins/ }))
    const buy = within(screen.getByRole('dialog')).getByRole('button', { name: /Buy for 40/ })
    act(() => {
      fireEvent.click(buy)
      fireEvent.click(buy)
    })
    const s = useGame.getState()
    expect(s.coins).toBe(160)
    expect(s.streak.freezes).toBe(1)
  })

  it('does not stack Double XP on a double tap, and the timer starts at 15:00', () => {
    renderShop()
    fireEvent.click(screen.getByRole('button', { name: /Buy Double XP/ }))
    const buy = within(screen.getByRole('dialog')).getByRole('button', { name: /Buy for 50/ })
    act(() => {
      fireEvent.click(buy)
      fireEvent.click(buy)
    })
    const s = useGame.getState()
    expect(s.coins).toBe(150)
    expect(s.doubleXpUntil - Date.now()).toBeLessThanOrEqual(DOUBLE_XP_MS)
    expect(screen.queryByText(/15:01 left/)).toBeNull()
    expect(screen.getByText(/1[45]:\d\d left/)).toBeTruthy()
  })

  it('buys an avatar once, wears it, and can swap back to a free one', () => {
    renderShop()
    fireEvent.click(screen.getByRole('button', { name: /^Money sprout, 30 coins/ }))
    const get = within(screen.getByRole('dialog')).getByRole('button', { name: /Get it for 30/ })
    act(() => {
      fireEvent.click(get)
      fireEvent.click(get)
    })
    let s = useGame.getState()
    expect(s.coins).toBe(170)
    expect(s.profile.avatar).toBe('sprout')
    expect(s.ownedAvatars).toContain('sprout')
    expect(s.toasts.some((t) => /already own/i.test(t.title))).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: /^Coin, owned/ }))
    s = useGame.getState()
    expect(s.profile.avatar).toBe('coin')
    expect(s.coins).toBe(170)
  })

  it('is honest about how far off a pricey avatar is', () => {
    useGame.setState({ coins: 25 })
    renderShop()
    fireEvent.click(screen.getByRole('button', { name: /^Gold bars, 250 coins, 225 short/ }))
    const dialog = screen.getByRole('dialog')
    expect(dialog.textContent).not.toMatch(/couple of lessons/)
    expect(within(dialog).getByRole('button', { name: /Earn coins/ })).toBeTruthy()
    expectClean(dialog.textContent ?? '')
  })

  it('vault: deposits, refuses too much, and withdraws only whole coins', () => {
    useGame.setState({ coins: 30 })
    renderShop()
    const input = screen.getByLabelText('Coins to deposit') as HTMLInputElement
    fireEvent.change(input, { target: { value: '45' } })
    expect(screen.getByText('You only have 30 coins.')).toBeTruthy()
    expect((screen.getByRole('button', { name: /^Deposit 45/ }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(input, { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: /^Deposit 20/ }))
    let s = useGame.getState()
    expect(s.coins).toBe(10)
    expect(s.vault.balance).toBe(20)

    useGame.setState({ vault: { ...s.vault, balance: 20.6 } })
    fireEvent.click(screen.getByRole('tab', { name: /Withdraw/ }))
    fireEvent.click(screen.getByRole('button', { name: /^All/ }))
    fireEvent.click(screen.getByRole('button', { name: /^Withdraw 20/ }))
    s = useGame.getState()
    expect(s.coins).toBe(30)
    expect(s.vault.balance).toBeCloseTo(0.6)
    expectClean(document.body.textContent ?? '')
  })
})
