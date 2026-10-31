/*
  Plays one session (lesson, quiz, or practice) from start to results.
  The rules live in session.ts; this file is the feel: sounds, shakes,
  hearts, the feedback panel, and keyboard shortcuts.
*/
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { isQuestion, type UnitColor } from '../../content/types'
import { Button } from '../../components/Button'
import { HeartsSheet } from '../../components/HeartsSheet'
import { Sheet } from '../../components/Sheet'
import { randomLine } from '../../lib/copy'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { normalizeHearts } from '../../state/logic'
import { useGame } from '../../state/store'
import type { Reward } from '../../state/types'
import { ExerciseView } from './exercises/ExerciseView'
import { explainOf } from './exercises/describe'
import type { MatchFinish, Verdict } from './exercises/types'
import { Footer, type FeedbackInfo, type FooterKind } from './Footer'
import {
  COMBO_TAILS,
  COMEBACK_LINES,
  CORRECT_LINES,
  LESSON_QUIT_LINES,
  MATCH_MESSY_LINES,
  MATCH_MESSY_NOTE,
  MATCH_MESSY_NOTE_QUIZ,
  PRACTICE_QUIT_LINES,
  QUIT_TITLES,
  QUIZ_QUIT_LINES,
  RETRY_LABEL,
  WRONG_LINES,
} from './lessonCopy'
import { Results } from './Results'
import {
  advanceRun,
  currentItem,
  gradeCurrent,
  isComboMilestone,
  isRunOver,
  lessonResult,
  practiceResult,
  progressOf,
  quizResult,
  startRun,
  type RunState,
  type SessionPlan,
} from './session'
import { TopBar, type ComboPop } from './TopBar'
import styles from './lesson.module.css'

export interface FinishInfo {
  reward: Reward
  run: RunState
  durationMs: number
  /** Practice gives a heart back. */
  heartGain: number
}

/** The unit's color, plus a readable "ink" version for text (yellow text on white is hard to read). */
export function accentVars(color: UnitColor): CSSProperties {
  return {
    ['--a' as string]: `var(--c-${color})`,
    ['--a-dark' as string]: `var(--c-${color}-dark)`,
    ['--a-soft' as string]: `var(--c-${color}-soft)`,
    ['--a-ink' as string]: color === 'yellow' ? 'var(--c-orange-dark)' : `var(--c-${color}-dark)`,
    ['--a-ink-night' as string]: `var(--c-${color})`,
  } as CSSProperties
}

/** Keeps double taps and held keys from skipping a card. */
const ACTION_GAP_MS = 280

