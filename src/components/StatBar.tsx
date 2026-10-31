/*
  The streak / coins / hearts counters (top of Learn on phones, side rail on
  desktop). Tapping streak or hearts opens a sheet with details; tapping
  coins goes to the shop.
*/
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Flame, Heart, Infinity as InfinityIcon } from 'lucide-react'
import { useHearts, useStreak } from '../state/hooks'
import { useGame } from '../state/store'
import { number } from '../lib/format'
import { HeartsSheet } from './HeartsSheet'
import { StreakSheet } from './StreakSheet'
import { CoinIcon } from './icons'
import styles from './StatBar.module.css'

export function StatBar({ className }: { className?: string }) {
  const navigate = useNavigate()
  const streak = useStreak()
  const coins = useGame((s) => s.coins)
  const { hearts, unlimited } = useHearts()
  const [sheet, setSheet] = useState<'hearts' | 'streak' | null>(null)

  return (
    <>
      <div className={[styles.bar, className].filter(Boolean).join(' ')}>
        <button type="button" className={styles.stat} onClick={() => setSheet('streak')} aria-label={`${streak.count} day streak`}>
          <Flame size={24} strokeWidth={2.5} className={streak.status === 'done-today' ? styles.flameOn : styles.flameOff} fill="currentColor" />
          <span className={streak.status === 'done-today' ? styles.streakOn : styles.muted}>{streak.count}</span>
        </button>
        <button type="button" className={styles.stat} onClick={() => navigate('/shop')} aria-label={`${coins} coins`}>
          <CoinIcon size={24} />
          <span className={styles.coins}>{number(Math.floor(coins))}</span>
        </button>
        <button type="button" className={styles.stat} onClick={() => setSheet('hearts')} aria-label={unlimited ? 'Unlimited hearts' : `${hearts} hearts`}>
          <Heart size={24} strokeWidth={2.5} className={styles.heart} fill="currentColor" />
          <span className={styles.hearts}>{unlimited ? <InfinityIcon size={20} strokeWidth={3} /> : hearts}</span>
        </button>
      </div>
      <HeartsSheet open={sheet === 'hearts'} onClose={() => setSheet(null)} />
      <StreakSheet open={sheet === 'streak'} onClose={() => setSheet(null)} />
    </>
  )
}
