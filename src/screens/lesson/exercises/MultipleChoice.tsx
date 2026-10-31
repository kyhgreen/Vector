import { useState } from 'react'
import type { MultipleChoiceExercise } from '../../../content/types'
import { Inline } from '../../../components/RichText'
import { shuffle } from '../../../lib/random'
import { sfx } from '../../../lib/sound'
import { haptic } from '../../../lib/haptics'
import { ChoiceCard, stateFor, useNumberKeys } from './ChoiceCard'
import type { ExerciseProps } from './types'
import { DocCard } from './DocCard'
import styles from './ex.module.css'

export function MultipleChoice({ ex, checked, keysActive, onAnswer }: ExerciseProps<MultipleChoiceExercise>) {
  // Shuffle once per appearance, so a re-asked question looks fresh.
  const [order] = useState(() => shuffle(ex.choices.map((_, i) => i)))
  const [picked, setPicked] = useState<number | null>(null)
  const correctText = ex.choices.find((c) => c.correct)?.text ?? ''

  const pick = (ci: number) => {
    if (checked) return
    const c = ex.choices[ci]
    if (!c) return
    if (ci !== picked) {
      sfx.tap()
      haptic.tap()
    }
    setPicked(ci)
    onAnswer({ correct: !!c.correct, answer: correctText, why: c.why })
  }

  useNumberKeys(keysActive && !checked, order.length, (i) => pick(order[i]))

  return (
    <div className={styles.wrap}>
      {ex.doc && <DocCard doc={ex.doc} />}
      <h2 className={styles.prompt}>
        <Inline text={ex.prompt} />
      </h2>
      <ul className={styles.choices} aria-label="Choices">
        {order.map((ci, pos) => (
          <li key={ci}>
            <ChoiceCard index={pos} locked={checked} onPick={() => pick(ci)} state={stateFor({ checked, isPicked: picked === ci, isCorrect: !!ex.choices[ci].correct })}>
              <Inline text={ex.choices[ci].text} />
            </ChoiceCard>
          </li>
        ))}
      </ul>
    </div>
  )
}
