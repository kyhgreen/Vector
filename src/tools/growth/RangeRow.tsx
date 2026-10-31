/*
  A slider row: label, value, and a range input with - and + buttons on each
  side for fine tuning (thumbs are not precise instruments).
  Works on "stops", so the steps can be tiny down low and big up high.
*/
import { useId, type CSSProperties } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { ButtonColor } from '../../components/Button'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { nearestStop } from './logic'
import styles from './Growth.module.css'

export function RangeRow({
  label,
  values,
  value,
  onChange,
  format,
  sub,
  color = 'teal',
}: {
  label: string
  /** Every value the slider can land on, smallest first. */
  values: number[]
  value: number
  onChange: (v: number) => void
  format: (v: number) => string
  sub?: string | null
  color?: ButtonColor
}) {
  const id = useId()
  const last = values.length - 1
  const idx = nearestStop(values, value)
  const pct = last > 0 ? (idx / last) * 100 : 0
  const vars = {
    ['--c' as string]: `var(--c-${color})`,
    ['--cd' as string]: `var(--c-${color}-dark)`,
    ['--cs' as string]: `var(--c-${color}-soft)`,
    ['--pct' as string]: `${pct}%`,
  } as CSSProperties

  const go = (i: number) => {
    const next = Math.max(0, Math.min(last, i))
    if (next !== idx) onChange(values[next])
  }
  const nudge = (dir: 1 | -1) => {
    sfx.tap()
    haptic.tap()
    go(idx + dir)
  }

  return (
    <div className={styles.row} style={vars}>
      <div className={styles.rowTop}>
        <label htmlFor={id} className={styles.rowLabel}>
          {label}
        </label>
        <span className={styles.rowValue} aria-hidden>
          {format(value)}
        </span>
      </div>
      <div className={styles.rowControl}>
        <button type="button" className={styles.nudge} aria-label={`Less ${label.toLowerCase()}`} disabled={idx <= 0} onClick={() => nudge(-1)}>
          <Minus size={18} strokeWidth={3} aria-hidden />
        </button>
        <input
          id={id}
          type="range"
          className={styles.range}
          min={0}
          max={last}
          step={1}
          value={idx}
          aria-valuetext={format(value)}
          onChange={(e) => go(parseInt(e.target.value, 10) || 0)}
        />
        <button type="button" className={styles.nudge} aria-label={`More ${label.toLowerCase()}`} disabled={idx >= last} onClick={() => nudge(1)}>
          <Plus size={18} strokeWidth={3} aria-hidden />
        </button>
      </div>
      {sub && <span className={styles.rowSub}>{sub}</span>}
    </div>
  )
}
