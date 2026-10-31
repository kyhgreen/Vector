/* The lesson's top strip: quit, the progress bar, and hearts (or the quiz counter). */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Dumbbell, Heart, Infinity as InfinityIcon, X } from 'lucide-react'
import { IconButton } from '../../components/Button'
import { useHearts } from '../../state/hooks'
import type { Mode } from './session'
import styles from './lesson.module.css'

export interface ComboPop {
  n: number
  tail: string
  id: number
}

export function TopBar({
  mode,
  progress,
  question,
  combo,
  onQuit,
}: {
  mode: Mode
  /** 0..1 */
  progress: number
  /** Quiz only: which question you're on. */
  question?: { n: number; total: number }
  combo: ComboPop | null
  onQuit: () => void
}) {
  const reduce = useReducedMotion()
  const pct = Math.round(Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0)) * 100)

  return (
    <header className={styles.top}>
      <div className={styles.topInner}>
        <IconButton label="Quit" onClick={onQuit} className={styles.quitBtn}>
          <X size={26} strokeWidth={3} />
        </IconButton>

        <div
          className={styles.track}
          role="progressbar"
          aria-label={mode === 'quiz' ? 'Quiz progress' : mode === 'practice' ? 'Practice progress' : 'Lesson progress'}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <motion.div
            className={styles.fill}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 19 }}
          >
            <span className={styles.fillShine} />
          </motion.div>
        </div>

        {mode === 'lesson' && <HeartsCount />}
        {mode === 'quiz' && question && (
          <span className={styles.counter}>
            <span aria-hidden>
              {question.n}
              <span className={styles.counterOf}>/{question.total}</span>
            </span>
            <span className="sr-only">
              Question {question.n} of {question.total}
            </span>
          </span>
        )}
        {mode === 'practice' && (
          <span className={styles.practiceTag} title="Practice never costs hearts">
            <Dumbbell size={20} strokeWidth={2.5} aria-hidden />
            <span>Practice</span>
          </span>
        )}
      </div>

      <div className={styles.comboSlot} aria-live="polite">
        <AnimatePresence>
          {combo && (
            <motion.div
              key={combo.id}
              className={styles.combo}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.8, rotate: -3 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: -1.5 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 480, damping: 18 }}
            >
              <span className={styles.comboMain}>{combo.n} in a row</span>
              <span className={styles.comboTail}>{combo.tail}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

/** Red heart + count. Lives in its own component so the 1-second refill timer only re-renders this bit. */
function HeartsCount() {
  const { hearts, unlimited } = useHearts()
  const reduce = useReducedMotion()
  return (
    <div className={styles.hearts} role="img" aria-label={unlimited ? 'Unlimited hearts' : `${hearts} ${hearts === 1 ? 'heart' : 'hearts'} left`}>
      <motion.span
        key={unlimited ? 'inf' : hearts}
        className={styles.heartIcon}
        initial={reduce ? false : { scale: 1.55, rotate: -14 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 11 }}
      >
        <Heart size={26} strokeWidth={2.5} fill="currentColor" />
      </motion.span>
      <span className={styles.heartNum}>{unlimited ? <InfinityIcon size={22} strokeWidth={3} /> : hearts}</span>
    </div>
  )
}
