/*
  The results after the last question: XP, a couple of stats, coins,
  confetti, then (one at a time) any streak bump, daily goal, tier unlock,
  and new badges. Rewards were already paid by the Player; this only shows them.
*/
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BookOpen, ChevronDown, Flame, Heart, RotateCcw } from 'lucide-react'
import { getTier } from '../../content'
import type { Exercise } from '../../content/types'
import { Button } from '../../components/Button'
import { CoinIcon, XpIcon } from '../../components/icons'
import { Ring } from '../../components/ui'
import { celebrate } from '../../lib/confetti'
import { randomLine } from '../../lib/copy'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { getBadge } from '../../state/badges'
import { COINS } from '../../state/constants'
import { useXpToday } from '../../state/hooks'
import { useGame } from '../../state/store'
import type { Reward } from '../../state/types'
import { answerOf, promptOf } from './exercises/describe'
import { cx } from './exercises/ChoiceCard'
import {
  LESSON_DONE_LINES,
  LESSON_SUBS,
  PERFECT_LINES,
  PERFECT_SUBS,
  PRACTICE_DONE_LINES,
  PRACTICE_SUBS,
  QUIZ_FAIL_CLOSE,
  QUIZ_FAIL_FAR,
  QUIZ_FAIL_TITLE,
  QUIZ_PASS_LINES,
  QUIZ_PASS_SUB,
  QUIZ_PERFECT_SUB,
  STREAK_FIRST_SUB,
  STREAK_SUBS,
} from './lessonCopy'
import type { FinishInfo } from './Player'
import { clock, type SessionPlan } from './session'
import { useCountUp } from './useCountUp'
import styles from './results.module.css'

type Step = { kind: 'summary' } | { kind: 'streak'; count: number } | { kind: 'goal' } | { kind: 'tier' } | { kind: 'badges'; ids: string[] }

const pct = (n: number) => Math.round(Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0)) * 100)

