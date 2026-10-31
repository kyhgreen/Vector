/*
  League tab (/league): the weekly race against made-up rivals.

  Top to bottom:
    1. Header: your league's coin (tap it, it flips), the rules, and a countdown to Monday.
    2. The ladder: every league from Penny to Benjamin.
    3. Where you stand (or how to join if you have 0 XP this week).
    4. The leaderboard with promotion and demotion zones.
  Plus a pop-up with last week's result the first time you visit after a reset.
*/
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { Clock, Info } from 'lucide-react'
import { Button, IconButton } from '../../components/Button'
import { Empty, ProgressBar } from '../../components/ui'
import { useNow } from '../../state/hooks'
import { useGame } from '../../state/store'
import { DEFAULT_AVATAR } from '../../state/constants'
import { rivalXpAt, rivalsFor, standings, zoneFor, type Standing } from '../../state/league'
import { weekProgress } from '../../state/logic'
import { dayKey, weekStart } from '../../lib/dates'
import { number } from '../../lib/format'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { DivisionBadge, divisionVars } from './DivisionBadge'
import { DivisionLadder } from './DivisionLadder'
import { StandingsList } from './StandingsList'
import { DivisionSheet, PlayerSheet, ResultSheet, RulesSheet } from './LeagueSheets'
import {
  clampDivision,
  divisionShape,
  leagueName,
  msUntilReset,
  rivalReport,
  rivalStatus,
  rulesLine,
  safe,
  timeLeft,
  xpText,
  youMessage,
  type YouMessage,
} from './leagueCopy'
import { cx } from './cx'
import styles from './LeagueScreen.module.css'

type SheetState = { kind: 'player'; id: string } | { kind: 'division'; index: number } | { kind: 'rules' } | null

const HALF_DAY = 0.5 / 7 // 12 hours, as a fraction of the week

