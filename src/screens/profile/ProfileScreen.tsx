/*
  Profile (/profile): who you are and how it's going.
  Avatar and name up top, your money title, streak and a couple of stats,
  the week's XP chart, a badge preview, and a plain list of totals.
  Mostly straight on the page; only things you can tap get a card.
*/
import { useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { BookOpenCheck, ChevronRight, Flame, Pencil, Plus, Settings, Trophy } from 'lucide-react'
import { IconButton, type ButtonColor } from '../../components/Button'
import { ProgressBar } from '../../components/ui'
import { StreakSheet } from '../../components/StreakSheet'
import { Avatar } from '../../components/Avatar'
import { useStreak } from '../../state/hooks'
import { useGame } from '../../state/store'
import { BADGES, type Badge } from '../../state/badges'
import { DIVISIONS } from '../../state/league'
import { homeTier } from '../../state/progress'
import { getLessonInfo, getTier, UNITS } from '../../content'
import { number } from '../../lib/format'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { BadgeSheet, BadgeTile } from './Badges'
import { WeekChart } from './WeekChart'
import { avatarColor, badgePreview, DEFAULT_AVATAR, displayName, earnedCount, joinedLabel, rankFor, safeNum } from './profileUtils'
import styles from './ProfileScreen.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')
const colorVars = (color: ButtonColor): CSSProperties =>
  ({ ['--c' as string]: `var(--c-${color})`, ['--cd' as string]: `var(--c-${color}-dark)`, ['--cs' as string]: `var(--c-${color}-soft)` }) as CSSProperties

const tap = () => {
  sfx.tap()
  haptic.tap()
}

