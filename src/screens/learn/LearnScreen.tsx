/*
  The Learn tab (home). Mostly the path. Above it sit a small tier switcher,
  a practice button with the daily goal, and one fun fact a day.
*/
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, useAnimate, useReducedMotion } from 'motion/react'
import { ChevronRight, Dumbbell, Lock, Zap } from 'lucide-react'
import { UNITS, getTier, pathForTier } from '../../content'
import type { TierId, Unit } from '../../content/types'
import { StatBar } from '../../components/StatBar'
import { Button } from '../../components/Button'
import { Empty, ProgressBar, Ring } from '../../components/ui'
import { completion, isNodeDone, isTierComplete, isTierUnlocked, pathWithStatus } from '../../state/progress'
import { useNow, useXpToday } from '../../state/hooks'
import { useGame } from '../../state/store'
import type { GameData } from '../../state/types'
import { dayKey } from '../../lib/dates'
import { hashString } from '../../lib/random'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { celebrate } from '../../lib/confetti'
import { TierPath } from './Path'
import { TierSwitcher } from './TierSwitcher'
import { TIER_LOOK, colorVars, defaultTier, getRememberedTier, rememberTier, toPct, usePathData } from './learnUtils'
import styles from './LearnScreen.module.css'

const FACTS: { text: string; unit: Unit }[] = UNITS.flatMap((unit) =>
  (unit.guidebook?.funFacts ?? []).filter((t) => t && t.trim()).map((text) => ({ text, unit })),
)

export default function LearnScreen() {
  const data = usePathData()
  const [tier, setTier] = useState<TierId>(() => {
    // A remembered tier that has since locked (demo mode off, progress reset) shouldn't greet you with a wall of locks.
    const s = useGame.getState()
    const remembered = getRememberedTier()
    return remembered !== null && isTierUnlocked(s, remembered) ? remembered : defaultTier(s)
  })
  const items = useMemo(() => pathWithStatus(data, tier), [data, tier])
  const unlocked = isTierUnlocked(data, tier)
  const tierDone = isTierComplete(data, tier)
  const info = getTier(tier)

  const pick = (t: TierId) => {
    setTier(t)
    rememberTier(t)
  }

  const lockedHint = unlocked ? undefined : `Finish ${getTier(1).name} first.`

  return (
    <div className={styles.screen}>
      <div className={styles.top}>
        <StatBar />
      </div>

      <TierSwitcher data={data} value={tier} onChange={pick} />

      <QuickActions />

      <FunFact tier={tier} />

      {!unlocked && <LockedTier data={data} onBack={() => pick(1)} />}

      {items.length === 0 ? (
        <div className={styles.emptyWrap}>
          <Empty emoji="📝" title="Coming soon">
            The {info.name} lessons aren't ready yet. Check back soon.
          </Empty>
        </div>
      ) : (
        <TierPath key={tier} items={items} lockedHint={lockedHint} />
      )}

      {tierDone && <TierDone tier={tier} onNext={() => pick(2)} />}
    </div>
  )
}

/* ---------------------------------------------------------------------------------- */

