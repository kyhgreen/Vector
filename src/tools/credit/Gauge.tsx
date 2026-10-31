/*
  The semicircle score dial: five colored bands from 300 to 850 and a
  needle that eases over to the current score.
*/
import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BANDS, bandIndex, dialPos } from './model'
import styles from './Credit.module.css'

const CX = 130
const CY = 122
const R = 92
const STROKE = 20
const GAP = 0.006

/** Point on the arc at position t (0 = far left, 1 = far right). */
function pt(t: number, r = R) {
  const a = Math.PI - t * Math.PI
  return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) }
}

function arc(t0: number, t1: number) {
  const a = pt(t0)
  const b = pt(t1)
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${R} ${R} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}

const EDGES = [580, 670, 740, 800]

export function Gauge({ score }: { score: number }) {
  const reduce = useReducedMotion()
  const target = dialPos(score) * 180 - 90
  const [angle, setAngle] = useState(target)
  const last = useRef(target)
  const active = bandIndex(score)

  useEffect(() => {
    if (reduce) {
      last.current = target
      setAngle(target)
      return
    }
    const c = animate(last.current, target, {
      type: 'spring',
      stiffness: 120,
      damping: 18,
      onUpdate: (v) => {
        last.current = v
        setAngle(v)
      },
    })
    return () => c.stop()
  }, [target, reduce])

  const safeAngle = Number.isFinite(angle) ? Math.max(-96, Math.min(96, angle)) : 0

  return (
    <svg viewBox="0 0 260 140" className={styles.gauge} role="img" aria-label={`Credit score dial pointing at ${score}, which is ${BANDS[active].name}`}>
      <path d={arc(0, 1)} className={styles.gaugeTrack} strokeWidth={STROKE + 8} />
      {BANDS.map((b, i) => {
        const t0 = dialPos(b.min) + (i === 0 ? 0 : GAP)
        const t1 = i === BANDS.length - 1 ? 1 : dialPos(b.max + 1) - GAP
        return (
          <path
            key={b.id}
            d={arc(t0, t1)}
            stroke={`var(--c-${b.color})`}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap={i === 0 || i === BANDS.length - 1 ? 'round' : 'butt'}
            className={styles.gaugeBand}
            style={{ opacity: i === active ? 1 : 0.32 }}
          />
        )
      })}
      {EDGES.map((e) => {
        const p = pt(dialPos(e), R + STROKE / 2 + 9)
        return (
          <text key={e} x={p.x} y={p.y} className={styles.gaugeTick} textAnchor="middle" dominantBaseline="middle">
            {e}
          </text>
        )
      })}
      <text x={CX - R} y={CY + 18} className={styles.gaugeTick} textAnchor="middle">
        300
      </text>
      <text x={CX + R} y={CY + 18} className={styles.gaugeTick} textAnchor="middle">
        850
      </text>
      <g transform={`rotate(${safeAngle.toFixed(2)} ${CX} ${CY})`}>
        <path d={`M ${CX - 6} ${CY} L ${CX} ${CY - R + 16} L ${CX + 6} ${CY} Z`} className={styles.needle} />
      </g>
      <circle cx={CX} cy={CY} r={11} className={styles.hub} />
      <circle cx={CX} cy={CY} r={4} className={styles.hubDot} />
    </svg>
  )
}
