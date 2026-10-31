/*
  Fill in the blank, Duolingo style. Tap a word tile to drop it into the next
  empty blank; tap a filled blank to send the word back. On desktop, number
  keys pick tiles and Backspace takes the last word back out.
*/
import { useEffect, useRef, useState } from 'react'
import type { FillExercise } from '../../../content/types'
import { Inline } from '../../../components/RichText'
import { shuffle } from '../../../lib/random'
import { sfx } from '../../../lib/sound'
import { haptic } from '../../../lib/haptics'
import { cx } from './ChoiceCard'
import { answerOf } from './describe'
import { digitIndex, ignoreKey, type ExerciseProps } from './types'
import { DocCard } from './DocCard'
import styles from './ex.module.css'

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')

export function Fill({ ex, checked, keysActive, onAnswer }: ExerciseProps<FillExercise>) {
  const parts = ex.sentence.split(/_{3,}/)
  const blanks = Math.max(0, parts.length - 1)
  const [bankOrder] = useState(() => shuffle(ex.bank.map((_, i) => i)))
  const [slots, setSlots] = useState<(number | null)[]>(() => Array.from({ length: blanks }, () => null))
  const slotsRef = useRef(slots)

  const update = (next: (number | null)[]) => {
    slotsRef.current = next
    setSlots(next)
    if (next.some((s) => s === null)) {
      onAnswer(null)
      return
    }
    const correct = next.every((bi, si) => norm(ex.bank[bi as number] ?? '') === norm(ex.answers[si] ?? ''))
    onAnswer({ correct, answer: answerOf(ex) })
  }

  const placeTile = (bi: number) => {
    if (checked) return
    const cur = slotsRef.current
    if (cur.includes(bi)) {
      // Tapping a used tile pulls it back out, which is what people expect.
      update(cur.map((s) => (s === bi ? null : s)))
    } else {
      const empty = cur.indexOf(null)
      if (empty < 0) return
      const next = [...cur]
      next[empty] = bi
      update(next)
    }
    sfx.tap()
    haptic.tap()
  }

  const clearSlot = (si: number) => {
    if (checked || slotsRef.current[si] === null) return
    const next = [...slotsRef.current]
    next[si] = null
    update(next)
    sfx.tap()
    haptic.tap()
  }

  const keyRef = useRef({ placeTile, clearSlot, bankOrder })
  useEffect(() => {
    keyRef.current = { placeTile, clearSlot, bankOrder }
  })
  useEffect(() => {
    if (!keysActive || checked) return
    const onKey = (e: KeyboardEvent) => {
      if (ignoreKey(e)) return
      const { placeTile: pickTile, clearSlot: clear, bankOrder: bo } = keyRef.current
      if (e.key === 'Backspace') {
        const cur = slotsRef.current
        for (let si = cur.length - 1; si >= 0; si--) {
          if (cur[si] !== null) {
            e.preventDefault()
            clear(si)
            return
          }
        }
        return
      }
      const i = digitIndex(e)
      if (i >= 0 && i < bo.length) {
        e.preventDefault()
        pickTile(bo[i])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keysActive, checked])

  const nextEmpty = slots.indexOf(null)

  return (
    <div className={styles.wrap}>
      {ex.doc && <DocCard doc={ex.doc} />}
      <h2 className={styles.prompt}>
        <Inline text={ex.prompt || 'Fill in the blank.'} />
      </h2>
      <p className={styles.sentence}>
        {parts.map((text, pi) => (
          <span key={pi}>
            <Inline text={text} />
            {pi < blanks && (
              <button
                type="button"
                className={cx(
                  styles.slot,
                  slots[pi] !== null && styles.slotFilled,
                  !checked && pi === nextEmpty && styles.slotNext,
                  checked && slots[pi] !== null && (norm(ex.bank[slots[pi] as number]) === norm(ex.answers[pi] ?? '') ? styles.slotRight : styles.slotWrong),
                )}
                onClick={() => clearSlot(pi)}
                disabled={checked || slots[pi] === null}
                aria-label={slots[pi] === null ? `Blank ${pi + 1}, empty` : `Blank ${pi + 1}: ${ex.bank[slots[pi] as number]}. Tap to remove.`}
              >
                {slots[pi] === null ? ' ' : ex.bank[slots[pi] as number]}
              </button>
            )}
          </span>
        ))}
      </p>
      <div className={styles.bank} role="group" aria-label="Word bank">
        {bankOrder.map((bi, pos) => {
          const used = slots.includes(bi)
          return (
            <button
              key={bi}
              type="button"
              className={cx(styles.tile, styles.bankTile, used && styles.bankUsed)}
              onClick={() => placeTile(bi)}
              disabled={checked}
              aria-label={used ? `${ex.bank[bi]}, used. Tap to take it back.` : ex.bank[bi]}
            >
              {ex.bank[bi]}
              {!checked && pos < 9 && (
                <kbd className={styles.kbd} aria-hidden>
                  {pos + 1}
                </kbd>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