function QuickActions() {
  const navigate = useNavigate()
  const mistakes = useGame((s) => s.mistakes.length)
  const anyDone = useGame((s) => Object.keys(s.lessons).length > 0)
  const { xp, goal, pct, done } = useXpToday()
  const safeXp = Number.isFinite(xp) ? Math.max(0, Math.round(xp)) : 0
  const safeGoal = Number.isFinite(goal) && goal > 0 ? goal : 0

  const shown = Math.min(safeXp, safeGoal)
  const practiceSub = mistakes > 0 ? `${mistakes > 99 ? '99+' : mistakes} to fix` : anyDone ? 'Quick warm-up' : 'Nothing to fix'

  return (
    <div className={styles.quick}>
      <button
        type="button"
        className={styles.tile}
        style={colorVars('orange')}
        onClick={() => {
          sfx.tap()
          haptic.tap()
          navigate('/practice')
        }}
        aria-label={`Practice. ${practiceSub}.`}
      >
        <span className={styles.tileIcon} aria-hidden>
          <Dumbbell size={22} strokeWidth={2.5} />
        </span>
        <span className={styles.tileText}>
          <span className={styles.tileTitle}>Practice</span>
          <span className={styles.tileSub}>{practiceSub}</span>
        </span>
        <ChevronRight className={styles.chev} size={18} strokeWidth={3} aria-hidden />
      </button>

      <div className={styles.goal} role="group" aria-label={`Daily goal: ${shown} of ${safeGoal} XP`}>
        <Ring value={Number.isFinite(pct) ? pct : 0} size={40} stroke={5} color="yellow">
          <Zap size={16} strokeWidth={3} className={styles.ringIcon} fill="currentColor" aria-hidden />
        </Ring>
        <span className={styles.goalText}>
          <span className={styles.goalNum}>
            {shown}/{safeGoal} XP
          </span>
          <span className={styles.goalSub}>{done ? 'Goal met' : 'Today'}</span>
        </span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------------- */

function FunFact({ tier }: { tier: TierId }) {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const today = dayKey(now)
  // Pick from the tier being viewed, so 11-year-olds get age-appropriate facts.
  const pool = FACTS.filter((f) => f.unit.tier === tier)
  const fact = pool.length ? pool[hashString(`fact-${today}`) % pool.length] : null
  if (!fact) return null

  return (
    <section className={styles.fact} aria-labelledby="fun-fact-title">
      <h2 id="fun-fact-title" className={styles.factTitle}>
        Fun fact
      </h2>
      <p className={styles.factText}>{fact.text}</p>
      <button
        type="button"
        className={styles.factLink}
        onClick={() => {
          sfx.tap()
          haptic.tap()
          navigate(`/unit/${fact.unit.id}`)
        }}
        aria-label={`Tell me more. Opens the ${fact.unit.title} guidebook.`}
      >
        Tell me more
        <ChevronRight size={16} strokeWidth={3} aria-hidden />
      </button>
    </section>
  )
}

/* ---------------------------------------------------------------------------------- */

function LockedTier({ data, onBack }: { data: GameData; onBack: () => void }) {
  const basics = pathForTier(1)
  const pct = completion(data, basics)
  const doneCount = basics.filter((n) => isNodeDone(data, n)).length
  const name = getTier(1).name

  return (
    <motion.section
      className={styles.locked}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      aria-labelledby="locked-tier-title"
    >
      <h2 id="locked-tier-title" className={styles.lockedTitle}>
        <Lock size={18} strokeWidth={3} aria-hidden /> Finish {name} to unlock
      </h2>
      <p className={styles.lockedBody}>This level opens when every {name} lesson and quiz is done.</p>
      <div className={styles.lockedBar}>
        <ProgressBar value={pct} color="green" height={10} label={`${name} progress, ${toPct(pct)}%`} />
        <span className={styles.lockedCount}>
          {doneCount}/{basics.length}
        </span>
      </div>
      <Button color="green" size="md" onClick={onBack}>
        Back to {name}
      </Button>
    </motion.section>
  )
}

/* ---------------------------------------------------------------------------------- */

function TierDone({ tier, onNext }: { tier: TierId; onNext: () => void }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [scope, animate] = useAnimate<HTMLButtonElement>()
  const look = TIER_LOOK[tier]
  const nextReady = tier === 1 && pathForTier(2).length > 0

  const party = () => {
    if (!reduce && scope.current) void animate(scope.current, { rotate: [0, -14, 12, -8, 0], scale: [1, 1.2, 1] }, { duration: 0.55 })
    sfx.complete()
    haptic.celebrate()
    celebrate('small')
  }

  const title = tier === 1 ? `You finished ${getTier(1).name}!` : 'You finished the whole path!'
  const body =
    tier === 1
      ? nextReady
        ? `You completed every lesson and quiz. ${getTier(2).name} is open now.`
        : "You completed every lesson and quiz. The next level isn't ready yet."
      : 'You completed every lesson and quiz in both levels. Practice is still here for review.'

  return (
    <motion.section
      className={styles.done}
      style={colorVars(look.color)}
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      aria-labelledby="tier-done-title"
    >
      <button ref={scope} type="button" className={styles.trophy} onClick={party} aria-label="Celebrate" title="Celebrate">
        🏆
      </button>
      <h2 id="tier-done-title" className={styles.doneTitle}>
        {title}
      </h2>
      <p className={styles.doneBody}>{body}</p>
      <div className={styles.doneActions}>
        {nextReady ? (
          <Button
            color="purple"
            size="md"
            onClick={() => {
              onNext()
              window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
            }}
          >
            On to {getTier(2).name}
          </Button>
        ) : (
          <Button color={look.color} size="md" onClick={() => navigate('/practice')}>
            Practice
          </Button>
        )}
      </div>
    </motion.section>
  )
}
