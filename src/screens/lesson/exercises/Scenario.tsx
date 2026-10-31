/* A little real-life story, then "what do you do?" */
import { useState } from 'react'
import type { ScenarioExercise } from '../../../content/types'
import { Inline, RichText } from '../../../components/RichText'
import { shuffle } from '../../../lib/random'
import { sfx } from '../../../lib/sound'
import { haptic } from '../../../lib/haptics'
import { ChoiceCard, stateFor, useNumberKeys } from './ChoiceCard'
import type { ExerciseProps } from './types'
import { DocCard } from './DocCard'
import styles from './ex.module.css'

export function Scenario({ ex, checked, keysActive, onAnswer }: ExerciseProps<ScenarioExercise>) {
  const [order] = useState(() => shuffle(ex.choices.map((_, i) => i)))
  const [picked, setPicked] = useState<number | null>(null)
  const best = ex.choices.find((c) => c.best)

  const pick = (ci: number) => {
    if (checked) return
    const c = ex.choices[ci]
    if (!c) return
    if (ci !== picked) {
      sfx.tap()
      haptic.tap()
    }
    setPicked(ci)
    const isBest = !!c.best
    onAnswer({
      correct: isBest,
      answer: best?.text ?? '',
      answerDetail: isBest ? undefined : best?.outcome,
      why: c.outcome,
      whyLabel: isBest ? undefined : 'What happened:',
    })
  }

  useNumberKeys(keysActive && !checked, order.length, (i) => pick(order[i]))

  return (
    <div className={styles.wrap}>
      {ex.doc && <DocCard doc={ex.doc} />}
      <div className={styles.story}>
        <div className={styles.avatar} aria-hidden>
          {ex.emoji || '🧑'}
        </div>
        <div className={styles.bubble}>
          <RichText text={ex.setup} />
        </div>
      </div>
      <h2 className={styles.prompt}>
        <Inline text={ex.question} />
      </h2>
      <ul className={styles.choices} aria-label="Choices">
        {order.map((ci, pos) => (
          <li key={ci}>
            <ChoiceCard index={pos} locked={checked} onPick={() => pick(ci)} state={stateFor({ checked, isPicked: picked === ci, isCorrect: !!ex.choices[ci].best })}>
              <Inline text={ex.choices[ci].text} />
            </ChoiceCard>
          </li>
        ))}
      </ul>
    </div>
  )
}
