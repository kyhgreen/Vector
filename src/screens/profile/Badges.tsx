/*
  Badge pieces shared by the profile preview and the full badges screen:
    <BadgeTile badge={b} data={data} onOpen={...} />          a list row
    <BadgeTile badge={b} data={data} onOpen={...} compact />  just the medal and name
    <BadgeSheet badge={openBadge} data={data} onClose={...} />
*/
import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { Sheet } from '../../components/Sheet'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ui'
import { CoinIcon } from '../../components/icons'
import { COINS } from '../../state/constants'
import type { Badge } from '../../state/badges'
import type { GameData } from '../../state/types'
import { number } from '../../lib/format'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { badgeAction, badgeProgress, earnedLine, isBadgeEarned, longDate, nudgeLine, shortDate } from './profileUtils'
import styles from './Badges.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

export const badgeVars = (b: Badge): CSSProperties =>
  ({ ['--c' as string]: `var(--c-${b.color})`, ['--cd' as string]: `var(--c-${b.color}-dark)`, ['--cs' as string]: `var(--c-${b.color}-soft)` }) as CSSProperties

/** Plays the right little sound for opening a badge. */
export function badgeOpenFeedback(earned: boolean) {
  if (earned) sfx.match()
  else sfx.tap()
  haptic.tap()
}

export function BadgeTile({ badge, data, onOpen, compact = false }: { badge: Badge; data: GameData; onOpen: (b: Badge) => void; compact?: boolean }) {
  const earned = isBadgeEarned(badge, data)
  const [cur, goal] = badgeProgress(badge, data)
  const date = shortDate(data.badges?.[badge.id])
  const label = earned ? `${badge.name}, earned${date ? ` ${date}` : ''}` : `${badge.name}, locked, ${cur} of ${goal}`

  return (
    <button
      type="button"
      className={cx(styles.tile, compact ? styles.compact : styles.row, earned ? styles.earned : styles.locked)}
      style={earned ? badgeVars(badge) : undefined}
      onClick={() => {
        badgeOpenFeedback(earned)
        onOpen(badge)
      }}
      aria-label={label}
    >
      <span className={styles.medal} aria-hidden>
        <span className={styles.medalEmoji}>{badge.emoji}</span>
      </span>
      {compact ? (
        <span className={styles.name}>{badge.name}</span>
      ) : (
        <span className={styles.body}>
          <span className={styles.name}>{badge.name}</span>
          {earned ? (
            <span className={styles.muted}>{date ? `Earned ${date}` : 'Earned'}</span>
          ) : (
            <>
              <span className={styles.muted}>{badge.description}</span>
              <span className={styles.progressRow}>
                <ProgressBar value={cur / goal} color={badge.color} height={10} label={`${badge.name} progress`} />
                <span className={styles.progressNum}>
                  {number(cur)}/{number(goal)}
                </span>
              </span>
            </>
          )}
        </span>
      )}
    </button>
  )
}

export function BadgeSheet({ badge, data, onClose }: { badge: Badge | null; data: GameData; onClose: () => void }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  // Keep showing the last badge while the sheet animates closed.
  const [shown, setShown] = useState<Badge | null>(badge)
  if (badge && badge !== shown) setShown(badge)
  const b = badge ?? shown

  return (
    <Sheet open={!!badge} onClose={onClose}>
      {b && <BadgeDetails b={b} data={data} reduce={!!reduce} onClose={onClose} onGo={(to) => {
        onClose()
        navigate(to)
      }} />}
    </Sheet>
  )
}

function BadgeDetails({ b, data, reduce, onClose, onGo }: { b: Badge; data: GameData; reduce: boolean; onClose: () => void; onGo: (to: string) => void }) {
  const earned = isBadgeEarned(b, data)
  const [cur, goal] = badgeProgress(b, data)
  const date = longDate(data.badges?.[b.id])
  const action = badgeAction(b.id)

  return (
    <div className={styles.sheet}>
      <motion.div
        className={cx(styles.bigMedal, earned ? styles.bigEarned : styles.bigLocked)}
        style={earned ? badgeVars(b) : undefined}
        initial={reduce ? false : { scale: 0.5, rotate: earned ? -14 : 0, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.05 }}
        aria-hidden
      >
        <span className={styles.bigEmoji}>{b.emoji}</span>
      </motion.div>

      <h2 className={styles.sheetTitle}>{b.name}</h2>
      <p className={styles.sheetDesc}>{b.description}</p>

      {earned ? (
        <>
          <p className={styles.sheetLine}>{earnedLine(b.id)}</p>
          <p className={styles.reward}>
            <CoinIcon size={18} /> {date ? `Earned ${date}, plus ${COINS.badge} coins` : `Earned, plus ${COINS.badge} coins`}
          </p>
          <Button color="green" onClick={onClose}>
            Done
          </Button>
        </>
      ) : (
        <>
          <div className={styles.sheetProgress}>
            <ProgressBar value={cur / goal} color={b.color} height={14} label={`${b.name} progress`} />
            <span className={styles.sheetProgressNum}>
              {number(cur)} of {number(goal)}
            </span>
          </div>
          <p className={styles.sheetLine}>{nudgeLine(cur, goal)}</p>
          <p className={styles.reward}>
            <CoinIcon size={18} /> Worth {COINS.badge} coins
          </p>
          <Button color="blue" onClick={() => onGo(action.to)}>
            {action.label}
          </Button>
        </>
      )}
    </div>
  )
}