export function Player({ plan, onRetry }: { plan: SessionPlan; onRetry: () => void }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const heartsOn = useGame((s) => s.settings.heartsOn)

  const [run, setRun] = useState(() => startRun(plan))
  const runRef = useRef(run)
  const [startedAt] = useState(() => Date.now())
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [feedback, setFeedback] = useState<FeedbackInfo | null>(null)
  const feedbackRef = useRef(false)
  const [combo, setCombo] = useState<ComboPop | null>(null)
  const [quitOpen, setQuitOpen] = useState(false)
  const [quitLine, setQuitLine] = useState('')
  const [result, setResult] = useState<FinishInfo | null>(null)
  const finishedRef = useRef(false)
  const lastActionAt = useRef(0)
  const timers = useRef<number[]>([])
  const mainRef = useRef<HTMLElement>(null)
  const [shakeScope, animateShake] = useAnimate<HTMLDivElement>()

  const item = currentItem(run)
  const ex = item?.ex
  const usesHearts = plan.mode === 'lesson' && heartsOn
  const outOfHearts = useOutOfHearts(usesHearts && !feedback && !result)
  const keysActive = !quitOpen && !outOfHearts && !feedback && !result

  useEffect(() => {
    const list = timers.current
    return () => list.forEach((t) => window.clearTimeout(t))
  }, [])
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  // Combo pops fade out by themselves.
  useEffect(() => {
    if (!combo) return
    const t = window.setTimeout(() => setCombo((c) => (c && c.id === combo.id ? null : c)), 1900)
    return () => window.clearTimeout(t)
  }, [combo])

  // New card: back to the top.
  useEffect(() => {
    mainRef.current?.scrollTo?.({ top: 0 })
  }, [item?.key])

  const commitRun = (next: RunState) => {
    runRef.current = next
    setRun(next)
  }

  const throttled = () => {
    const now = Date.now()
    if (now - lastActionAt.current < ACTION_GAP_MS) return true
    lastActionAt.current = now
    return false
  }

  /** Records an answer and shows the feedback panel. */
  const grade = (v: Verdict, match?: MatchFinish) => {
    const cur = runRef.current
    const it = currentItem(cur)
    if (!it || !isQuestion(it.ex) || feedbackRef.current) return
    feedbackRef.current = true
    const next = gradeCurrent(cur, v.correct, match ? { requeue: false } : {})
    commitRun(next)
    const explain = explainOf(it.ex)

    if (match) {
      // Matching never costs hearts. A few wrong taps gives the orange "meh" result instead of a miss.
      sfx.correct()
      haptic.correct()
      setFeedback(
        v.correct
          ? { tone: 'right', title: randomLine(it.retry ? COMEBACK_LINES : CORRECT_LINES), explain }
          : { tone: 'meh', title: randomLine(MATCH_MESSY_LINES), explain, note: plan.mode === 'quiz' ? MATCH_MESSY_NOTE_QUIZ : MATCH_MESSY_NOTE },
      )
    } else if (v.correct) {
      sfx.correct()
      haptic.correct()
      setFeedback({ tone: 'right', title: randomLine(it.retry ? COMEBACK_LINES : CORRECT_LINES), why: v.why, whyLabel: v.whyLabel, explain })
    } else {
      sfx.wrong()
      haptic.wrong()
      if (!reduce && shakeScope.current) {
        animateShake(shakeScope.current, { x: [0, -12, 11, -8, 6, -3, 0] }, { duration: 0.45, ease: 'easeOut' })
      }
      // Save it for Practice now, so "Practice for a heart" works even mid-lesson.
      if (plan.mode !== 'practice') useGame.getState().noteMistake(it.ex.id)
      if (usesHearts) {
        useGame.getState().loseHeart()
        later(() => sfx.heartLost(), 380)
      }
      setFeedback({
        tone: 'wrong',
        title: randomLine(WRONG_LINES),
        answer: v.answer,
        answerLabel: it.ex.type === 'scenario' ? 'Best choice:' : it.ex.type === 'sort' ? 'Where they go:' : undefined,
        answerDetail: v.answerDetail,
        why: v.why,
        whyLabel: v.whyLabel,
        explain,
      })
    }

    if (v.correct && isComboMilestone(next.combo)) {
      setCombo({ n: next.combo, tail: randomLine(COMBO_TAILS), id: Date.now() })
    }
  }

  const check = () => {
    if (!keysReady() || !verdict || !ex || ex.type === 'teach' || ex.type === 'match') return false
    if (throttled()) return false
    grade(verdict)
    return true
  }

  const keysReady = () => !quitOpen && !outOfHearts && !finishedRef.current

  const advance = () => {
    const cur = runRef.current
    const it = currentItem(cur)
    // keysReady() also blocks a button focused behind an open sheet from skipping ahead.
    if (!it || !keysReady()) return false
    if (it.ex.type !== 'teach' && !feedbackRef.current) return false
    if (throttled()) return false
    const next = advanceRun(cur)
    feedbackRef.current = false
    setFeedback(null)
    setVerdict(null)
    commitRun(next)
    if (isRunOver(next)) finish(next)
    return true
  }

  const finish = (r: RunState) => {
    // Rewards pay out exactly once, even if something calls this twice.
    if (finishedRef.current) return
    finishedRef.current = true
    const durationMs = Math.max(0, Date.now() - startedAt)
    const store = useGame.getState()
    let reward: Reward
    let heartGain = 0
    if (plan.mode === 'lesson') {
      reward = store.finishLesson(lessonResult(r, plan.refId, durationMs))
    } else if (plan.mode === 'quiz') {
      reward = store.finishQuiz(quizResult(r, plan.refId, durationMs))
    } else {
      const before = normalizeHearts(store.hearts, store.heartsUpdatedAt, Date.now()).hearts
      reward = store.finishPractice(practiceResult(r))
      const after = useGame.getState()
      heartGain = after.settings.heartsOn ? Math.max(0, after.hearts - before) : 0
    }
    setResult({ reward, run: r, durationMs, heartGain })
  }

  const onAutoFinish = (f: MatchFinish) => {
    if (finishedRef.current) return
    grade(f.verdict, f)
  }

  const openQuit = () => {
    const lines = plan.mode === 'quiz' ? QUIZ_QUIT_LINES : plan.mode === 'practice' ? PRACTICE_QUIT_LINES : LESSON_QUIT_LINES
    setQuitLine(randomLine(lines))
    setQuitOpen(true)
  }
  const quit = () => navigate('/learn', { replace: true })

  // Keyboard: Enter = Check / Continue, Escape = quit dialog.
  const primaryRef = useRef<() => boolean>(() => false)
  const escRef = useRef<() => void>(() => {})
  useEffect(() => {
    primaryRef.current = () => {
      if (!keysReady()) return false
      if (!ex) return false
      if (ex.type === 'teach' || feedbackRef.current) return advance()
      return check()
    }
    escRef.current = () => {
      if (!quitOpen && !outOfHearts && !finishedRef.current) openQuit()
    }
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Holding Enter would otherwise keep "clicking" whatever button has focus and race through
      // cards (or straight through the results steps, so this stays on after the finish too).
      if (e.key === 'Enter' && e.repeat) {
        e.preventDefault()
        return
      }
      if (finishedRef.current) return
      if (e.key === 'Escape') {
        escRef.current()
        return
      }
      if (e.key !== 'Enter' || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const t = e.target as HTMLElement | null
      // A focused button outside the exercise (Quit, Continue) does its own thing.
      if (t && t.closest('button') && !mainRef.current?.contains(t)) return
      if (t && t.closest('[role="dialog"]')) return
      if (primaryRef.current()) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const quizQuestion = useMemo(
    () => (plan.mode === 'quiz' ? { n: Math.min(run.index + 1, Math.max(1, run.queue.length)), total: run.gradedTotal } : undefined),
    [plan.mode, run.index, run.queue.length, run.gradedTotal],
  )

  if (result) {
    return (
      <div className={styles.screen} style={accentVars(plan.color)}>
        <Results plan={plan} info={result} onRetry={onRetry} />
      </div>
    )
  }

  const footerKind: FooterKind = !ex || ex.type === 'teach' ? 'teach' : ex.type === 'match' ? 'match' : 'question'

  return (
    // While a sheet is open (they render in a portal), the lesson behind it can't be tabbed to or tapped.
    <div className={styles.screen} style={accentVars(plan.color)} inert={quitOpen || outOfHearts}>
      <TopBar mode={plan.mode} progress={progressOf(run)} question={quizQuestion} combo={combo} onQuit={openQuit} />

      <main ref={mainRef} className={styles.main}>
        <div ref={shakeScope} className={styles.stage}>
          <AnimatePresence mode="wait" initial={false}>
            {item && ex && (
              <motion.div
                key={item.key}
                className={styles.card}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0.1 } } : { opacity: 0, x: -48, transition: { duration: 0.16, ease: 'easeIn' } }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              >
                {item.retry && (
                  <p className={styles.retryTag}>
                    <RotateCcw size={16} strokeWidth={2.5} aria-hidden />
                    <span>{RETRY_LABEL}</span>
                  </p>
                )}
                <ExerciseView ex={ex} checked={!!feedback} keysActive={keysActive} onAnswer={(v) => !feedbackRef.current && setVerdict(v)} onAutoFinish={onAutoFinish} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer kind={footerKind} ready={!!verdict} feedback={feedback} onCheck={check} onContinue={advance} />

      <Sheet open={quitOpen} onClose={() => setQuitOpen(false)} title={QUIT_TITLES[plan.mode]} emoji="😢">
        <p className={styles.quitText}>{quitLine}</p>
        <div className={styles.quitButtons}>
          <Button onClick={() => setQuitOpen(false)} autoFocus>
            Keep learning
          </Button>
          <Button variant="ghost" color="red" onClick={quit}>
            Quit
          </Button>
        </div>
      </Sheet>

      <HeartsSheet open={outOfHearts} onClose={() => {}} outOfHearts onQuit={quit} />
    </div>
  )
}

/**
  True when hearts are on, you have none left, and the lesson should pause.
  Hearts refill over time, so while you're stuck it re-checks every few seconds.
*/
function useOutOfHearts(active: boolean): boolean {
  const hearts = useGame((s) => s.hearts)
  const updatedAt = useGame((s) => s.heartsUpdatedAt)
  const heartsOn = useGame((s) => s.settings.heartsOn)
  const [, setTick] = useState(0)
  const empty = heartsOn && normalizeHearts(hearts, updatedAt, Date.now()).hearts <= 0
  useEffect(() => {
    if (!active || !empty) return
    const t = window.setInterval(() => setTick((n) => n + 1), 5000)
    return () => window.clearInterval(t)
  }, [active, empty])
  return active && empty
}
