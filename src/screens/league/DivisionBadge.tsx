/*
  A league's badge: a chunky coin for the cents leagues (Penny to Half-Dollar)
  and a chunky bill for the dollar leagues (Dollar to Benjamin). The face value
  is printed on it, so each step up the ladder is a bigger coin or bill.
*/
import type { CSSProperties } from 'react'
import { Lock } from 'lucide-react'
import { DIVISIONS } from '../../state/league'
import { clampDivision, divisionGlyph, divisionShape } from './leagueCopy'
import { cx } from './cx'
import styles from './DivisionBadge.module.css'

/** CSS variables for a division's color: --dc (main), --dcd (3D edge), --dcs (soft tint). */
export function divisionVars(division: number): CSSProperties {
  const c = DIVISIONS[clampDivision(division)].color
  return {
    ['--dc' as string]: `var(--c-${c})`,
    ['--dcd' as string]: `var(--c-${c}-dark)`,
    ['--dcs' as string]: `var(--c-${c}-soft)`,
  } as CSSProperties
}

export function DivisionBadge({
  division,
  size = 56,
  locked = false,
  shine = false,
  className,
}: {
  division: number
  /** Height in px. Bills are 1.5x wider than they are tall. */
  size?: number
  /** Gray with a little padlock (a league you haven't reached yet). */
  locked?: boolean
  /** A glint that sweeps across the face every few seconds. */
  shine?: boolean
  className?: string
}) {
  const shape = divisionShape(division)
  const glyph = divisionGlyph(division)
  const width = shape === 'bill' ? Math.round(size * 1.5) : size
  const depth = Math.max(2, Math.round(size * 0.05))
  const ratio = shape === 'coin' ? (glyph.length >= 3 ? 0.3 : 0.36) : glyph.length >= 4 ? 0.32 : 0.38
  const lockSize = Math.max(18, Math.round(size * 0.42))

  return (
    <span
      className={cx(styles.badge, styles[shape], locked && styles.locked, shine && !locked && styles.shine, className)}
      style={{ ...divisionVars(division), width, height: size, fontSize: Math.round(size * ratio), ['--depth' as string]: `${depth}px` }}
      aria-hidden
    >
      <span className={styles.shineWrap} />
      <span className={styles.glyph}>{glyph}</span>
      {locked && (
        <span className={styles.lock} style={{ width: lockSize, height: lockSize }}>
          <Lock size={Math.round(lockSize * 0.55)} strokeWidth={3} />
        </span>
      )}
    </span>
  )
}
