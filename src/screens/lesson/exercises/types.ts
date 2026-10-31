/*
  The one interface every exercise component speaks.

  - The component owns its own picking/tapping state.
  - Whenever the answer changes it calls onAnswer(verdict), or onAnswer(null)
    if there's nothing to check yet. The player's Check button uses the latest one.
  - After Check, the player sets `checked` and the component shows what was
    right and wrong (and stops accepting input).
  - Matching has no Check: it calls onAutoFinish() once every pair is matched.
*/
import type { Exercise } from '../../../content/types'

export interface Verdict {
  correct: boolean
  /** The right answer in words, shown under "Correct answer:" after a miss. */
  answer: string
  /** Extra detail under the right answer (a scenario's best outcome). */
  answerDetail?: string
  /** Feedback about the specific pick (a choice's `why`, a scenario's outcome). */
  why?: string
  /** Heading for `why`, e.g. "What happened:". */
  whyLabel?: string
}

export interface MatchFinish {
  verdict: Verdict
  mismatches: number
}

export interface ExerciseProps<E extends Exercise = Exercise> {
  ex: E
  /** The answer has been checked: lock input and reveal right/wrong. */
  checked: boolean
  /** Number-key shortcuts are live (false while a dialog is open or after checking). */
  keysActive: boolean
  onAnswer: (v: Verdict | null) => void
  onAutoFinish?: (f: MatchFinish) => void
}

/** True if a keyboard event should be ignored by exercise shortcuts. */
export function ignoreKey(e: KeyboardEvent): boolean {
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return true
  const t = e.target as HTMLElement | null
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
}

/** Maps "1".."9" (top row or numpad) to an index, or -1. */
export function digitIndex(e: KeyboardEvent): number {
  const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code)
  if (m) return Number(m[1]) - 1
  return /^[1-9]$/.test(e.key) ? Number(e.key) - 1 : -1
}