export default function LeagueScreen() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const syncTime = useGame((s) => s.syncTime)
  const markResultSeen = useGame((s) => s.markLeagueResultSeen)
  const league = useGame((s) => s.league)
  const profileName = useGame((s) => s.profile.name)
  const profileAvatar = useGame((s) => s.profile.avatar)
  const tick = useNow(15_000)
  // App.tsx settles the week when the phone wakes up, which can beat our 15 s
  // tick. If the store is already in a newer week, read the clock fresh.
  const now = league.weekKey > weekStart(dayKey(tick)) ? new Date() : tick
  const [sheet, setSheet] = useState<SheetState>(null)
  const [flips, setFlips] = useState(0)

  // Settle last week (if a new one started) before showing anything stale.
  // Runs on mount and again if Monday midnight rolls around while you're here.
  const currentWeek = weekStart(dayKey(now))
  useEffect(() => {
    syncTime()
  }, [syncTime, currentWeek])

  const division = clampDivision(league.division)
  const weekKey = league.weekKey || currentWeek
  const weekXp = Math.max(0, Math.round(safe(league.weekXp)))
  // Until the sync above lands, a stored old week shows its final standings.
  const progress = weekKey === currentWeek ? weekProgress(now) : 1
  const nickname = (profileName ?? '').trim()
  const youName = nickname || 'You'
  const youAvatar = profileAvatar || DEFAULT_AVATAR

  const rivals = useMemo(() => rivalsFor(weekKey, division), [weekKey, division])
  const rivalById = useMemo(() => new Map(rivals.map((r) => [r.id, r])), [rivals])
  const rows = useMemo(
    () => standings({ weekKey, division, progress, youXp: weekXp, youName, youAvatar }),
    [weekKey, division, progress, weekXp, youName, youAvatar],
  )
  const total = rows.length
  const you = rows.find((r) => r.isYou)

  // XP each rival picked up in the last 12 hours, for the "very active" status and news line.
  const gains = useMemo(() => {
    const before = Math.max(0, progress - HALF_DAY)
    const m = new Map<string, number>()
    for (const r of rivals) m.set(r.id, Math.max(0, rivalXpAt(r, progress, weekKey) - rivalXpAt(r, before, weekKey)))
    return m
  }, [rivals, progress, weekKey])

  const dayIndex = Math.min(6, Math.floor(progress * 7))
  const report = useMemo(() => {
    let hotName: string | undefined
    let hotGain = 0
    for (const r of rivals) {
      const g = gains.get(r.id) ?? 0
      if (g > hotGain) {
        hotGain = g
        hotName = r.name
      }
    }
    const everyoneZero = rows.every((r) => r.isYou || r.xp === 0)
    return rivalReport({ hotName, hotGain, everyoneZero, seed: `${weekKey}|${Math.floor(progress * 14)}` })
  }, [rivals, gains, rows, weekKey, progress])

  const message = weekXp > 0 ? youMessage(rows, division) : null
  const youZone = you ? zoneFor(you.rank, total, division) : 'safe'

  const statusFor = useCallback(
    (row: Standing) => {
      if (row.isYou) {
        if (weekXp <= 0) return 'No XP yet this week'
        return youZone === 'promote' ? 'Promotion zone' : youZone === 'demote' ? 'Demotion zone' : 'Safe zone'
      }
      return rivalStatus(row.id, weekKey, dayIndex, gains.get(row.id) ?? 0)
    },
    [weekXp, youZone, weekKey, dayIndex, gains],
  )

  const msLeft = msUntilReset(now)
  const left = timeLeft(msLeft)
  const finalDay = msLeft < 86_400_000

  const resultOpen = !!league.lastResult && !league.lastResult.seen
  const closeSheet = useCallback(() => setSheet(null), [])
  // Also drop any sheet that was open when the result took over, so it doesn't pop back up.
  const closeResult = useCallback(() => {
    markResultSeen()
    setSheet(null)
  }, [markResultSeen])
  const goLearn = useCallback(() => navigate('/learn'), [navigate])

  const active = resultOpen ? null : sheet
  const selectedRow = active?.kind === 'player' ? (rows.find((r) => r.id === active.id) ?? null) : null

  return (
    <div className={styles.page}>
      {/* ---------- Header ---------- */}
      <section className={styles.hero} style={divisionVars(division)} aria-labelledby="league-title">
        <button
          type="button"
          className={styles.coinBtn}
          aria-label={`Flip your ${leagueName(division)} ${divisionShape(division)}`}
          onClick={() => {
            sfx.coin()
            haptic.tap()
            setFlips((f) => f + 1)
          }}
        >
          <motion.span
            className={styles.coinSpin}
            initial={reduce ? false : { rotateY: -360, opacity: 0 }}
            animate={{ rotateY: reduce ? 0 : flips * 360, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 110, damping: 14 }}
          >
            <DivisionBadge division={division} size={64} shine />
          </motion.span>
        </button>

        <div className={styles.heroText}>
          <h1 id="league-title" className={styles.title}>
            {leagueName(division)}
          </h1>
          <p className={styles.rules}>{rulesLine(division)}</p>
          <p className={cx(styles.countdown, finalDay && styles.countdownUrgent)} role="timer" aria-label={`This week's league ends in ${left.long}`}>
            <Clock size={16} strokeWidth={2.5} aria-hidden />
            <span>{finalDay ? `Last day. ${left.short} left` : `Ends in ${left.short}`}</span>
          </p>
        </div>

        <IconButton
          label="How leagues work"
          className={styles.info}
          onClick={() => {
            sfx.tap()
            haptic.tap()
            setSheet({ kind: 'rules' })
          }}
        >
          <Info size={22} strokeWidth={2.25} />
        </IconButton>
      </section>

      {/* ---------- Ladder ---------- */}
      <DivisionLadder current={division} onPick={(index) => setSheet({ kind: 'division', index })} />

      {/* ---------- Where you stand ---------- */}
      {weekXp <= 0 ? (
        <section className={styles.stand} aria-labelledby="stand-title">
          <h2 id="stand-title" className={styles.standTitle}>
            You're not in the race yet
          </h2>
          <p className={styles.standBody}>Finish one lesson to join this week's standings.</p>
          <Button color="green" size="md" onClick={goLearn} className={styles.standBtn}>
            Start a lesson
          </Button>
        </section>
      ) : (
        message && <YouStatus message={message} onLearn={goLearn} />
      )}

      {/* ---------- Standings ---------- */}
      <section className={styles.board} aria-labelledby="race-title">
        <h2 id="race-title" className={styles.boardTitle}>
          This week
        </h2>
        <p className={styles.report} aria-live="polite">
          {report}
        </p>

        {total > 0 ? (
          <StandingsList rows={rows} division={division} statusFor={statusFor} showYouPill={!!nickname} onSelect={(row) => setSheet({ kind: 'player', id: row.id })} />
        ) : (
          <Empty emoji="📋" title="No standings yet">
            The standings for this week will show up here.
          </Empty>
        )}

        <p className={styles.footnote}>Rivals are pretend players. No one else can see your progress.</p>
      </section>

      {/* ---------- Pop-ups ---------- */}
      <ResultSheet result={league.lastResult} onClose={closeResult} />
      <PlayerSheet
        row={selectedRow}
        you={you}
        rival={selectedRow ? rivalById.get(selectedRow.id) : undefined}
        message={message}
        onClose={closeSheet}
        onLearn={goLearn}
      />
      <DivisionSheet division={active?.kind === 'division' ? active.index : null} current={division} onClose={closeSheet} />
      <RulesSheet open={active?.kind === 'rules'} onClose={closeSheet} />
    </div>
  )
}

/* ---------- Where you stand ---------- */

const TONE_COLOR = { promote: 'green', safe: 'blue', demote: 'red' } as const

function YouStatus({ message, onLearn }: { message: YouMessage; onLearn: () => void }) {
  const color = TONE_COLOR[message.tone]
  const goal = message.goal
  const pct = goal ? (goal.target > 0 ? Math.min(1, Math.max(0, goal.current / goal.target)) : 1) : 0
  return (
    <section className={cx(styles.stand, styles[`tone_${message.tone}`])} aria-labelledby="stand-title">
      <h2 id="stand-title" className={styles.standTitle}>
        {message.title}
      </h2>
      <p className={styles.standBody}>{message.body}</p>
      {goal && (
        <div className={styles.goal}>
          <ProgressBar value={pct} color={color} height={12} label={goal.label} className={styles.goalBar} />
          <span className={styles.goalNums}>
            {number(Math.max(0, Math.round(goal.current)))} / {xpText(goal.target)}
          </span>
        </div>
      )}
      {message.tone !== 'promote' && (
        <Button color={color} size="md" onClick={onLearn} className={styles.standBtn}>
          Earn XP
        </Button>
      )}
    </section>
  )
}
