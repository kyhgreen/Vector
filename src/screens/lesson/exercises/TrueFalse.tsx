/* True or false: one statement, two big buttons. */
import { useState } from 'react'
import type { TrueFalseExercise } from '../../../content/types'
import { Inline } from '../../../components/RichText'
import { sfx } from '../../../lib/sound'
import { haptic } from '../../../lib/haptics'
import { choiceClass, cx, stateFor, useNumberKeys } from './ChoiceCard'
import { FALSE_LABEL, TF_TITLE, TRUE_LABEL, answerOf } from './describe'
import type { ExerciseProps } from './types'
import { DocCard } from './DocCard'
import styles from './ex.module.css'

const OPTIONS = [
  { value: true, label: TRUE_LABEL },
  { value: false, label: FALSE_LABEL },
] as const

export function TrueFalse({ ex, checked, keysActive, onAnswer }: ExerciseProps<TrueFalseExercise>) {
  const [picked, setPicked] = useState<boolean | null>(null)

  const pick = (value: boolean) => {
    if (checked) return
    if (value !== picked) {
      sfx.tap()
      haptic.tap()
    }
    setPicked(value)
    onAnswer({ correct: value === ex.answer, answer: answerOf(ex) })
  }

  useNumberKeys(keysActive && !checked, 2, (i) => pick(OPTIONS[i].value))

  return (
    <div className={styles.wrap}>
      {ex.doc && <DocCard doc={ex.doc} />}
      <h2 className={styles.prompt}>{TF_TITLE}</h2>
      <blockquote className={styles.statement}>
        <Inline text={ex.statement} />
      </blockquote>
      <div className={styles.tfRow} role="group" aria-label="True or false">
        {OPTIONS.map((o, i) => {
          const state = stateFor({ checked, isPicked: picked === o.value, isCorrect: ex.answer === o.value })
          return (
            <button
              key={o.label}
              type="button"
              className={cx(styles.choice, styles.tfBtn, choiceClass(state))}
              onClick={() => pick(o.value)}
              disabled={checked}
              aria-pressed={state === 'selected'}
            >
              <span>{o.label}</span>
              {!checked && (
                <kbd className={styles.kbd} aria-hidden>
                  {i + 1}
                </kbd>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