export function Results({ plan, info, onRetry }: { plan: SessionPlan; info: FinishInfo; onRetry: () => void }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const dailyGoal = useGame((s) => s.settings.dailyGoal)
  const { reward, run } = info
  const quiz = plan.mode === 'quiz'
  const failed = quiz && !reward.passed

  const [copy] = useState(() => headline(plan.mode, reward, run.correct.length, run.gradedTotal, plan.passPercent))
  const steps = useMemo<Step[]>(() => buildSteps(reward, failed), [reward, failed])
  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[Math.min(stepIdx, steps.length - 1)]

  // Celebrate once. Guarded so StrictMode's double effect can't double the fanfare.
  const partied = useRef(false)
  useEffect(() => {
    if (partied.current) return
    partied.current = true
    if (failed) {
      sfx.tap()
      return
    }
    sfx.complete()
    haptic.celebrate()
    window.setTimeout(() => celebrate(reward.perfect || quiz ? 'big' : 'small'), 180)
  }, [failed, quiz, reward.perfect])

  const toLearn = () => navigate('/learn', { replace: true })

  const next = () => {
    const n = stepIdx + 1
    const upcoming = steps[n]
    if (!upcoming) {
      toLearn()
      return
    }
    if (upcoming.kind === 'goal') sfx.coin()
    else sfx.unlock()
    haptic.celebrate()
    if (upcoming.kind === 'tier' || upcoming.kind === 'badges') celebrate('small')
    setStepIdx(n)
  }

  return (
    <div className={styles.results}>
      <main className={styles.main}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={stepIdx}
            className={styles.step}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            {step.kind === 'summary' && <Summary plan={plan} info={info} copy={copy} failed={failed} />}
            {step.kind === 'streak' && <StreakStep count={step.count} />}
            {step.kind === 'goal' && <GoalStep goal={dailyGoal} />}
            {step.kind === 'tier' && <TierStep />}
            {step.kind === 'badges' && <BadgesStep ids={step.ids} />}
          </motion.section>
        </AnimatePresence>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {step.kind === 'summary' && failed ? (
            <>
              <Button color="blue" onClick={onRetry} icon={<RotateCcw size={20} strokeWidth={3} />} autoFocus>
                Try again
              </Button>
              {plan.unitId && (
                <Button variant="outline" block onClick={() => navigate(`/unit/${plan.unitId}`, { replace: true })} icon={<BookOpen size={20} strokeWidth={2.5} />}>
                  Open guidebook
                </Button>
              )}
              <Button variant="ghost" color="gray" block onClick={toLearn}>
                Back to Learn
              </Button>
            </>
          ) : (
            <Button key={stepIdx} onClick={next} autoFocus>
              Continue
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}

/* ---------- Copy ---------- */

interface Copy {
  emoji: string
  title: string
  sub: string
}

function headline(mode: SessionPlan['mode'], r: Reward, correct: number, total: number, passPercent: number): Copy {
  if (mode === 'quiz') {
    if (r.passed) {
      return r.perfect
        ? { emoji: '🏆', title: randomLine(QUIZ_PASS_LINES), sub: QUIZ_PERFECT_SUB }
        : { emoji: '🎓', title: randomLine(QUIZ_PASS_LINES), sub: QUIZ_PASS_SUB }
    }
    const need = Math.ceil((total * passPercent) / 100)
    const short = Math.max(1, need - correct)
    return {
      emoji: '😅',
      title: QUIZ_FAIL_TITLE,
      sub: short <= 2 ? QUIZ_FAIL_CLOSE(short) : QUIZ_FAIL_FAR,
    }
  }
  if (mode === 'practice') return { emoji: '💪', title: randomLine(PRACTICE_DONE_LINES), sub: randomLine(PRACTICE_SUBS) }
  if (r.perfect) return { emoji: '🏆', title: randomLine(PERFECT_LINES), sub: randomLine(PERFECT_SUBS) }
  return { emoji: '🎉', title: randomLine(LESSON_DONE_LINES), sub: randomLine(LESSON_SUBS) }
}

function buildSteps(r: Reward, failed: boolean): Step[] {
  const steps: Step[] = [{ kind: 'summary' }]
  if (failed) return steps
  if (r.streakAfter > r.streakBefore) steps.push({ kind: 'streak', count: r.streakAfter })
  if (r.dailyGoalHit) steps.push({ kind: 'goal' })
  if (r.tierUnlocked === 2) steps.push({ kind: 'tier' })
  const badges = r.newBadges.filter((id) => getBadge(id))
  if (badges.length) steps.push({ kind: 'badges', ids: badges })
  return steps
}

/* ---------- Summary ---------- */

function Summary({ plan, info, copy, failed }: { plan: SessionPlan; info: FinishInfo; copy: Copy; failed: boolean }) {
  const reduce = useReducedMotion()
  const { reward, run, durationMs, heartGain } = info
  const quiz = plan.mode === 'quiz'
  const accuracy = pct(quiz ? (run.gradedTotal ? run.correct.length / run.gradedTotal : 0) : reward.accuracy)
  // XP is the only number that counts up. The other stats are static.
  const xp = useCountUp(Math.max(0, reward.xp), { delay: 450, duration: 800 })
  const missed = useMemo(() => {
    const byId = new Map<string, Exercise>()
    for (const q of run.queue) byId.set(q.ex.id, q.ex)
    return run.missed.map((id) => byId.get(id)).filter((e): e is Exercise => !!e)
  }, [run])
  const need = Math.ceil((run.gradedTotal * plan.passPercent) / 100)
  const streakUp = reward.streakAfter > reward.streakBefore
  // The daily goal bonus gets its own "+10 coins" step next, so don't count it here too.
  const coins = reward.coins - (!failed && reward.dailyGoalHit ? COINS.dailyGoal : 0)

  return (
    <div className={styles.summary}>
      <Hero emoji={copy.emoji} />
      <h1 className={cx(styles.title, failed && styles.titleFail)}>{copy.title}</h1>
      <p className={styles.sub}>{copy.sub}</p>

      <div className={styles.xp}>
        <span className={styles.xpNum}>
          <XpIcon size={30} />
          <span aria-hidden>{Math.round(xp)}</span>
          <span className="sr-only">{reward.xp}</span>
        </span>
        <span className={styles.xpLabel}>
          Total XP
          {reward.doubleXp && <span> (doubled)</span>}
        </span>
      </div>

      <dl className={styles.stats}>
        {quiz ? <Row label="Score" value={`${run.correct.length} of ${run.gradedTotal}`} /> : <Row label="Accuracy" value={`${accuracy}%`} />}
        {failed ? <Row label="To pass" value={`${need} of ${run.gradedTotal}`} /> : <Row label="Time" value={clock(durationMs)} />}
        {failed && streakUp && <Row label="Streak" value={`${reward.streakAfter} ${reward.streakAfter === 1 ? 'day' : 'days'}`} />}
        {failed && reward.dailyGoalHit && <Row label="Daily goal" value="Done" />}
      </dl>

      {(coins > 0 || heartGain > 0) && (
        <motion.div className={styles.loot} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.3 }}>
          {coins > 0 && (
            <span className={styles.lootItem}>
              <CoinIcon size={24} />
              <span>
                +{coins} {coins === 1 ? 'coin' : 'coins'}
              </span>
            </span>
          )}
          {heartGain > 0 && (
            <span className={styles.lootItem}>
              <Heart size={22} strokeWidth={2.5} fill="currentColor" className={styles.lootHeart} aria-hidden />
              <span>+{heartGain} heart</span>
            </span>
          )}
        </motion.div>
      )}

      {missed.length > 0 && <Misses list={missed} startOpen={failed} />}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

/** The one big emoji up top. It pops in once and then sits still. */
function Hero({ emoji }: { emoji: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={styles.hero}
      initial={reduce ? false : { scale: 0.4, rotate: -12 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 13, delay: 0.05 }}
      aria-hidden
    >
      {emoji}
    </motion.div>
  )
}

function Misses({ list, startOpen }: { list: Exercise[]; startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <div className={styles.misses}>
      <button type="button" className={styles.missesToggle} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>
          Review your misses <span className={styles.missesCount}>({list.length})</span>
        </span>
        <ChevronDown size={20} strokeWidth={2.5} className={cx(styles.chev, open && styles.chevOpen)} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            className={styles.missList}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {list.map((ex) => (
              <li key={ex.id} className={styles.missItem}>
                <p>{promptOf(ex)}</p>
                <p className={styles.missA}>
                  <span className={styles.missLabel}>Answer:</span> {answerOf(ex).replace(/\*\*/g, '')}
                </p>
              </li>
            ))}
            <li className={styles.missFoot}>These are saved to Practice so you can try them again.</li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Extra steps ---------- */

function StreakStep({ count }: { count: number }) {
  const reduce = useReducedMotion()
  const [sub] = useState(() => (count <= 1 ? STREAK_FIRST_SUB : randomLine(STREAK_SUBS)))
  const shown = useCountUp(count, { delay: 350, duration: 600 })
  const from = Math.max(0, count - 1)
  return (
    <div className={styles.extra}>
      <div className={styles.flameWrap}>
        <motion.span
          className={styles.flame}
          initial={reduce ? false : { scale: 0.2, y: 30 }}
          animate={reduce ? undefined : { scale: [0.2, 1.12, 1], y: [30, -4, 0] }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          aria-hidden
        >
          <Flame size={128} strokeWidth={1.8} fill="currentColor" />
        </motion.span>
        <span className={styles.flameNum} aria-hidden>
          {Math.max(from, Math.round(shown))}
        </span>
      </div>
      <h1 className={styles.title}>{count}-day streak</h1>
      <p className={styles.sub}>{sub}</p>
    </div>
  )
}

function GoalStep({ goal }: { goal: number }) {
  // Today's real total (a perfect first lesson is 15 XP against a 10 XP goal). Never less than the goal you just hit.
  const xp = Math.max(useXpToday().xp, goal)
  return (
    <div className={styles.extra}>
      <div className={styles.ringWrap}>
        <Ring value={1} size={140} stroke={12} color="green">
          <span className={styles.ringEmoji} aria-hidden>
            🎯
          </span>
        </Ring>
      </div>
      <h1 className={styles.title}>Daily goal reached</h1>
      <p className={styles.sub}>{xp > goal ? `You earned ${xp} XP today. Your goal was ${goal}.` : `You earned ${goal} XP today.`}</p>
      <span className={styles.lootItem}>
        <CoinIcon size={24} />
        <span>+{COINS.dailyGoal} coins</span>
      </span>
    </div>
  )
}

function TierStep() {
  const tier = getTier(2)
  return (
    <div className={styles.extra}>
      <Hero emoji="🌎" />
      <h1 className={styles.title}>You unlocked {tier.name}</h1>
      <p className={styles.sub}>{tier.tagline}</p>
    </div>
  )
}

function BadgesStep({ ids }: { ids: string[] }) {
  const reduce = useReducedMotion()
  const badges = ids.map((id) => getBadge(id)).filter((b): b is NonNullable<typeof b> => !!b)
  return (
    <div className={styles.extra}>
      <h1 className={styles.title}>{badges.length === 1 ? 'New badge' : `${badges.length} new badges`}</h1>
      <ul className={styles.badgeList}>
        {badges.map((b, i) => (
          <motion.li
            key={b.id}
            className={styles.badge}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.15 + i * 0.12 }}
          >
            <span className={styles.badgeEmoji} aria-hidden>
              {b.emoji}
            </span>
            <span className={styles.badgeText}>
              <span className={styles.badgeName}>{b.name}</span>
              <span className={styles.badgeDesc}>{b.description}</span>
            </span>
            <span className={styles.badgeCoins}>
              <CoinIcon size={18} /> +{COINS.badge}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
