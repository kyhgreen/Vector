/*
  Sort chips into buckets. Tap a chip, then tap a bucket (or drag it there).
  Tap a placed chip to send it back. Number keys drop the selected chip into
  bucket 1, 2, or 3 on desktop. The blue dashed buckets say "tap me" well
  enough, so there's no instruction text.
*/
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import type { SortExercise } from '../../../content/types'
import { Inline } from '../../../components/RichText'
import { shuffle } from '../../../lib/random'
import { sfx } from '../../../lib/sound'
import { haptic } from '../../../lib/haptics'
import { cx, useNumberKeys } from './ChoiceCard'
import { answerOf } from './describe'
import type { ExerciseProps } from './types'
import styles from './ex.module.css'

type Target = number | 'pool' | null

interface DragInfo {
  i: number
  pid: number
  x0: number
  y0: number
  dx: number
  dy: number
  w: number
  moved: boolean
}

function targetAt(x: number, y: number): Target {
  const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop]')
  if (!el) return null
  const v = el.dataset.drop
  if (v === 'pool') return 'pool'
  const n = Number(v)
  return Number.isInteger(n) ? n : null
}

export function Sort({ ex, checked, keysActive, onAnswer }: ExerciseProps<SortExercise>) {
  const [order] = useState(() => shuffle(ex.items.map((_, i) => i)))
  const [place, setPlace] = useState<(number | null)[]>(() => ex.items.map(() => null))
  const [sel, setSel] = useState<number | null>(null)
  const [ghost, setGhost] = useState<{ i: number; x: number; y: number; w: number } | null>(null)
  const [hover, setHover] = useState<Target>(null)
  const placeRef = useRef(place)
  const dragRef = useRef<DragInfo | null>(null)
  const suppressClick = useRef(false)

  useEffect(() => {
    placeRef.current = place
  }, [place])

  const report = (next: (number | null)[]) => {
    if (next.some((p) => p === null)) {
      onAnswer(null)
      return
    }
    const wrong = ex.items.filter((it, i) => next[i] !== it.bucket)
    onAnswer({
      correct: wrong.length === 0,
      answer: wrong.length ? wrong.map((it) => `"${it.text}" goes in ${ex.buckets[it.bucket] ?? '?'}.`).join(' ') : answerOf(ex),
    })
  }

  const move = (i: number, bucket: number | null) => {
    if (checked) return
    const next = [...placeRef.current]
    if (next[i] === bucket) return
    next[i] = bucket
    placeRef.current = next
    setPlace(next)
    report(next)
    sfx.tap()
    haptic.tap()
  }

  const dropSelected = (bucket: number) => {
    if (sel === null) return
    move(sel, bucket)
    setSel(null)
  }

  useNumberKeys(keysActive && !checked && sel !== null, ex.buckets.length, dropSelected)

  /* ---- pointer dragging (tap still works without it) ---- */
  const onPointerDown = (e: RPointerEvent<HTMLButtonElement>, i: number) => {
    if (checked || (e.pointerType === 'mouse' && e.button !== 0)) return
    const r = e.currentTarget.getBoundingClientRect()
    dragRef.current = { i, pid: e.pointerId, x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, moved: false }
  }
  const onPointerMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current
    if (!d || d.pid !== e.pointerId) return
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 8) return
      d.moved = true
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* not supported: dragging still works while the pointer stays on the chip */
      }
      setSel(null)
    }
    setGhost({ i: d.i, x: e.clientX - d.dx, y: e.clientY - d.dy, w: d.w })
    setHover(targetAt(e.clientX, e.clientY))
  }
  const endDrag = (e: RPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = dragRef.current
    if (!d || d.pid !== e.pointerId) return
    dragRef.current = null
    if (!d.moved) return
    suppressClick.current = true
    window.setTimeout(() => (suppressClick.current = false), 0)
    setGhost(null)
    setHover(null)
    if (cancelled) return
    const t = targetAt(e.clientX, e.clientY)
    if (t === 'pool') move(d.i, null)
    else if (typeof t === 'number') move(d.i, t)
  }

  const chipProps = (i: number) => ({
    onPointerDown: (e: RPointerEvent<HTMLButtonElement>) => onPointerDown(e, i),
    onPointerMove,
    onPointerUp: (e: RPointerEvent<HTMLButtonElement>) => endDrag(e, false),
    onPointerCancel: (e: RPointerEvent<HTMLButtonElement>) => endDrag(e, true),
  })

  const tapPoolChip = (i: number) => {
    if (suppressClick.current || checked) return
    sfx.tap()
    haptic.tap()
    setSel((s) => (s === i ? null : i))
  }
  const tapPlacedChip = (i: number) => {
    if (suppressClick.current || checked) return
    move(i, null)
    setSel(null)
  }

  const pool = order.filter((i) => place[i] === null)
  const three = ex.buckets.length >= 3

  return (
    <div className={styles.wrap}>
      <h2 className={styles.prompt}>
        <Inline text={ex.prompt} />
      </h2>
      {!checked && (
        <div className={cx(styles.pool, pool.length === 0 && styles.poolEmpty, hover === 'pool' && styles.poolHover)} data-drop="pool" aria-label="Chips to sort">
          {pool.length === 0 ? (
            <span>All sorted.</span>
          ) : (
            pool.map((i) => (
              <button
                key={i}
                type="button"
                className={cx(styles.chip, sel === i && styles.chipSelected, ghost?.i === i && styles.chipDragging)}
                aria-pressed={sel === i}
                onClick={() => tapPoolChip(i)}
                {...chipProps(i)}
              >
                {ex.items[i].text}
              </button>
            ))
          )}
        </div>
      )}

      <div className={cx(styles.buckets, three && styles.buckets3)}>
        {ex.buckets.map((name, b) => {
          const inside = order.filter((i) => place[i] === b)
          return (
            <div
              key={b}
              data-drop={b}
              className={cx(
                styles.bucket,
                !checked && sel !== null && styles.bucketTarget,
                hover === b && styles.bucketHover,
                checked && styles.bucketLocked,
              )}
              onClick={() => !checked && dropSelected(b)}
            >
              <button type="button" className={styles.bucketHead} disabled={checked} aria-label={sel !== null ? `Put it in ${name}` : `${name}, ${inside.length} inside`}>
                {name}
              </button>
              <div className={styles.bucketBody}>
                {inside.length === 0 && sel !== null && <span className={styles.bucketHint}>Drop it here</span>}
                {inside.map((i) => {
                  const item = ex.items[i]
                  const ok = item.bucket === b
                  return (
                    <button
                      key={i}
                      type="button"
                      className={cx(styles.chip, checked && (ok ? styles.chipRight : styles.chipWrong), ghost?.i === i && styles.chipDragging)}
                      onClick={(e) => {
                        e.stopPropagation()
                        tapPlacedChip(i)
                      }}
                      disabled={checked}
                      aria-label={checked ? `${item.text}, ${ok ? 'right' : `wrong, goes in ${ex.buckets[item.bucket]}`}` : `${item.text}, in ${name}. Tap to take it out.`}
                      {...chipProps(i)}
                    >
                      <span>{item.text}</span>
                      {checked && !ok && <span className={styles.chipFix}>Goes in {ex.buckets[item.bucket]}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {ghost &&
        createPortal(
          <div className={cx(styles.chip, styles.ghost)} style={{ left: ghost.x, top: ghost.y, width: ghost.w }} aria-hidden>
            {ex.items[ghost.i]?.text}
          </div>,
          document.body,
        )}
    </div>
  )
}
