/* Type a number. Big input, number pad on phones. */
import { useEffect, useId, useRef, useState } from 'react'
import type { NumberExercise } from '../../../content/types'
import { Inline } from '../../../components/RichText'
import { cx } from './ChoiceCard'
import { formatNumberAnswer } from './describe'
import type { ExerciseProps } from './types'
import { DocCard } from './DocCard'
import styles from './ex.module.css'

/** Accepts "1,200", "$40", "12.5", "-3". Returns null for anything that isn't a number. */
export function parseTyped(raw: string): number | null {
  const cleaned = raw.replace(/[\s,$%]/g, '')
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

/** Right if within the tolerance. Tiny float noise (0.1 + 0.2) always counts as equal. */
export function isCloseEnough(value: number, answer: number, tolerance = 0): boolean {
  return Math.abs(value - answer) <= Math.max(0, tolerance) + 1e-9
}

export function NumberEx({ ex, checked, onAnswer }: ExerciseProps<NumberExercise>) {
  const [raw, setRaw] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const helpId = useId()
  const value = parseTyped(raw)
  const bad = raw.trim() !== '' && value === null
  const right = checked && value !== null && isCloseEnough(value, ex.answer, ex.tolerance)

  // Desktop gets the cursor in the box right away. Phones wait for a tap so the keyboard doesn't jump out.
  useEffect(() => {
    if (window.matchMedia?.('(pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true })
  }, [])

  const change = (next: string) => {
    if (checked) return
    const cleaned = next.replace(/[^\d.,\-\s$%]/g, '').slice(0, 14)
    setRaw(cleaned)
    const n = parseTyped(cleaned)
    onAnswer(n === null ? null : { correct: isCloseEnough(n, ex.answer, ex.tolerance), answer: formatNumberAnswer(ex) })
  }

  return (
    <div className={styles.wrap}>
      {ex.doc && <DocCard doc={ex.doc} />}
      <h2 className={styles.prompt}>
        <Inline text={ex.prompt} />
      </h2>
      <label className={cx(styles.numBox, checked && (right ? styles.numRight : styles.numWrong))}>
        {ex.prefix && <span className={styles.numAffix}>{ex.prefix}</span>}
        <input
          ref={inputRef}
          className={styles.numInput}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          placeholder="0"
          value={raw}
          readOnly={checked}
          aria-label="Your answer"
          aria-describedby={helpId}
          aria-invalid={bad || undefined}
          onChange={(e) => change(e.target.value)}
        />
        {ex.suffix && <span className={styles.numAffix}>{ex.suffix}</span>}
      </label>
      <p id={helpId} className={cx(styles.numHelp, bad && styles.numHelpBad)}>
        {bad ? 'Enter numbers only.' : ' '}
      </p>
    </div>
  )
}
