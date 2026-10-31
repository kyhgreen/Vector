/* A big pressable answer card plus the number-key shortcut hook. */
import { useEffect, useRef, type ReactNode } from 'react'
import { CheckIcon, XIcon } from 'lucide-react'
import { digitIndex, ignoreKey } from './types'
import styles from './ex.module.css'

export type ChoiceState = 'idle' | 'selected' | 'right' | 'wrong' | 'dim'

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

export function choiceClass(state: ChoiceState): string {
  return cx(
    state === 'selected' && styles.selected,
    state === 'right' && cx(styles.right, styles.checkedRight),
    state === 'wrong' && styles.wrong,
    state === 'dim' && styles.dim,
  )
}

export function ChoiceCard({
  index,
  state,
  locked,
  onPick,
  children,
}: {
  index: number
  state: ChoiceState
  locked: boolean
  onPick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={cx(styles.choice, choiceClass(state))}
      onClick={onPick}
      disabled={locked}
      aria-pressed={state === 'selected'}
      data-choice={index}
    >
      {/* The number doubles as the keyboard shortcut, like Duolingo on the web. */}
      <span className={styles.key} aria-hidden>
        {state === 'right' ? <CheckIcon size={16} strokeWidth={3.5} /> : state === 'wrong' ? <XIcon size={16} strokeWidth={3.5} /> : index + 1}
      </span>
      <span className={styles.choiceText}>{children}</span>
    </button>
  )
}

/** Number keys 1..count call onPick(index) while `active`. */
export function useNumberKeys(active: boolean, count: number, onPick: (index: number) => void) {
  const pickRef = useRef(onPick)
  useEffect(() => {
    pickRef.current = onPick
  })
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (ignoreKey(e)) return
      const i = digitIndex(e)
      if (i < 0 || i >= count) return
      e.preventDefault()
      pickRef.current(i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, count])
}

/** Visual state for a choice after (or before) checking. */
export function stateFor(opts: { checked: boolean; isPicked: boolean; isCorrect: boolean }): ChoiceState {
  const { checked, isPicked, isCorrect } = opts
  if (!checked) return isPicked ? 'selected' : 'idle'
  if (isCorrect) return 'right'
  if (isPicked) return 'wrong'
  return 'dim'
}
