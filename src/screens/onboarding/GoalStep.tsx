/* Step 4: pick a daily XP goal. Number keys 1 to 4 work on a keyboard. */
import { DAILY_GOALS } from '../../state/constants'
import { goalMinutes } from './copy'
import { StepHeader } from './StepHeader'
import styles from './Steps.module.css'

export function GoalStep({ goal, onGoal }: { goal: number; onGoal: (xp: number) => void }) {
  return (
    <div className={styles.root}>
      <StepHeader title="Pick a daily goal" sub="You can change it later." />

      <div className={styles.goals} role="group" aria-label="Daily goal">
        {DAILY_GOALS.map((g) => {
          const on = g.xp === goal
          return (
            <button
              key={g.xp}
              type="button"
              data-choice
              aria-pressed={on}
              className={`${styles.tile} ${styles.goal} ${on ? styles.tileOn : ''}`}
              onClick={() => onGoal(g.xp)}
            >
              <span className={styles.goalLabel}>{g.label}</span>
              <span className={styles.goalMeta}>
                {g.xp} XP, about {goalMinutes(g.xp)} min
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
