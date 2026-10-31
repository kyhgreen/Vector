/*
  The leaderboard. Colored circles for the top 3, your row in green, and
  lines that mark where the promotion and demotion zones start. Rows slide
  into their new spots when rivals pass each other (or when you pass them).
*/
import { Fragment } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { DEMOTE_COUNT, PROMOTE_COUNT, zoneFor, type Standing } from '../../state/league'
import { Avatar, Initials } from '../../components/Avatar'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { ordinal, xpText } from './leagueCopy'
import { cx } from './cx'
import styles from './StandingsList.module.css'

const MEDAL_COLORS: Record<number, { c: string; label: string }> = {
  1: { c: 'yellow', label: 'Gold' },
  2: { c: 'gray', label: 'Silver' },
  3: { c: 'orange', label: 'Bronze' },
}

const ZONE_WORDS = { promote: 'promotion zone', demote: 'demotion zone', safe: 'safe zone' } as const

const SLIDE = { type: 'spring', stiffness: 420, damping: 36 } as const

export function StandingsList({
  rows,
  division,
  statusFor,
  showYouPill,
  onSelect,
}: {
  rows: Standing[]
  division: number
  /** The little line under each name. */
  statusFor: (row: Standing) => string
  /** False when you have no nickname (your row already says "You"). */
  showYouPill: boolean
  onSelect: (row: Standing) => void
}) {
  const reduce = useReducedMotion()
  const total = rows.length
  const hasPromotion = total > PROMOTE_COUNT && zoneFor(1, total, division) === 'promote'
  const hasDemotion = total > DEMOTE_COUNT && zoneFor(total, total, division) === 'demote'

  return (
    <ol className={styles.list} aria-label="This week's standings">
      {rows.map((row) => {
        const zone = zoneFor(row.rank, total, division)
        const medal = MEDAL_COLORS[row.rank]
        const status = statusFor(row)
        return (
          <Fragment key={row.id}>
            {hasPromotion && row.rank === PROMOTE_COUNT + 1 && <Divider kind="promote" reduce={!!reduce} />}
            {hasDemotion && row.rank === total - DEMOTE_COUNT + 1 && <Divider kind="demote" reduce={!!reduce} />}
            <motion.li layout={reduce ? false : 'position'} transition={{ layout: SLIDE }} className={styles.item}>
              <button
                type="button"
                className={cx(styles.row, row.isYou && styles.you)}
                aria-label={`${ordinal(row.rank)} place, ${row.name}${row.isYou ? ' (you)' : ''}, ${xpText(row.xp)}, ${ZONE_WORDS[zone]}`}
                onClick={() => {
                  sfx.tap()
                  haptic.tap()
                  onSelect(row)
                }}
              >
                <span className={styles.rank} aria-hidden>
                  {medal ? (
                    <span className={styles.medal} title={`${medal.label} medal`} style={{ ['--m' as string]: `var(--c-${medal.c})` }}>
                      {row.rank}
                    </span>
                  ) : (
                    row.rank
                  )}
                </span>
                <span className={styles.avatar} aria-hidden>
                  {row.isYou ? <Avatar id={row.avatar} size="100%" /> : <Initials name={row.name} size="100%" className={styles.initials} />}
                </span>
                <span className={styles.who}>
                  <span className={styles.name}>
                    <span className={styles.nameText}>{row.name}</span>
                    {row.isYou && showYouPill && <span className={styles.youTag}>(you)</span>}
                  </span>
                  {status && <span className={styles.status}>{status}</span>}
                </span>
                <span className={styles.xp}>{xpText(row.xp)}</span>
              </button>
            </motion.li>
          </Fragment>
        )
      })}
    </ol>
  )
}

function Divider({ kind, reduce }: { kind: 'promote' | 'demote'; reduce: boolean }) {
  const Icon = kind === 'promote' ? ArrowUp : ArrowDown
  return (
    <motion.li
      layout={reduce ? false : 'position'}
      transition={{ layout: SLIDE }}
      className={cx(styles.divider, kind === 'promote' ? styles.dividerUp : styles.dividerDown)}
      aria-hidden
    >
      <Icon size={16} strokeWidth={2.5} />
      <span>{kind === 'promote' ? 'Promotion zone' : 'Demotion zone'}</span>
    </motion.li>
  )
}
