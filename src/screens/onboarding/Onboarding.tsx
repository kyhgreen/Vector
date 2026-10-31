/*
  First-run onboarding at /welcome. Five steps that slide sideways:

    1. Splash ("vector" + the poke-able dollar bill)
    2. How old are you?      (sets the starting level)
    3. What should we call you?  (avatar + nickname, optional)
    4. Pick a daily goal
    5. Here's the deal       (XP, streaks, hearts) then start the first lesson

  Nothing is saved until the very end, so backing out halfway is harmless.
  Keyboard: Enter continues, Escape goes back, type your age on step 2,
  and 1 to 4 pick a goal on step 4.
*/
import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ui'
import { pathForTier, tierForAge } from '../../content'
import { DAILY_GOALS } from '../../state/constants'
import { useGame } from '../../state/store'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { celebrate } from '../../lib/confetti'
import { Splash } from './Splash'
import { AGES, AgeStep } from './AgeStep'
import { FREE_AVATARS, NameStep } from './NameStep'
import { GoalStep } from './GoalStep'
import { DealStep } from './DealStep'
import { HEADING_ID } from './StepHeader'
import styles from './Onboarding.module.css'

const STEPS = ['splash', 'age', 'name', 'goal', 'deal'] as const
type StepId = (typeof STEPS)[number]

/** Grown-ups (parents, teachers, judges) get the oldest level. */
const GROWN_UP_AGE = 18
const DEFAULT_GOAL = DAILY_GOALS.find((g) => g.label === 'Regular')?.xp ?? 20
/** Ignore a second "continue" this soon after a step change (double taps, held Enter). */
const STEP_COOLDOWN_MS = 280

interface Draft {
  age: number | null
  grownUp: boolean
  name: string
  avatar: string
  goal: number
  demo: boolean
}

export default function Onboarding() {
  // Decide once, on arrival. Finishing onboarding flips `onboarded` to true,
  // and we don't want that to yank the player to /learn mid-navigation.
  const [alreadyOnboarded] = useState(() => useGame.getState().onboarded)
  if (alreadyOnboarded) return <Navigate to="/learn" replace />
  return <Flow />
}

const slide: Variants = {
  enter: (dir: number) => ({ x: dir * 72, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { x: { type: 'spring', stiffness: 420, damping: 34 }, opacity: { duration: 0.18 } } },
  exit: (dir: number) => ({ x: dir * -72, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }),
}
const fade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
}

