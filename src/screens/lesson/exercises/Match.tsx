/*
  Tap a term, then tap its meaning. Right pairs lock in green, wrong pairs
  flash red and wiggle. Finishes by itself once everything is matched.
  Mismatches never cost hearts, but 2+ of them count as a miss for stats.
*/
import { useEffect, useRef, useState } from 'react'
import type { MatchExercise } from '../../../content/types'
import { Inline } from '../../../components/RichText'
import { shuffle } from '../../../lib/random'
import { sfx } from '../../../lib/sound'
import { haptic } from '../../../lib/haptics'
import { cx } from './ChoiceCard'
import { answerOf } from './describe'
import type { ExerciseProps } from './types'
import styles from './ex.module.css'

type Side = 'l' | 'r'

/** Shuffles, but never leaves the right column lined up with the left (that'd be too easy). */
function shuffledRight(n: number): number[] {
  const base = Array.from({ length: n }, (_, i) => i)
  if (n < 2) return base
  for (let tries = 0; tries < 8; tries++) {
    const s = shuffle(base)
    if (s.some((v, i) => v !== i)) return s
  }
  return [...base.slice(1), base[0]]
}

export function Match({ ex, checked, onAutoFinish }: ExerciseProps<MatchExercise>) {
  const n = ex.pairs.length
  const [rightOrder] = useState(() => shuffledRight(n))
  const [sel, setSel] = useState<{ side: Side; i: number } | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [just, setJust] = useState<number | null>(null)
  const [flash, setFlash] = useState<{ l: number; r: number; tick: number } | null>(null)
  const mismatches = useRef(0)
  const timers = useRef<number[]>([])
  const finished = useRef(false)

  useEffect(() => {
    const list = timers.current
    return () => list.forEach((t) => window.clearTimeout(t))
  }, [])
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const tryPair = (l: number, r: number) => {
    setSel(null)
    if (l === r) {
      const next = [...matched, l]
      setMatched(next)
      setJust(l)
      sfx.match()
      haptic.tap()
      later(() => setJust((j) => (j === l ? null : j)), 520)
      if (next.length >= n && !finished.current) {
        finished.current = true
        const misses = mismatches.current
        later(() => onAutoFinish?.({ mismatches: misses, verdict: { correct: misses < 2, answer: answerOf(ex) } }), 480)
      }
    } else {
      mismatches.current += 1
      const tick = Date.now()
      setFlash({ l, r, tick })
      sfx.wrong()
      haptic.wrong()
      later(() => setFlash((f) => (f && f.tick === tick ? null : f)), 560)
    }
  }

  const tap = (side: Side, i: number) => {
    if (checked || finished.current || matched.includes(i)) return
    if (!sel || sel.side === side) {
      sfx.tap()
      haptic.tap()
      setSel(sel && sel.side === side && sel.i === i ? null : { side, i })
      return
    }
    if (side === 'l') tryPair(i, sel.i)
    else tryPair(sel.i, i)
  }

  const tileClass = (side: Side, i: number) => {
    const isDone = matched.includes(i)
    const isFlash = flash && (side === 'l' ? flash.l === i : flash.r === i)
    return cx(
      styles.tile,
      isDone && (just === i ? styles.tileJustMatched : styles.tileDone),
      !isDone && isFlash && styles.tileFlashWrong,
      !isDone && !isFlash && sel?.side === side && sel.i === i && styles.selected,
    )
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.prompt}>
        <Inline text={ex.prompt} />
      </h2>
      <div className={styles.matchGrid} role="group" aria-label="Matching pairs">
        {ex.pairs.map((_, row) => {
          const li = row
          const ri = rightOrder[row]
          return [
            <button
              key={`l${li}`}
              type="button"
              className={tileClass('l', li)}
              onClick={() => tap('l', li)}
              disabled={checked}
              aria-disabled={matched.includes(li) || undefined}
              aria-pressed={sel?.side === 'l' && sel.i === li}
              aria-label={matched.includes(li) ? `${ex.pairs[li].left}, matched` : undefined}
            >
              {ex.pairs[li].left}
            </button>,
            <button
              key={`r${ri}`}
              type="button"
              className={tileClass('r', ri)}
              onClick={() => tap('r', ri)}
              disabled={checked}
              aria-disabled={matched.includes(ri) || undefined}
              aria-pressed={sel?.side === 'r' && sel.i === ri}
              aria-label={matched.includes(ri) ? `${ex.pairs[ri].right}, matched` : undefined}
            >
              {ex.pairs[ri].right}
            </button>,
          ]
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {matched.length} of {n} matched
      </p>
    </div>
  )
}
