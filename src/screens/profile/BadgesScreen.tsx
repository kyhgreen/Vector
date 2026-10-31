/* Badges (/profile/badges): every badge as a list. Tap any badge for details. */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Empty, Ring, Segmented } from '../../components/ui'
import { useGame } from '../../state/store'
import { BADGES, type Badge } from '../../state/badges'
import { number } from '../../lib/format'
import { BadgeSheet, BadgeTile } from './Badges'
import { earnedBadges, earnedCount, lockedBadges } from './profileUtils'
import styles from './BadgesScreen.module.css'

type Filter = 'all' | 'earned' | 'locked'

function summaryLine(earned: number, total: number): string {
  if (total <= 0) return 'No badges to show right now.'
  const left = total - earned
  if (earned === 0) return 'None earned yet.'
  if (left <= 0) return "You've earned every badge."
  if (earned / total >= 0.5) return `Over halfway. ${number(left)} left to earn.`
  return `${number(left)} left to earn.`
}

function FilterLabel({ text, n }: { text: string; n: number }) {
  return (
    <span className={styles.filterLabel}>
      {text} <span className={styles.count}>{number(n)}</span>
    </span>
  )
}

export default function BadgesScreen() {
  const navigate = useNavigate()
  const reduce = !!useReducedMotion()
  const data = useGame()
  const [filter, setFilter] = useState<Filter>('all')
  const [openBadge, setOpenBadge] = useState<Badge | null>(null)

  const total = BADGES.length
  const earned = earnedCount(data)
  const locked = total - earned
  const list: Badge[] = filter === 'earned' ? earnedBadges(data) : filter === 'locked' ? lockedBadges(data) : BADGES

  return (
    <div className={styles.page}>
      <PageHeader title="Badges" back="/profile" />

      <section className={styles.summary} aria-label="Badge progress">
        <Ring value={total ? earned / total : 0} size={72} stroke={9} color="purple">
          <span className={styles.ringNum}>{total ? Math.round((earned / total) * 100) : 0}%</span>
        </Ring>
        <div className={styles.summaryText}>
          <p className={styles.summaryTitle}>
            {number(earned)} of {number(total)}
          </p>
          <p className={styles.summaryLine}>{summaryLine(earned, total)}</p>
        </div>
      </section>

      <Segmented
        className={styles.filter}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: <FilterLabel text="All" n={total} /> },
          { value: 'earned', label: <FilterLabel text="Earned" n={earned} /> },
          { value: 'locked', label: <FilterLabel text="Locked" n={locked} /> },
        ]}
      />

      {list.length === 0 ? (
        filter === 'earned' ? (
          <Empty emoji="🏅" title="No badges yet">
            <p>Finish a lesson to earn your first badge.</p>
            <div className={styles.emptyBtn}>
              <Button color="green" size="md" block={false} onClick={() => navigate('/learn')}>
                Start a lesson
              </Button>
            </div>
          </Empty>
        ) : (
          <Empty emoji="🏆" title="All badges earned">
            <p>Nice work. You've earned every badge in Vector.</p>
          </Empty>
        )
      ) : (
        <motion.ul
          key={filter}
          className={styles.list}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          {list.map((b) => (
            <li key={b.id} className={styles.cell}>
              <BadgeTile badge={b} data={data} onOpen={setOpenBadge} />
            </li>
          ))}
        </motion.ul>
      )}

      <BadgeSheet badge={openBadge} data={data} onClose={() => setOpenBadge(null)} />
    </div>
  )
}