export default function ProfileScreen() {
  const navigate = useNavigate()
  const reduce = !!useReducedMotion()
  const data = useGame()
  const streak = useStreak()
  const [streakOpen, setStreakOpen] = useState(false)
  const [openBadge, setOpenBadge] = useState<Badge | null>(null)

  const avatar = data.profile?.avatar || DEFAULT_AVATAR
  const color = avatarColor(avatar)
  const hasName = !!data.profile?.name?.trim()
  const name = displayName(data.profile?.name)
  const tier = getTier(homeTier(data))
  const xp = safeNum(data.xpTotal)
  const { rank, next, pct, toNext, level } = rankFor(xp)
  const divisionIdx = Math.max(0, Math.min(DIVISIONS.length - 1, Math.floor(safeNum(data.league?.division))))
  const division = DIVISIONS[divisionIdx]
  // Only count lessons that still exist, so an old save can't show "31/30".
  const lessonsDone = Object.keys(data.lessons ?? {}).filter((id) => getLessonInfo(id)).length
  const totalLessons = UNITS.reduce((n, u) => n + u.lessons.length, 0)
  const longest = Math.max(safeNum(data.streak?.longest), streak.count)
  const badgesEarned = earnedCount(data)
  const preview = badgePreview(data, 6)
  const bestDay = Math.max(0, ...Object.values(data.xpByDay ?? {}).map(safeNum))
  const stats = data.stats
  const nerdy = {
    perfect: safeNum(stats?.perfectLessons),
    quizzes: safeNum(stats?.quizzesPassed),
    practice: safeNum(stats?.practiceDone),
    coins: Math.floor(safeNum(stats?.coinsEarned)),
    freezes: safeNum(data.streak?.freezes),
  }
  const allZero = Object.values(nerdy).every((v) => v === 0) && bestDay === 0

  const go = (to: string) => () => {
    tap()
    navigate(to)
  }
  const openStreak = () => {
    tap()
    setStreakOpen(true)
  }

  return (
    <div className={styles.page}>
      <h1 className="sr-only">Your profile</h1>

      {/* ---------- Who you are ---------- */}
      <header className={styles.top}>
        <motion.button
          type="button"
          className={styles.avatar}
          style={colorVars(color)}
          onClick={go('/shop')}
          aria-label="Get more avatars in the shop"
          whileHover={reduce ? undefined : { rotate: -6 }}
          whileTap={{ scale: 0.94 }}
        >
          <Avatar id={avatar} size="100%" disc={false} className={styles.avatarArt} />
          <span className={styles.avatarPlus} aria-hidden>
            <Plus size={14} strokeWidth={3.5} />
          </span>
        </motion.button>

        <div className={styles.who}>
          <p className={styles.name}>{name}</p>
          {!hasName && (
            <button type="button" className={styles.nameLink} onClick={go('/profile/settings')}>
              <Pencil size={14} strokeWidth={2.5} /> Pick a nickname
            </button>
          )}
          <p className={styles.joined}>
            {joinedLabel(data.profile?.joinedDay)} · {tier.name}
          </p>
        </div>

        <IconButton label="Settings" className={styles.gear} onClick={go('/profile/settings')}>
          <Settings size={22} strokeWidth={2.25} />
        </IconButton>
      </header>

      {/* ---------- Money title ---------- */}
      <section className={styles.rank} aria-label="Your level">
        <div className={styles.rankTop}>
          <span className={styles.rankTitle}>
            <span aria-hidden>{rank.emoji}</span> {rank.title}
          </span>
          <span className={styles.rankXp}>{number(xp)} XP</span>
        </div>
        <ProgressBar value={pct} color="yellow" height={12} label={next ? `Progress to ${next.title}` : 'Top level'} />
        <p className={styles.muted}>
          Level {level}. {next ? `${number(toNext)} XP to ${next.title}.` : 'This is the top level.'}
        </p>
      </section>

      {/* ---------- Stats ---------- */}
      <section className={styles.stats} aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">
          Stats
        </h2>
        <button
          type="button"
          className={cx(styles.card, styles.streak)}
          onClick={openStreak}
          aria-label={`${streak.count} day streak. Longest: ${longest}`}
        >
          <Flame
            className={cx(styles.flame, streak.status !== 'done-today' && styles.flameOff)}
            size={34}
            strokeWidth={2.25}
            fill="currentColor"
            aria-hidden
          />
          <span className={styles.cardText}>
            <span className={styles.big}>{number(streak.count)}</span>
            <span className={styles.cardLabel}>day streak</span>
          </span>
          <span className={styles.best}>Best: {number(longest)}</span>
        </button>

        <div className={styles.pair}>
          <button
            type="button"
            className={styles.card}
            onClick={go('/learn')}
            aria-label={`Lessons done: ${lessonsDone}${totalLessons > 0 ? ` of ${totalLessons}` : ''}`}
          >
            <BookOpenCheck className={styles.cardIcon} size={24} strokeWidth={2.25} style={colorVars('green')} aria-hidden />
            <span className={styles.cardText}>
              <span className={styles.mid}>
                {number(lessonsDone)}
                {totalLessons > 0 && <span className={styles.suffix}>/{number(totalLessons)}</span>}
              </span>
              <span className={styles.cardLabel}>lessons</span>
            </span>
          </button>
          <button type="button" className={styles.card} onClick={go('/league')} aria-label={`League: ${division.name}`}>
            <Trophy className={styles.cardIcon} size={24} strokeWidth={2.25} style={colorVars(division.color)} aria-hidden />
            <span className={styles.cardText}>
              <span className={styles.mid}>{division.name}</span>
              <span className={styles.cardLabel}>league</span>
            </span>
          </button>
        </div>
      </section>

      {/* ---------- This week ---------- */}
      <div className={styles.block}>
        <WeekChart />
      </div>

      {/* ---------- Badges ---------- */}
      <section className={styles.block} aria-labelledby="badges-title">
        <div className={styles.sectionHead}>
          <h2 id="badges-title" className={styles.sectionTitle}>
            Badges <span className={styles.headCount}>{number(badgesEarned)}/{number(BADGES.length)}</span>
          </h2>
          <button type="button" className={styles.seeAll} onClick={go('/profile/badges')}>
            See all <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
        {badgesEarned === 0 && <p className={styles.emptyLine}>No badges yet. Finish a lesson to earn your first one.</p>}
        <div className={styles.badgeGrid}>
          {preview.map((b) => (
            <BadgeTile key={b.id} badge={b} data={data} onOpen={setOpenBadge} compact />
          ))}
        </div>
      </section>

      {/* ---------- Totals ---------- */}
      <section className={styles.block} aria-labelledby="nerdy-title">
        <h2 id="nerdy-title" className={styles.sectionTitle}>
          More stats
        </h2>
        <dl className={styles.list}>
          <Row label="Perfect lessons" value={number(nerdy.perfect)} />
          <Row label="Quizzes passed" value={number(nerdy.quizzes)} />
          <Row label="Practice sessions" value={number(nerdy.practice)} />
          <Row label="Coins earned" value={number(nerdy.coins)} />
          <Row label="Best day" value={`${number(bestDay)} XP`} />
          <Row label="Streak freezes" value={number(nerdy.freezes)} />
        </dl>
        {allZero && <p className={styles.emptyLine}>These fill in as you finish lessons, quizzes, and practice.</p>}
      </section>

      <StreakSheet open={streakOpen} onClose={() => setStreakOpen(false)} />
      <BadgeSheet badge={openBadge} data={data} onClose={() => setOpenBadge(null)} />
    </div>
  )
}

function Row({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div className={styles.row}>
      <dt className={styles.rowLabel}>{label}</dt>
      <dd className={styles.rowValue}>{value}</dd>
    </div>
  )
}
