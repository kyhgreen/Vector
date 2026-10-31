/*
  Lightweight SVG charts. No chart library needed.

  <LineChart
    xLabels={['Now', '1y', '2y']}
    series={[{ name: 'You put in', values: [0, 100, 200] }, { name: 'Interest', values: [0, 5, 20], area: true }]}
    format={money}
  />

  <DonutChart segments={[{ name: 'Needs', value: 500 }, { name: 'Wants', value: 300 }]} center="$800" />

  Colors come from --chart-1..4 in fixed order (series 1 = slot 1, and so
  on), validated for color-blind readers. Max 4 series per chart.
  Hover (or drag a finger) to see values. A legend shows for 2+ series.
*/
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { moneyShort } from '../lib/format'
import styles from './Charts.module.css'

export interface Series {
  name: string
  values: number[]
  /** Fill a light wash under the line. */
  area?: boolean
  /** Override the color slot (1-4). Defaults to position in the list. */
  slot?: 1 | 2 | 3 | 4
  dashed?: boolean
}

const slotColor = (s: Series, i: number) => `var(--chart-${s.slot ?? Math.min(4, i + 1)})`

function niceMax(v: number): number {
  if (v <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(v)))
  const f = v / exp
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return nice * exp
}

function niceMin(v: number): number {
  return v >= 0 ? 0 : -niceMax(-v)
}

