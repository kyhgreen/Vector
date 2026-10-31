/* Streak details: this week's calendar, freezes, and what to do next. */
import { Flame, Snowflake } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useStreak } from '../state/hooks'
import { useGame } from '../state/store'
import { dayKey, lastNDays, shortWeekday } from '../lib/dates'
import { Button } from './Button'
import { Sheet } from './Sheet'
import styles from './StreakSheet.module.css'

export function StreakSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { count, status, freezes, longest } = useStreak()
  const xpByDay = useGame((s) => s.xpByDay)
  const frozen = useGame((s) => s.streak.frozenDays)
  const navigate = useNavigate()
  const today = dayKey()
  const days = lastNDays(7, today)

  const message =
    status === 'done-today'
      ? "You've finished a lesson today. Your streak is safe."
      : status === 'at-risk'
        ? count > 0
          ? `Finish a lesson today to keep your ${count}-day streak.`
          : 'Finish a lesson today to start a streak.'
        : 'Finish a lesson to start a new streak.'

  return (
    <Sheet open={open} onClose={onClose}>
      <div className={styles.hero}>
        <Flame size={64} strokeWidth={2} fill="currentColor" className={count > 0 ? styles.on : styles.off} />
        <div className={styles.count}>{count}</div>
        <div className={styles.label}>day streak</div>
      </div>
      <div className={styles.week}>
        {days.map((d) => {
          const did = (xpByDay[d] ?? 0) > 0
          const ice = frozen.includes(d)
          return (
            <div key={d} className={styles.day}>
              <span className={styles.dow}>{shortWeekday(d)}</span>
              <span className={[styles.dot, did && styles.dotOn, ice && styles.dotIce, d === today && styles.dotToday].filter(Boolean).join(' ')}>
                {ice ? <Snowflake size={14} strokeWidth={3} /> : did ? <Flame size={14} strokeWidth={3} fill="currentColor" /> : null}
              </span>
            </div>
          )
        })}
      </div>
      <p className={styles.msg}>{message}</p>
      <div className={styles.meta}>
        <span>
          <Snowflake size={16} strokeWidth={3} /> {freezes} streak freeze{freezes === 1 ? '' : 's'}
        </span>
        <span>
          Best: {longest} day{longest === 1 ? '' : 's'}
        </span>
      </div>
      {status !== 'done-today' && (
        <Button
          color="orange"
          onClick={() => {
            onClose()
            navigate('/learn')
          }}
        >
          Start a lesson
        </Button>
      )}
    </Sheet>
  )
}
