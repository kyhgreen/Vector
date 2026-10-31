/*
  The two small level tabs at the top of Learn. Arrow keys move between them.
*/
import { useRef, type KeyboardEvent } from 'react'
import { Lock, Check } from 'lucide-react'
import { TIERS, pathForTier } from '../../content'
import type { TierId } from '../../content/types'
import { ProgressBar } from '../../components/ui'
import { completion, isTierComplete, isTierUnlocked } from '../../state/progress'
import type { GameData } from '../../state/types'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { TIER_LOOK, colorVars, toPct } from './learnUtils'
import styles from './TierSwitcher.module.css'

export function TierSwitcher({ data, value, onChange }: { data: GameData; value: TierId; onChange: (t: TierId) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (t: TierId) => {
    if (t === value) return
    sfx.tap()
    haptic.tap()
    onChange(t)
  }

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + TIERS.length) % TIERS.length
    refs.current[next]?.focus()
    select(TIERS[next].id)
  }

  return (
    <div className={styles.tiers} role="tablist" aria-label="Pick a level">
      {TIERS.map((t, i) => {
        const look = TIER_LOOK[t.id]
        const unlocked = isTierUnlocked(data, t.id)
        const done = isTierComplete(data, t.id)
        const pct = completion(data, pathForTier(t.id))
        const selected = t.id === value
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={[styles.tier, selected && styles.selected].filter(Boolean).join(' ')}
            style={colorVars(look.color)}
            onClick={() => select(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            aria-label={`${t.name}, ${t.ages}, ${toPct(pct)}% done${unlocked ? '' : ', locked'}`}
          >
            <span className={styles.topRow}>
              <span className={styles.emoji} aria-hidden>
                {look.emoji}
              </span>
              <span className={styles.name}>{t.name}</span>
              {!unlocked && <Lock className={styles.mark} size={14} strokeWidth={3} aria-hidden />}
              {done && <Check className={styles.mark} size={16} strokeWidth={4} aria-hidden />}
            </span>
            <span className={styles.bar} aria-hidden>
              <ProgressBar value={pct} color={unlocked ? look.color : 'gray'} height={6} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