function Flow() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [[index, dir], setNav] = useState<[number, number]>([0, 1])
  const [draft, setDraft] = useState<Draft>(() => {
    const avatar = useGame.getState().profile.avatar
    return {
      age: null,
      grownUp: false,
      name: '',
      avatar: FREE_AVATARS.some((a) => a.id === avatar) ? avatar : FREE_AVATARS[0].id,
      goal: DEFAULT_GOAL,
      demo: true,
    }
  })
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const step: StepId = STEPS[index]
  const mainRef = useRef<HTMLElement>(null)
  const lastMove = useRef(0)
  const finishing = useRef(false)
  const ageKeys = useRef({ buf: '', at: 0 })

  const firstLesson = useMemo(() => {
    if (draft.age === null) return undefined
    const node = pathForTier(tierForAge(draft.age))[0]
    return node?.kind === 'lesson' ? node : undefined
  }, [draft.age])

  const go = (to: number) => {
    const now = Date.now()
    if (now - lastMove.current < STEP_COOLDOWN_MS) return
    lastMove.current = now
    const next = Math.max(0, Math.min(STEPS.length - 1, to))
    setNav([next, next >= index ? 1 : -1])
    mainRef.current?.scrollTo({ top: 0 })
  }

  const pickAge = (age: number) => {
    sfx.tap()
    haptic.tap()
    patch({ age, grownUp: false })
  }
  const pickGrownUp = () => {
    sfx.tap()
    haptic.tap()
    patch({ age: GROWN_UP_AGE, grownUp: true, demo: true })
  }
  const pickGoal = (xp: number) => {
    sfx.tap()
    haptic.tap()
    patch({ goal: xp })
  }

  const finish = (dest: 'lesson' | 'learn') => {
    // Same cooldown as `go`: the second tap of a double tap on the goal step's
    // Continue lands on "Start lesson 1" and would skip this screen entirely.
    if (finishing.current || draft.age === null || Date.now() - lastMove.current < STEP_COOLDOWN_MS) return
    finishing.current = true
    const game = useGame.getState()
    game.completeOnboarding({ name: draft.name.trim(), age: draft.age, dailyGoal: draft.goal })
    game.setAvatar(draft.avatar)
    if (draft.grownUp && draft.demo) game.updateSettings({ unlockAll: true })
    sfx.unlock()
    haptic.celebrate()
    if (dest === 'lesson') celebrate('small')
    navigate(dest === 'lesson' && firstLesson ? `/lesson/${firstLesson.id}` : '/learn', { replace: true })
  }

  const canContinue = step !== 'age' || draft.age !== null

  /** What Enter (and the big green button) does on each step. */
  const primary = () => {
    if (!canContinue) return
    if (step === 'name') {
      // An empty nickname is fine. Enter on an empty box just skips.
      if (!draft.name.trim()) patch({ name: '' })
      go(index + 1)
    } else if (step === 'deal') finish(firstLesson ? 'lesson' : 'learn')
    else go(index + 1)
  }
  const back = () => index > 0 && go(index - 1)

  // Keyboard shortcuts. Handlers live in a ref so the listener is set up once
  // but always sees the latest state.
  const keys = useRef({ primary, back, step, pickAge, pickGoal })
  keys.current = { primary, back, step, pickAge, pickGoal }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return
      const k = keys.current
      const t = e.target instanceof HTMLElement ? e.target : null
      const tag = t?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!t?.isContentEditable

      if (e.key === 'Enter') {
        if (e.repeat) return
        if (t instanceof HTMLInputElement && t.type === 'checkbox') return
        // A selected choice tile: Enter moves on. Unselected: let it select itself.
        if (t?.hasAttribute('data-choice')) {
          if (t.getAttribute('aria-pressed') !== 'true') return
          e.preventDefault()
          k.primary()
          return
        }
        if (tag === 'BUTTON' || tag === 'A') return // the browser clicks it for us
        e.preventDefault()
        k.primary()
        return
      }
      // Escape works from the name box too (it has focus on that step).
      if (e.key === 'Escape') {
        if (!e.repeat) k.back()
        return
      }
      if (typing) return
      if (k.step === 'age' && /^\d$/.test(e.key)) {
        const now = Date.now()
        const prev = ageKeys.current
        const buf = now - prev.at < 1200 && prev.buf.length === 1 ? prev.buf + e.key : e.key
        ageKeys.current = { buf, at: now }
        const n = Number(buf)
        const age = buf.length === 2 ? n : 10 + n
        if ((AGES as readonly number[]).includes(age)) k.pickAge(age)
        return
      }
      if (k.step === 'goal' && /^[1-9]$/.test(e.key)) {
        const g = DAILY_GOALS[Number(e.key) - 1]
        if (g) k.pickGoal(g.xp)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // After a step slides in, move focus to it (the name box, or the question),
  // so keyboard and screen reader users land in the right place. On touch
  // screens we skip the name box, so the keyboard doesn't pop up and hide
  // the avatar picker before anyone asked for it.
  const focusStep = () => {
    const root = mainRef.current
    if (!root) return
    const finePointer = typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const input = finePointer ? root.querySelector<HTMLElement>('[data-autofocus]') : null
    const target = input ?? root.querySelector<HTMLElement>(`#${HEADING_ID}`)
    target?.focus({ preventScroll: true })
  }

  const progress = index / STEPS.length

  return (
    <div className={styles.screen}>
      <header className={styles.top}>
        <AnimatePresence initial={false}>
          {index > 0 && (
            <motion.div
              className={styles.topInner}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              <button type="button" className={styles.back} onClick={back} aria-label="Back">
                <ArrowLeft size={26} strokeWidth={2.5} />
              </button>
              <ProgressBar value={progress} color="green" height={16} className={styles.progress} label={`Step ${index} of ${STEPS.length - 1}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main ref={mainRef} className={styles.main}>
        <div className={styles.column}>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              className={styles.step}
              custom={dir}
              variants={reduce ? fade : slide}
              initial="enter"
              animate="center"
              exit="exit"
              onAnimationComplete={(def) => {
                if (def === 'center') focusStep()
              }}
            >
              {step === 'splash' && <Splash />}
              {step === 'age' && <AgeStep age={draft.age} grownUp={draft.grownUp} onPick={pickAge} onGrownUp={pickGrownUp} />}
              {step === 'name' && (
                <NameStep name={draft.name} avatar={draft.avatar} onName={(name) => patch({ name })} onAvatar={(avatar) => patch({ avatar })} />
              )}
              {step === 'goal' && <GoalStep goal={draft.goal} onGoal={pickGoal} />}
              {step === 'deal' && (
                <DealStep name={draft.name} goal={draft.goal} grownUp={draft.grownUp} demo={draft.demo} onDemo={(demo) => patch({ demo })} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className={`${styles.footer} ${step === 'splash' ? styles.footerBare : ''}`}>
        <div className={styles.footerInner}>
          {step === 'splash' && (
            <>
              <Button onClick={primary}>Get started</Button>
              <p className={styles.fine}>No account. Nothing leaves this device.</p>
            </>
          )}
          {step === 'age' && (
            <Button onClick={primary} disabled={!canContinue}>
              Continue
            </Button>
          )}
          {step === 'name' && (
            <>
              <Button onClick={primary} disabled={!draft.name.trim()}>
                Continue
              </Button>
              <Button
                variant="ghost"
                color="blue"
                block
                onClick={() => {
                  patch({ name: '' })
                  go(index + 1)
                }}
              >
                Skip
              </Button>
            </>
          )}
          {step === 'goal' && <Button onClick={primary}>Continue</Button>}
          {step === 'deal' && (
            <>
              <Button onClick={() => finish(firstLesson ? 'lesson' : 'learn')}>{firstLesson ? 'Start lesson 1' : 'Start'}</Button>
              {firstLesson && (
                <Button variant="ghost" color="blue" block onClick={() => finish('learn')}>
                  Look around
                </Button>
              )}
            </>
          )}
        </div>
      </footer>
    </div>
  )
}
