/*
  The frame around the main tabs.
  Phones: content + bottom tab bar.
  Tablets/desktop (Windows app window): left sidebar.
  Wide desktop: plus a right rail with your stats.
*/
import { NavLink, Outlet, useLocation } from 'react-router'
import { House, Calculator, Trophy, Store, CircleUser } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { StatBar } from './StatBar'
import { Logo } from './icons'
import { Card, ProgressBar } from './ui'
import { useXpToday } from '../state/hooks'
import { useGame } from '../state/store'
import { DIVISIONS, PROMOTE_COUNT } from '../state/league'
import { sfx } from '../lib/sound'
import styles from './AppShell.module.css'

const TABS = [
  { to: '/learn', label: 'Learn', icon: House, color: 'green' },
  { to: '/tools', label: 'Tools', icon: Calculator, color: 'blue' },
  { to: '/league', label: 'League', icon: Trophy, color: 'yellow' },
  { to: '/shop', label: 'Shop', icon: Store, color: 'pink' },
  { to: '/profile', label: 'Me', icon: CircleUser, color: 'purple' },
] as const

export function AppShell() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className={styles.shell}>
      <nav className={styles.side} aria-label="Main">
        <div className={styles.brand}>
          <Logo size={36} />
          <span className={styles.brandName}>vector</span>
        </div>
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} onClick={() => sfx.tap()} className={({ isActive }) => [styles.sideLink, isActive && styles.sideActive].filter(Boolean).join(' ')} style={{ ['--tab' as string]: `var(--c-${t.color})`, ['--tab-soft' as string]: `var(--c-${t.color}-soft)` }}>
            <t.icon size={26} strokeWidth={2.5} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      <main ref={mainRef} className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>

      <aside className={styles.rail}>
        <StatBar />
        <DailyGoalCard />
        <LeagueCard />
      </aside>

      <nav className={styles.tabs} aria-label="Main">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} onClick={() => sfx.tap()} className={({ isActive }) => [styles.tab, isActive && styles.tabActive].filter(Boolean).join(' ')} style={{ ['--tab' as string]: `var(--c-${t.color})`, ['--tab-soft' as string]: `var(--c-${t.color}-soft)` }}>
            <t.icon size={26} strokeWidth={2.5} />
            <span className={styles.tabLabel}>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function DailyGoalCard() {
  const { xp, goal, pct, done } = useXpToday()
  return (
    <Card>
      <div className={styles.railTitle}>Daily goal</div>
      <div className={styles.railRow}>
        <ProgressBar value={pct} color="yellow" height={14} label="Daily goal" />
        <span className={styles.railNum}>
          {Math.min(xp, goal)}/{goal}
        </span>
      </div>
      <p className={styles.railHint}>{done ? 'Goal met for today.' : `${goal - xp} XP to go.`}</p>
    </Card>
  )
}

function LeagueCard() {
  const division = useGame((s) => s.league.division)
  const weekXp = useGame((s) => s.league.weekXp)
  return (
    <NavLink to="/league" className={styles.railLink}>
      <Card className={styles.railCard}>
        <div className={styles.railTitle}>{DIVISIONS[division].name} League</div>
        <p className={styles.railHint}>
          {weekXp} XP this week. Top {PROMOTE_COUNT} move up on Monday.
        </p>
      </Card>
    </NavLink>
  )
}
