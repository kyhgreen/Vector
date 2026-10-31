// @vitest-environment jsdom
/*
  Onboarding flow: every step reachable and back-able, the right values saved
  once at the end, the right first lesson, grown-up demo mode, and the
  keyboard (Enter continues, Escape goes back).
*/
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { MotionGlobalConfig } from 'motion/react'
import { pathForTier } from '../../content'
import { useGame } from '../../state/store'
import { sfx } from '../../lib/sound'
import Onboarding from './Onboarding'

// jsdom has no canvas for the confetti.
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
  if (!Element.prototype.scrollTo) Element.prototype.scrollTo = function () {} as typeof Element.prototype.scrollTo
})
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false
})

const initial = useGame.getState()

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  useGame.setState({ ...initial, settings: { ...initial.settings, sound: false, haptics: false } }, false)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function Where() {
  return <div data-testid="where">{useLocation().pathname}</div>
}

function renderFlow() {
  return render(
    <MemoryRouter initialEntries={['/welcome']}>
      <Routes>
        <Route path="/welcome" element={<Onboarding />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )
}

/** Let the step cooldown pass, like a real person would. */
const later = () => vi.setSystemTime(Date.now() + 1000)

const click = (el: HTMLElement) => {
  later()
  fireEvent.click(el)
}
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const heading = (name: string | RegExp) => screen.findByRole('heading', { level: 1, name })
const key = (k: string, target: Element | Window = window) => {
  later()
  fireEvent.keyDown(target, { key: k })
}

async function toGoal(age: 'grown' | number) {
  click(button('Get started'))
  await heading('How old are you?')
  if (age === 'grown') click(button(/grown-up/))
  else click(button(String(age)))
  click(button('Continue'))
  await heading('What should we call you?')
  fireEvent.change(screen.getByLabelText('Nickname'), { target: { value: '  Sam  ' } })
  click(button('Continue'))
  await heading('Pick a daily goal')
}

describe('onboarding', () => {
  it('sends players who already finished to /learn', () => {
    useGame.setState({ onboarded: true })
    renderFlow()
    expect(screen.getByTestId('where').textContent).toBe('/learn')
  })

  it('saves everything once at the end and opens the first tier 1 lesson', async () => {
    renderFlow()
    await toGoal(12)
    click(button(/Serious/))
    expect(useGame.getState().onboarded).toBe(false) // nothing saved yet
    click(button('Continue'))
    await heading("Here's the deal, Sam")
    expect(screen.queryByText('Demo mode')).toBeNull()
    click(button('Start lesson 1'))

    const s = useGame.getState()
    expect(s.onboarded).toBe(true)
    expect(s.profile.name).toBe('Sam')
    expect(s.profile.age).toBe(12)
    expect(s.settings.dailyGoal).toBe(30)
    expect(s.settings.unlockAll).toBe(false)
    expect(screen.getByTestId('where').textContent).toBe(`/lesson/${pathForTier(1)[0].id}`)
  })

  it('grown-ups get the oldest level and demo mode by default', async () => {
    renderFlow()
    await toGoal('grown')
    click(button('Continue'))
    await heading(/Here's the deal/)
    expect((screen.getByLabelText(/Demo mode/) as HTMLInputElement).checked).toBe(true)
    click(button('Start lesson 1'))
    const s = useGame.getState()
    expect(s.profile.age).toBe(18)
    expect(s.settings.unlockAll).toBe(true)
    expect(screen.getByTestId('where').textContent).toBe(`/lesson/${pathForTier(2)[0].id}`)
  })

  it('grown-ups can turn demo mode off', async () => {
    renderFlow()
    await toGoal('grown')
    click(button('Continue'))
    await heading(/Here's the deal/)
    fireEvent.click(screen.getByLabelText(/Demo mode/))
    click(button('Look around'))
    expect(useGame.getState().settings.unlockAll).toBe(false)
    expect(screen.getByTestId('where').textContent).toBe('/learn')
  })

  it('back keeps your answers', async () => {
    renderFlow()
    await toGoal(16)
    click(button('Back'))
    await heading('What should we call you?')
    expect((screen.getByLabelText('Nickname') as HTMLInputElement).value).toBe('  Sam  ')
    click(button('Back'))
    await heading('How old are you?')
    expect(button('16').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Real-World Money')).toBeTruthy()
  })

  it('a double tap on the goal step does not skip the deal screen', async () => {
    renderFlow()
    await toGoal(13)
    click(button('Continue'))
    // Second tap of a double tap lands on the new button right away.
    fireEvent.click(await screen.findByRole('button', { name: 'Start lesson 1' }))
    expect(useGame.getState().onboarded).toBe(false)
    click(button('Start lesson 1'))
    expect(useGame.getState().onboarded).toBe(true)
  })

  it('one tap on a goal makes one tap sound', async () => {
    renderFlow()
    await toGoal(13)
    const tap = vi.spyOn(sfx, 'tap')
    fireEvent.click(button(/Casual/))
    expect(tap).toHaveBeenCalledTimes(1)
  })

  it('Enter continues, Escape goes back, even from the name box', async () => {
    renderFlow()
    key('Enter')
    await heading('How old are you?')
    key('Enter') // no age yet: stays put
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('How old are you?')
    key('4')
    expect(button('14').getAttribute('aria-pressed')).toBe('true')
    key('Enter')
    await heading('What should we call you?')
    const input = screen.getByLabelText('Nickname')
    input.focus()
    key('Escape', input)
    await heading('How old are you?')
    key('Escape')
    await heading('vector')
  })

  it('Enter on an empty name skips it, number keys pick a goal, Enter finishes', async () => {
    renderFlow()
    key('Enter')
    await heading('How old are you?')
    key('1')
    key('Enter')
    await heading('What should we call you?')
    key('Enter', screen.getByLabelText('Nickname'))
    await heading('Pick a daily goal')
    key('4')
    key('Enter')
    await heading("Here's the deal")
    key('Enter')
    const s = useGame.getState()
    expect(s.onboarded).toBe(true)
    expect(s.profile.name).toBe('')
    expect(s.profile.age).toBe(11)
    expect(s.settings.dailyGoal).toBe(50)
  })

  it('never shows junk text', async () => {
    renderFlow()
    await toGoal('grown')
    click(button('Continue'))
    await heading(/Here's the deal/)
    await act(async () => {})
    expect(document.body.textContent).not.toMatch(/NaN|undefined|Infinity|\[object Object\]|—/)
  })
})
