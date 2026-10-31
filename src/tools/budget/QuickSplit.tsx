/*
  Tab 1: Quick Split. Straight from the wireframe's Calculator screen:
  type your income, hit Calculate, get the 50/30/20 split.
*/
import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../../components/Button'
import { DonutChart } from '../../components/Charts'
import { MoneyInput } from '../../components/ui'
import { split503020 } from '../../lib/finance'
import { haptic } from '../../lib/haptics'
import { money } from '../../lib/format'
import { sfx } from '../../lib/sound'
import { EVENTS } from '../../state/badges'
import { useGame } from '../../state/store'
import { cleanAmount, fmt, fmtShort, GROUP_ORDER, GROUPS, MAX_AMOUNT, NEEDS_NOTE, QUICK_FILLS, SPLIT_EXAMPLES, WEEKS_PER_MONTH, type Group, type Period, type SplitResult } from './model'
import { Chip, cx, GroupIcon, shakeClass, tone, type TabProps } from './parts'
import styles from './Budget.module.css'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'month', label: 'Monthly' },
  { value: 'week', label: 'Weekly' },
]

const fade = { initial: { opacity: 0 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }

/** "School lunch, bus fare, school supplies" */
const exampleLine = (xs: string[]) => xs.map((x, i) => (i ? x.toLowerCase() : x)).join(', ')

export default function QuickSplit({ data, update, tier, goTo }: TabProps) {
  const track = useGame((s) => s.track)
  const { income, period, result } = data.split
  const [nudges, setNudges] = useState(0)
  const tracked = useRef(false)

  const setSplit = (patch: Partial<typeof data.split>) => update((d) => ({ ...d, split: { ...d.split, ...patch } }))

  const calculate = (e?: FormEvent) => {
    e?.preventDefault()
    if (!(income > 0)) {
      sfx.wrong()
      haptic.wrong()
      setNudges((n) => n + 1)
      return
    }
    sfx.correct()
    haptic.correct()
    setSplit({ result: { income, period, at: Date.now() } })
    if (!tracked.current) {
      tracked.current = true
      track(EVENTS.quickSplitUsed)
    }
  }

  const stale = !!result && (result.income !== income || result.period !== period)
  const periodWord = period === 'month' ? 'monthly' : 'weekly'

  return (
    <div className={styles.stack}>
      <form className={styles.calc} onSubmit={calculate} noValidate>
        <h2 className={styles.h2}>Your {periodWord} income</h2>
        <div className={styles.chips} role="group" aria-label="How often you get paid">
          {PERIODS.map((p) => (
            <Chip
              key={p.value}
              color="blue"
              selected={period === p.value}
              onClick={() => {
                sfx.tap()
                haptic.tap()
                setSplit({ period: p.value })
              }}
            >
              {p.label}
            </Chip>
          ))}
        </div>
        <div className={cx(styles.bigInput, shakeClass(nudges))}>
          <MoneyInput value={income} onChange={(n) => setSplit({ income: cleanAmount(n) })} max={MAX_AMOUNT} ariaLabel={`Your ${periodWord} income in dollars`} />
        </div>
        <div className={styles.chips} role="group" aria-label="Quick amounts">
          {QUICK_FILLS[tier][period].map((q) => (
            <Chip
              key={q.label}
              color="green"
              selected={income === q.amount}
              onClick={() => {
                sfx.tap()
                haptic.tap()
                setSplit({ income: q.amount })
              }}
            >
              {q.label} {money(q.amount)}
            </Chip>
          ))}
        </div>
        <AnimatePresence initial={false}>
          {nudges > 0 && !(income > 0) && (
            <motion.p className={styles.nudge} role="alert" {...fade} animate={{ opacity: 1 }}>
              Type an amount first.
            </motion.p>
          )}
        </AnimatePresence>
        <Button type="submit" size="lg" feedback={false}>
          {stale ? 'Calculate again' : 'Calculate'}
        </Button>
      </form>

      <hr className={styles.rule} />

      <AnimatePresence mode="wait" initial={false}>
        {result ? <Results key={result.at} result={result} tier={tier} stale={stale} goTo={goTo} /> : <Placeholder key="placeholder" />}
      </AnimatePresence>
    </div>
  )
}

function SplitRow({ g, amount, children }: { g: Group; amount: string; children?: ReactNode }) {
  const info = GROUPS[g]
  return (
    <li className={cx(styles.splitRow, tone(info.color))}>
      <GroupIcon group={g} size={22} className={styles.splitIcon} />
      <div className={styles.splitText}>
        <span className={styles.splitName}>
          {info.name} <span className={styles.faint}>{Math.round(info.pct * 100)}%</span>
        </span>
        {children}
      </div>
      <span className={styles.splitAmount}>{amount}</span>
    </li>
  )
}

function Results({ result, tier, stale, goTo }: { result: SplitResult; tier: TabProps['tier']; stale: boolean; goTo: TabProps['goTo'] }) {
  const split = split503020(result.income)
  const per = result.period === 'month' ? 'a month' : 'a week'
  const yearly = split.savings * (result.period === 'month' ? 12 : 52)
  const monthly = result.income * WEEKS_PER_MONTH

  return (
    <motion.section className={styles.stack} aria-live="polite" {...fade} animate={{ opacity: stale ? 0.55 : 1 }}>
      <div className={styles.resultHead}>
        <h2 className={styles.h2}>Your 50/30/20 split</h2>
        <span className={styles.muted}>
          {fmt(result.income)} {per}
        </span>
      </div>
      {stale && <p className={styles.staleNote}>Numbers changed. Press Calculate again.</p>}

      <ul className={styles.splitList}>
        {GROUP_ORDER.map((g) => (
          <SplitRow key={g} g={g} amount={fmt(split[g])}>
            <span className={styles.splitEx}>{exampleLine(SPLIT_EXAMPLES[tier][g])}</span>
            {g === 'needs' && <span className={styles.splitEx}>{NEEDS_NOTE[tier]}</span>}
          </SplitRow>
        ))}
      </ul>

      <div className={styles.donutRow}>
        <DonutChart
          segments={GROUP_ORDER.map((g) => ({ name: GROUPS[g].name, value: split[g], color: GROUPS[g].chart }))}
          center={fmtShort(result.income)}
          sub={per}
          format={fmt}
        />
        <p>
          At this rate you would save <strong>{fmt(yearly)}</strong> in a year.
          {result.period === 'week' && <> That's about {fmt(monthly)} a month coming in.</>}
        </p>
      </div>

      <p className={styles.tip}>Move the 20% to savings when you get paid, before you spend any of it.</p>

      <Button color="blue" icon={<ArrowRight size={22} strokeWidth={3} />} onClick={() => goTo('budget')}>
        Build my full budget
      </Button>
    </motion.section>
  )
}

function Placeholder() {
  return (
    <motion.section className={styles.stack} {...fade} animate={{ opacity: 1 }}>
      <ul className={cx(styles.splitList, styles.splitGhost)} aria-hidden="true">
        {GROUP_ORDER.map((g) => (
          <SplitRow key={g} g={g} amount="$?" />
        ))}
      </ul>
      <p className={styles.muted}>Press Calculate to split your income with the 50/30/20 rule.</p>
    </motion.section>
  )
}
