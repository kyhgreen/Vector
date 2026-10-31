/*
  Pop-ups for the League screen:
    ResultSheet    last week's result (promoted / stayed / demoted)
    PlayerSheet    tap a row: a rival's mini profile, or your own stats
    DivisionSheet  tap a rung on the ladder: what that league is + a coin or bill fact
    RulesSheet     how leagues work, in plain words
*/
import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Sheet } from '../../components/Sheet'
import { Button } from '../../components/Button'
import { celebrate } from '../../lib/confetti'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { DEMOTE_COUNT, PROMOTE_COUNT, type Rival, type Standing } from '../../state/league'
import { Avatar, Initials } from '../../components/Avatar'
import type { LeagueState } from '../../state/types'
import { DivisionBadge } from './DivisionBadge'
import { divisionFact, divisionQuip, divisionShape, ladderStatus, leagueName, lessonsFor, ordinal, resultCopy, rivalBio, rivalStyle, xpText, type YouMessage } from './leagueCopy'
import { cx } from './cx'
import styles from './LeagueSheets.module.css'

/* ---------- Last week's result ---------- */

type LastResult = NonNullable<LeagueState['lastResult']>

export function ResultSheet({ result, onClose }: { result: LastResult | null; onClose: () => void }) {
  const reduce = useReducedMotion()
  const open = !!result && !result.seen
  const celebrated = useRef<string | null>(null)

  useEffect(() => {
    if (!open || !result || celebrated.current === result.weekKey) return
    const t = setTimeout(() => {
      // Mark it here, not before the timer: StrictMode runs this effect twice
      // and the first timer gets cleared, which used to eat the confetti.
      celebrated.current = result.weekKey
      if (result.outcome === 'promoted') {
        celebrate('big')
        sfx.unlock()
        haptic.celebrate()
      } else if (result.outcome === 'stayed') {
        sfx.coin()
        haptic.tap()
      }
    }, 280)
    return () => clearTimeout(t)
  }, [open, result])

  if (!result) return <Sheet open={false} onClose={onClose}>{null}</Sheet>

  const copy = resultCopy(result)
  const moved = result.from !== result.to

  return (
    <Sheet open={open} onClose={onClose} title={copy.title}>
      <div className={styles.resultHero}>
        {moved && (
          <>
            <DivisionBadge division={result.from} size={52} className={styles.fromBadge} />
            <motion.span
              className={cx(styles.arrow, result.outcome === 'demoted' && styles.arrowDown)}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              aria-hidden
            >
              <ArrowRight size={26} strokeWidth={2.5} />
            </motion.span>
          </>
        )}
        <motion.span
          className={styles.toBadge}
          initial={reduce ? false : { scale: 0.3, rotate: result.outcome === 'promoted' ? -200 : 0, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
        >
          <DivisionBadge division={result.to} size={84} />
        </motion.span>
      </div>
      <p className={styles.lead}>{copy.body}</p>
      <Button color={result.outcome === 'demoted' ? 'blue' : 'green'} onClick={onClose} autoFocus>
        {copy.button}
      </Button>
    </Sheet>
  )
}

/* ---------- A row on the board ---------- */

export function PlayerSheet({
  row,
  you,
  rival,
  message,
  onClose,
  onLearn,
}: {
  row: Standing | null
  you: Standing | undefined
  rival: Rival | undefined
  /** Your "where you stand" message (only used on your own row). */
  message: YouMessage | null
  onClose: () => void
  onLearn: () => void
}) {
  const open = !!row
  if (!row) return <Sheet open={false} onClose={onClose}>{null}</Sheet>

  const youXp = you?.xp ?? 0
  const notStarted = youXp <= 0

  let gapLine: string
  if (row.isYou) {
    gapLine = notStarted ? 'You have 0 XP this week. Finish a lesson to join the standings.' : (message?.body ?? 'Keep going.')
  } else if (notStarted) {
    gapLine = `Finish a lesson to start catching up to ${row.name}.`
  } else if (you && row.rank < you.rank) {
    const need = Math.max(1, row.xp - youXp)
    gapLine = `${row.name} is ${xpText(need)} ahead. That's ${lessonsFor(need)}.`
  } else if (row.xp === youXp) {
    gapLine = "You're tied, and ties go to you."
  } else {
    gapLine = `You're ${xpText(youXp - row.xp)} ahead of ${row.name}.`
  }

  const style = rival ? rivalStyle(rival.curve) : null

  return (
    <Sheet open={open} onClose={onClose} title={row.isYou ? "That's you" : row.name}>
      <div className={styles.player}>
        <span className={cx(styles.bigAvatar, row.isYou && styles.bigAvatarYou)} aria-hidden>
          {row.isYou ? <Avatar id={row.avatar} size={68} /> : <Initials name={row.name} size={68} />}
        </span>
        <div className={styles.playerText}>
          {row.isYou && <span className={styles.youName}>{row.name}</span>}
          <span className={styles.playerStats}>
            <strong className={styles.bigNum}>{ordinal(row.rank)}</strong> with {xpText(row.xp)}
          </span>
        </div>
      </div>
      {!row.isYou && (
        <p className={styles.bio}>
          {rivalBio(row.name)}
          {style && <span className={styles.note}> {style.label}. Not a real person.</span>}
        </p>
      )}
      <p className={styles.gap}>{gapLine}</p>
      <Button
        color="green"
        onClick={() => {
          onClose()
          onLearn()
        }}
      >
        Start a lesson
      </Button>
    </Sheet>
  )
}

/* ---------- A rung on the ladder ---------- */

export function DivisionSheet({ division, current, onClose }: { division: number | null; current: number; onClose: () => void }) {
  if (division === null) return <Sheet open={false} onClose={onClose}>{null}</Sheet>
  const locked = division > current
  return (
    <Sheet open onClose={onClose} title={leagueName(division)}>
      <div className={styles.center}>
        <DivisionBadge division={division} size={76} locked={locked} />
        <p className={styles.quip}>{divisionQuip(division)}</p>
      </div>
      <p className={styles.lead}>{ladderStatus(division, current)}</p>
      <p className={styles.fact}>
        <strong>About this {divisionShape(division)}:</strong> {divisionFact(division)}
      </p>
      <Button color="blue" onClick={onClose}>
        Got it
      </Button>
    </Sheet>
  )
}

/* ---------- How it works ---------- */

const RULES = [
  'Every lesson and practice round earns XP.',
  'A new week starts every Monday at midnight.',
  `At the end of the week, the top ${PROMOTE_COUNT} move up a league.`,
  `The bottom ${DEMOTE_COUNT} move down a league. No one moves down from Penny.`,
  'If you skip a week, you stay in the same league.',
  'Rivals are pretend players, so you never compete with or talk to strangers.',
]

export function RulesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="How leagues work">
      <ul className={styles.rules}>
        {RULES.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      <Button color="blue" onClick={onClose}>
        Got it
      </Button>
    </Sheet>
  )
}
