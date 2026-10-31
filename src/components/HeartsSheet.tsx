/*
  Hearts info + refill options. Also used inside a lesson when you run out
  (pass `outOfHearts` to change the wording and offer "quit lesson").
*/
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useHearts } from '../state/hooks'
import { useGame } from '../state/store'
import { SHOP_ITEMS } from '../state/constants'
import { randomLine, OUT_OF_HEARTS_LINES } from '../lib/copy'
import { sfx } from '../lib/sound'
import { Button } from './Button'
import { Sheet } from './Sheet'
import { CoinIcon } from './icons'
import styles from './HeartsSheet.module.css'
import { useMemo } from 'react'

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function HeartsSheet({ open, onClose, outOfHearts, onQuit }: { open: boolean; onClose: () => void; outOfHearts?: boolean; onQuit?: () => void }) {
  const { hearts, max, nextInMs, unlimited } = useHearts()
  const coins = useGame((s) => s.coins)
  const buyItem = useGame((s) => s.buyItem)
  const navigate = useNavigate()
  const refill = SHOP_ITEMS.find((i) => i.id === 'heart-refill')!
  const line = useMemo(() => randomLine(OUT_OF_HEARTS_LINES), [])

  return (
    <Sheet open={open} onClose={onClose} title={outOfHearts ? 'Out of hearts' : unlimited ? 'Unlimited hearts' : 'Hearts'} dismissable={!outOfHearts}>
      <div className={styles.row} aria-label={`${hearts} of ${max} hearts`}>
        {Array.from({ length: max }, (_, i) => (
          <Heart key={i} size={36} strokeWidth={2.5} className={i < hearts ? styles.full : styles.empty} fill="currentColor" />
        ))}
      </div>
      <p className={styles.text}>
        {unlimited
          ? "Relaxed mode is on, so mistakes don't cost hearts."
          : outOfHearts
            ? line
            : hearts >= max
              ? 'Your hearts are full. Each mistake costs one.'
              : `Each mistake costs a heart. Next heart in ${mmss(nextInMs)}.`}
      </p>
      {!unlimited && hearts < max && (
        <>
          <Button
            color="red"
            disabled={coins < refill.price}
            onClick={() => {
              if (buyItem('heart-refill').ok) {
                sfx.coin()
                if (outOfHearts) onClose()
              }
            }}
            icon={<Heart size={20} fill="currentColor" />}
          >
            Refill for {refill.price} coins
          </Button>
          {coins < refill.price && (
            <p className={styles.hint}>
              <CoinIcon size={16} /> You have {Math.floor(coins)}. Finish lessons to earn more coins.
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => {
              onClose()
              navigate('/practice')
            }}
          >
            Practice for a heart
          </Button>
        </>
      )}
      {outOfHearts && onQuit && (
        <Button variant="ghost" color="gray" onClick={onQuit}>
          Quit lesson
        </Button>
      )}
    </Sheet>
  )
}
