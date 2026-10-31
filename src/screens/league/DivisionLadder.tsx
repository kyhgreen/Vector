/*
  The division ladder: every league as a little coin or bill in a sideways
  scrolling row. Leagues you've passed are in color, yours is bigger with a
  ring around it, and the ones above you are gray and locked. Tap one to read
  about it (plus a short fact about that coin or bill).
*/
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { useReducedMotion } from 'motion/react'
import { DIVISIONS } from '../../state/league'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { DivisionBadge } from './DivisionBadge'
import { cx } from './cx'
import styles from './DivisionLadder.module.css'

export function DivisionLadder({ current, onPick }: { current: number; onPick: (division: number) => void }) {
  const reduce = useReducedMotion()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Center your league in the row (sideways only, never yanks the page).
  useEffect(() => {
    const sc = scrollerRef.current
    const el = itemRefs.current[current]
    if (!sc || !el) return
    const left = el.offsetLeft - sc.clientWidth / 2 + el.offsetWidth / 2
    sc.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' })
  }, [current, reduce])

  const onKeyDown = (e: KeyboardEvent<HTMLOListElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return
    const idx = btnRefs.current.findIndex((b) => b === document.activeElement)
    if (idx < 0) return
    e.preventDefault()
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? DIVISIONS.length - 1 : Math.max(0, Math.min(DIVISIONS.length - 1, idx + (e.key === 'ArrowRight' ? 1 : -1)))
    btnRefs.current[next]?.focus()
    itemRefs.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <div className={styles.scroller} ref={scrollerRef}>
      <ol className={styles.track} onKeyDown={onKeyDown} aria-label="League ladder">
        {DIVISIONS.map((d, i) => {
          const state = i < current ? 'past' : i === current ? 'current' : 'future'
          return (
            <li
              key={d.name}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              className={cx(styles.item, i <= current && styles.reached, i < current && styles.cleared)}
            >
              <button
                ref={(el) => {
                  btnRefs.current[i] = el
                }}
                type="button"
                className={cx(styles.btn, styles[state])}
                aria-label={`${d.name} League${state === 'current' ? ', your league' : state === 'past' ? ', cleared' : ', locked'}`}
                aria-current={state === 'current' ? 'true' : undefined}
                onClick={() => {
                  sfx.tap()
                  haptic.tap()
                  onPick(i)
                }}
              >
                <span className={styles.slot}>
                  {state === 'current' ? (
                    <DivisionBadge division={i} size={50} className={styles.currentBadge} />
                  ) : (
                    <DivisionBadge division={i} size={36} locked={state === 'future'} />
                  )}
                </span>
                <span className={styles.name}>{d.name}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
