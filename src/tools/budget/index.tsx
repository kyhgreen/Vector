/*
  Budget Builder: three tabs.
    1. Quick Split  the wireframe's calculator: income in, 50/30/20 out
    2. My Budget    a zero-based plan that assigns all income
    3. Tracker      log real spending against that plan
  Everything is saved on the device via useToolState('budget').
*/
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Segmented } from '../../components/ui'
import { sfx } from '../../lib/sound'
import { TABS, type Tab } from './model'
import { useBudget } from './useBudget'
import type { TabProps } from './parts'
import QuickSplit from './QuickSplit'
import MyBudget from './MyBudget'
import Tracker from './Tracker'
import styles from './Budget.module.css'

const TAB_INFO: Record<Tab, { label: string; Component: (p: TabProps) => ReactNode }> = {
  split: { label: 'Quick Split', Component: QuickSplit },
  budget: { label: 'My Budget', Component: MyBudget },
  tracker: { label: 'Tracker', Component: Tracker },
}

const OPTIONS = TABS.map((t, i) => ({
  value: t,
  label: (
    <span className={styles.tabLabel} title={`Press ${i + 1}`}>
      {TAB_INFO[t].label}
    </span>
  ),
}))

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 16 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -16 }),
}
const fade = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

/** True when a key press is meant for a text box, not for us. */
function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
}

export default function BudgetBuilder() {
  const { data, update, tier } = useBudget()
  const reduce = useReducedMotion()
  const [dir, setDir] = useState(1)
  const tab = data.tab

  const goTo = useCallback(
    (next: Tab) => {
      if (next === tab) return
      setDir(TABS.indexOf(next) > TABS.indexOf(tab) ? 1 : -1)
      update((d) => ({ ...d, tab: next }))
      // Jumping from the bottom of a long tab? Bring the new one into view from the top.
      if (window.scrollY > 120) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    },
    [tab, update, reduce],
  )

  // Desktop nicety: 1, 2, 3 switch tabs (unless you're typing or a pop-up is open).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat || isTyping(e.target)) return
      if (document.querySelector('[role="dialog"]')) return
      const i = ['1', '2', '3'].indexOf(e.key)
      if (i < 0 || TABS[i] === tab) return
      sfx.tap()
      goTo(TABS[i])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo, tab])

  const { Component } = TAB_INFO[tab]

  return (
    <div className={styles.root}>
      <Segmented value={tab} onChange={goTo} options={OPTIONS} />
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={tab}
          custom={dir}
          variants={reduce ? fade : slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 520, damping: 40, opacity: { duration: 0.15 } }}
          role="tabpanel"
          aria-label={TAB_INFO[tab].label}
        >
          <Component data={data} update={update} tier={tier} goTo={goTo} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
