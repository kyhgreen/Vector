/*
  "Last 7 days": XP for the last 7 days as columns, straight on the page (no card). Today's column is the
  accent; the other days are a lighter step of the same hue. The daily goal
  is a thin reference line. Values show on today's column, and on any
  column you hover, focus, or tap.
*/
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../../components/Button'
import { XpIcon } from '../../components/icons'
import { useNow } from '../../state/hooks'
import { useGame } from '../../state/store'
import { dayKey, lastNDays, parseDay, type DayKey } from '../../lib/dates'
import { number } from '../../lib/format'
import { safeNum } from './profileUtils'
import styles from './WeekChart.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

/** Clean axis top so the middle tick is a round number too. */
function axisMax(raw: number): number {
  const v = Math.max(10, raw)
  const unit = v > 400 ? 100 : v > 200 ? 50 : v > 60 ? 10 : 5
  return Math.ceil(v / 2 / unit) * unit * 2
}

function dayName(key: DayKey, style: 'short' | 'long'): string {
  const d = parseDay(key)
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString('en-US', { weekday: style }) : ''
}

export function WeekChart() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const xpByDay = useGame((s) => s.xpByDay)
  const goal = safeNum(useGame((s) => s.settings.dailyGoal))
  const now = useNow(60_000)
  const today = dayKey(now)
  const days = lastNDays(7, today)
  const values = days.map((d) => Math.round(safeNum(xpByDay?.[d])))
  const total = values.reduce((a, b) => a + b, 0)
  const hits = goal > 0 ? values.filter((v) => v >= goal).length : 0
  const max = axisMax(Math.max(...values, goal))
  const ticks = [0, max / 2, max]
  const pct = (v: number) => Math.max(0, Math.min(100, (v / max) * 100))

  const [active, setActive] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Tapping anywhere outside the chart hides the tooltip (Safari never blurs buttons on tap).
  useEffect(() => {
    if (active === null) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setActive(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [active])

  const summary =
    total === 0
      ? 'No XP in the last 7 days.'
      : goal <= 0
        ? 'No daily goal set.'
        : hits === 7
          ? 'Goal hit all 7 days.'
          : hits === 0
            ? 'Goal hit 0 of 7 days.'
            : `Goal hit ${hits} of 7 days.`

  return (
    <section className={styles.wrap} aria-labelledby="week-chart-title" ref={rootRef}>
      <div className={styles.head}>
        <div className={styles.titles}>
          <h2 id="week-chart-title" className={styles.title}>
            Last 7 days
          </h2>
          <p className={styles.summary}>{summary}</p>
        </div>
        <div className={styles.total} aria-label={`${total} XP in the last 7 days`}>
          <XpIcon size={20} />
          {number(total)} <span className={styles.totalUnit}>XP</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.yAxis} aria-hidden>
          {ticks.map((t) => (
            <span key={t} className={styles.tick} style={{ bottom: `${pct(t)}%` }}>
              {number(t)}
            </span>
          ))}
        </div>

        <div className={styles.plotCol}>
          <div className={styles.plot}>
            {ticks.map((t) => (
              <span key={t} className={cx(styles.grid, t === 0 && styles.baseline)} style={{ bottom: `${pct(t)}%` }} aria-hidden />
            ))}
            {goal > 0 && <span className={styles.goalLine} style={{ bottom: `${pct(goal)}%` }} aria-hidden />}

            <div className={styles.cols}>
              {days.map((d, i) => {
                const v = values[i]
                const isToday = d === today
                const isActive = active === i
                const hit = goal > 0 && v >= goal
                const long = dayName(d, 'long')
                const label = `${isToday ? 'Today' : long}: ${v} XP${goal > 0 ? (hit ? ', goal hit' : `, ${goal - v} short of the goal`) : ''}`
                const align = i === 0 ? styles.tipLeft : i === days.length - 1 ? styles.tipRight : undefined
                // Tall bars: tuck the tooltip just under the cap so it never pokes out of the card.
                const tipPos = pct(v) > 55 ? { top: `calc(${100 - pct(v)}% + 8px)` } : { bottom: `calc(${pct(v)}% + 10px)` }
                return (
                  <button
                    key={d}
                    type="button"
                    className={cx(styles.col, isActive && styles.colActive)}
                    aria-label={label}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                    onPointerLeave={(e) => e.pointerType === 'mouse' && setActive((a) => (a === i ? null : a))}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive((a) => (a === i ? null : a))}
                    onClick={() => setActive(i)}
                  >
                    <motion.span
                      className={cx(styles.bar, isToday && styles.barToday, v === 0 && styles.barEmpty)}
                      initial={reduce ? false : { height: '0%' }}
                      animate={{ height: `${pct(v)}%` }}
                      transition={{ type: 'spring', stiffness: 170, damping: 18, delay: reduce ? 0 : 0.08 + i * 0.05 }}
                    />
                    {isActive ? (
                      <span className={cx(styles.tip, align)} style={tipPos} aria-hidden>
                        <span className={styles.tipDay}>{isToday ? 'Today' : dayName(d, 'short')}</span>
                        <span className={styles.tipXp}>{number(v)} XP</span>
                        {goal > 0 && (
                          <span className={styles.tipGoal}>{hit ? 'Goal hit' : `${number(goal - v)} ${isToday ? 'to go' : 'short'}`}</span>
                        )}
                      </span>
                    ) : (
                      isToday &&
                      v > 0 && (
                        <span className={styles.valueLabel} style={{ bottom: `calc(${pct(v)}% + 4px)` }} aria-hidden>
                          {number(v)}
                        </span>
                      )
                    )}
                  </button>
                )
              })}
            </div>

            {total === 0 && (
              <div className={styles.emptyOverlay}>
                <p className={styles.emptyText}>Finish a lesson to see your XP here.</p>
                <Button size="sm" color="green" block={false} onClick={() => navigate('/learn')}>
                  Start a lesson
                </Button>
              </div>
            )}
          </div>

          <div className={styles.xLabels} aria-hidden>
            {days.map((d) => (
              <span key={d} className={cx(styles.xLabel, d === today && styles.xToday)}>
                {d === today ? 'Today' : dayName(d, 'short')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {goal > 0 && (
        <div className={styles.key}>
          <span className={styles.keyLine} aria-hidden />
          <span>Goal: {number(goal)} XP a day</span>
        </div>
      )}
    </section>
  )
}
