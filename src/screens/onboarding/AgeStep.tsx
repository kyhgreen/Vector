/* Step 2: "How old are you?" Picks the player's starting level. */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { getTier, tierForAge } from '../../content'
import { StepHeader } from './StepHeader'
import styles from './Steps.module.css'

export const AGES = [11, 12, 13, 14, 15, 16, 17, 18] as const

interface Props {
  age: number | null
  grownUp: boolean
  onPick: (age: number) => void
  onGrownUp: () => void
}

export function AgeStep({ age, grownUp, onPick, onGrownUp }: Props) {
  return (
    <div className={styles.root}>
      <StepHeader title="How old are you?" sub="This sets your starting level." />

      <div className={styles.ageGrid} role="group" aria-label="Your age">
        {AGES.map((a) => {
          const on = !grownUp && age === a
          return (
            <button
              key={a}
              type="button"
              data-choice
              aria-pressed={on}
              className={`${styles.tile} ${styles.ageTile} ${on ? styles.tileOn : ''}`}
              onClick={() => onPick(a)}
            >
              {a}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        data-choice
        aria-pressed={grownUp}
        className={`${styles.tile} ${styles.grownTile} ${grownUp ? styles.tileOn : ''}`}
        onClick={onGrownUp}
      >
        I'm a grown-up, just browsing
      </button>

      <div aria-live="polite">
        <TierPreview age={age} grownUp={grownUp} />
      </div>
    </div>
  )
}

function TierPreview({ age, grownUp }: { age: number | null; grownUp: boolean }) {
  const reduce = useReducedMotion()
  const tier = age === null ? null : getTier(tierForAge(age))
  const note = grownUp
    ? 'You can unlock every lesson on the last step.'
    : tier?.id === 1
      ? 'Finish early and you can jump ahead.'
      : 'Money Basics is still open if you want a review.'

  return (
    <AnimatePresence mode="wait" initial={false}>
      {tier && (
        <motion.div
          key={grownUp ? 'adult' : `t${tier.id}`}
          className={styles.tierLine}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.18 }}
        >
          <p>
            You'll start in <strong>{tier.name}</strong>.
          </p>
          <p className={styles.muted}>{note}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
