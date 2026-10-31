/* Skip-ahead buttons plus a one-line recap of what just happened. */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Button } from '../../components/Button'
import { plural } from '../../lib/format'
import type { Recap } from './lessons'
import { CardHead, Change, cx } from './parts'
import { MAX_DAY, type InvestState } from './sim'
import styles from './Invest.module.css'

export const JUMPS: { days: number; label: string }[] = [
  { days: 1, label: 'Next day' },
  { days: 7, label: '+1 week' },
  { days: 30, label: '+1 month' },
  { days: 365, label: '+1 year' },
]

export function TimeMachine({ s, recap, onJump, onNews }: { s: InvestState; recap: Recap | null; onJump: (days: number) => void; onNews: () => void }) {
  const reduce = useReducedMotion()
  const done = s.day >= MAX_DAY

  return (
    <section className={styles.section}>
      <CardHead title="Skip ahead" />

      <div className={styles.jumpGrid}>
        {JUMPS.map((j, i) => (
          <Button key={j.days} color="blue" size="md" disabled={done} onClick={() => onJump(j.days)} aria-keyshortcuts={String(i + 1)} className={styles.jumpBtn}>
            {j.label}
            <kbd className={styles.kbd} aria-hidden>
              {i + 1}
            </kbd>
          </Button>
        ))}
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {recap && (
          <motion.div
            key={s.day}
            className={cx(styles.recap, styles[`recap_${recap.mood}`])}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-live="polite"
          >
            <span className={styles.recapEmoji} aria-hidden>
              {recap.emoji}
            </span>
            <div className={styles.recapMain}>
              <p className={styles.recapText}>
                {recap.text} {recap.mood !== 'flat' && <Change value={recap.pct} />}
              </p>
              {recap.headlines > 0 && (
                <button type="button" className={styles.linkBtn} onClick={onNews}>
                  {plural(recap.headlines, 'new headline')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {done && <p className={styles.done}>You've reached the 50-year limit. Start over below to play again.</p>}
    </section>
  )
}