export function LineChart({
  series,
  xLabels,
  format = moneyShort,
  tooltipFormat,
  height = 220,
  yMin,
  ariaLabel,
}: {
  series: Series[]
  xLabels: string[]
  /** Formats axis tick values. */
  format?: (n: number) => string
  /** Formats tooltip values (defaults to `format`). */
  tooltipFormat?: (n: number) => string
  height?: number
  yMin?: number
  ariaLabel?: string
}) {
  const W = 340
  const H = height
  const pad = { l: 44, r: 12, t: 12, b: 26 }
  const n = Math.max(...series.map((s) => s.values.length), 1)
  const all = series.flatMap((s) => s.values).filter(Number.isFinite)
  const max = niceMax(Math.max(...all, 0))
  const min = yMin ?? niceMin(Math.min(...all, 0))
  const x = (i: number) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * (W - pad.l - pad.r))
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min || 1)) * (H - pad.t - pad.b)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * (max - min))
  const [hover, setHover] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tf = tooltipFormat ?? format

  const labelEvery = Math.max(1, Math.ceil(n / 6))

  const onMove = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = ((clientX - rect.left) / rect.width) * W
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }

  return (
    <figure className={styles.figure}>
      {series.length > 1 && <Legend items={series.map((s, i) => ({ name: s.name, color: slotColor(s, i), kind: 'line' as const }))} />}
      <div className={styles.plot}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={styles.svg}
          role="img"
          aria-label={ariaLabel ?? series.map((s) => s.name).join(', ')}
          onPointerMove={(e) => onMove(e.clientX)}
          onPointerDown={(e) => onMove(e.clientX)}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth={1} />
              <text x={pad.l - 6} y={y(t) + 4} className={styles.tick} textAnchor="end">
                {format(t)}
              </text>
            </g>
          ))}
          {xLabels.map((l, i) =>
            // Every Nth label plus the last one, but skip an Nth label that would crowd the last.
            (i % labelEvery === 0 && n - 1 - i >= Math.max(1, labelEvery * 0.6)) || i === n - 1 ? (
              <text key={i} x={x(i)} y={H - 6} className={styles.tick} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
                {l}
              </text>
            ) : null,
          )}
          {series.map((s, si) => {
            const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
            const color = slotColor(s, si)
            return (
              <g key={s.name}>
                {s.area && s.values.length > 1 && (
                  <polygon points={`${x(0)},${y(Math.max(min, 0))} ${pts} ${x(s.values.length - 1)},${y(Math.max(min, 0))}`} fill={color} opacity={0.12} />
                )}
                <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? '6 5' : undefined} />
                {s.values.length > 0 && (
                  <circle cx={x(s.values.length - 1)} cy={y(s.values[s.values.length - 1])} r={4.5} fill={color} stroke="var(--surface)" strokeWidth={2} />
                )}
              </g>
            )
          })}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--chart-axis)" strokeWidth={1} />
              {series.map((s, si) =>
                Number.isFinite(s.values[hover]) ? (
                  <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r={5} fill={slotColor(s, si)} stroke="var(--surface)" strokeWidth={2} />
                ) : null,
              )}
            </g>
          )}
        </svg>
        {hover !== null && (
          <div className={styles.tooltip} style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? '-105%' : '5%'})` }}>
            <div className={styles.ttTitle}>{xLabels[hover]}</div>
            {series.map((s, si) =>
              Number.isFinite(s.values[hover]) ? (
                <div key={s.name} className={styles.ttRow}>
                  <span className={styles.ttKey} style={{ background: slotColor(s, si) }} />
                  <strong>{tf(s.values[hover])}</strong>
                  <span className={styles.ttName}>{s.name}</span>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>
    </figure>
  )
}

export interface Segment {
  name: string
  value: number
  /** Override the color slot (1-4), or pass any CSS color. */
  color?: string
}

export function DonutChart({ segments, center, sub, size = 200, format = moneyShort }: { segments: Segment[]; center?: ReactNode; sub?: ReactNode; size?: number; format?: (n: number) => string }) {
  const total = segments.reduce((a, s) => a + Math.max(0, s.value), 0)
  const r = size / 2 - 14
  const stroke = 26
  const c = 2 * Math.PI * r
  const gap = total > 0 && segments.filter((s) => s.value > 0).length > 1 ? 3 : 0
  const [hover, setHover] = useState<number | null>(null)
  const arcs = useMemo(() => {
    let acc = 0
    return segments.map((s, i) => {
      const frac = total ? Math.max(0, s.value) / total : 0
      const len = Math.max(0, frac * c - gap)
      const arc = { i, len, offset: -acc * c, color: s.color ?? `var(--chart-${Math.min(4, i + 1)})` }
      acc += frac
      return arc
    })
  }, [segments, total, c, gap])

  return (
    <figure className={styles.figure}>
      <div className={styles.donutWrap} style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={segments.map((s) => `${s.name} ${format(s.value)}`).join(', ')}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
          {arcs.map((a) =>
            a.len > 0 ? (
              <circle
                key={a.i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={a.color}
                strokeWidth={hover === a.i ? stroke + 6 : stroke}
                strokeDasharray={`${a.len} ${c - a.len}`}
                strokeDashoffset={a.offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dasharray 0.5s var(--ease-out), stroke-width 0.15s' }}
                onPointerEnter={() => setHover(a.i)}
                onPointerLeave={() => setHover(null)}
              />
            ) : null,
          )}
        </svg>
        <div className={styles.donutCenter}>
          {hover !== null ? (
            <>
              <strong className={styles.donutValue}>{format(segments[hover].value)}</strong>
              <span className={styles.donutSub}>{segments[hover].name}</span>
            </>
          ) : (
            <>
              {center && <strong className={styles.donutValue}>{center}</strong>}
              {sub && <span className={styles.donutSub}>{sub}</span>}
            </>
          )}
        </div>
      </div>
      <Legend items={segments.map((s, i) => ({ name: `${s.name} · ${format(s.value)}`, color: s.color ?? `var(--chart-${Math.min(4, i + 1)})`, kind: 'box' as const }))} />
    </figure>
  )
}

export function Legend({ items }: { items: { name: string; color: string; kind: 'line' | 'box' }[] }) {
  return (
    <div className={styles.legend}>
      {items.map((it) => (
        <span key={it.name} className={styles.legendItem}>
          <span className={it.kind === 'line' ? styles.keyLine : styles.keyBox} style={{ background: it.color }} />
          {it.name}
        </span>
      ))}
    </div>
  )
}
