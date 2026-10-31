/*
  A pay stub you can poke. Each line is a button that explains itself.
*/
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { ChevronDown, Scissors } from 'lucide-react'
import { money, number } from '../../lib/format'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { STUB_INFO, type Job, type StubLine, type StubView } from './data'
import type { Breakdown, PayFrequency } from './tax'
import styles from './PayStub.module.css'

const PERIOD_LABEL: Record<PayFrequency, string> = { weekly: 'Weekly', biweekly: 'Every 2 weeks' }

export function PayStub({
  b,
  view,
  job,
  frequency,
  wage,
  hours,
  stateRatePct,
}: {
  b: Breakdown
  view: StubView
  job: Job
  frequency: PayFrequency
  wage: number
  /** Hours in this view (one pay period, or a year). */
  hours: number
  stateRatePct: number
}) {
  const [open, setOpen] = useState<StubLine | null>(null)
  const cents = view === 'check'
  const fmt = (n: number) => money(n, { cents })
  const minus = (n: number) => (n > 0.004 ? `-${fmt(n)}` : fmt(0))

  const toggle = (line: StubLine) => {
    sfx.tap()
    haptic.tap()
    setOpen((cur) => (cur === line ? null : line))
  }

  const row = (line: StubLine, label: string, amount: string, opts: { note?: string; tone?: 'minus' | 'total' } = {}) => (
    <Row key={line} line={line} label={label} amount={amount} note={opts.note} tone={opts.tone} open={open === line} onToggle={toggle} />
  )

  const hoursText = `${number(Math.round(hours * 10) / 10)} hrs @ ${money(wage, { cents: true })}/hr`

  return (
    <div className={styles.stub}>
      <div className={styles.head}>
        <span className={styles.employer}>{job.employer}</span>
        <span className={styles.meta}>
          {view === 'check' ? PERIOD_LABEL[frequency] : 'Whole year'} · {hoursText}
        </span>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>Money in</span>
        {row('wages', 'Hourly pay', fmt(b.wages))}
        {b.tips > 0 && row('tips', 'Tips', fmt(b.tips))}
        {row('gross', 'Gross pay', fmt(b.gross), { tone: 'total' })}
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>Money out</span>
        {row('socialSecurity', 'Social Security', minus(b.socialSecurity), { note: '6.2%', tone: 'minus' })}
        {row('medicare', 'Medicare', minus(b.medicare), { note: '1.45%', tone: 'minus' })}
        {row('federal', 'Federal income tax', minus(b.federal), { note: 'est.', tone: 'minus' })}
        {row('state', 'State income tax', minus(b.state), { note: `${trimPct(stateRatePct)}%`, tone: 'minus' })}
      </div>

      <div className={styles.tear} aria-hidden>
        <Scissors size={16} strokeWidth={2.5} />
        <span className={styles.tearLine} />
      </div>

      <button type="button" className={styles.net} aria-expanded={open === 'takeHome'} onClick={() => toggle('takeHome')}>
        <span className={styles.netLabel}>
          Take-home pay
          <ChevronDown size={18} strokeWidth={3} className={open === 'takeHome' ? styles.chevOpen : styles.chev} />
        </span>
        <span className={styles.netValue}>{fmt(b.takeHome)}</span>
      </button>
      <Explain open={open === 'takeHome'} text={STUB_INFO.takeHome} />
    </div>
  )
}

function Row({
  line,
  label,
  amount,
  note,
  tone,
  open,
  onToggle,
}: {
  line: StubLine
  label: string
  amount: string
  note?: string
  tone?: 'minus' | 'total'
  open: boolean
  onToggle: (l: StubLine) => void
}) {
  return (
    <>
      <button type="button" className={[styles.row, tone === 'total' && styles.rowTotal].filter(Boolean).join(' ')} aria-expanded={open} onClick={() => onToggle(line)}>
        <span className={styles.rowLabel}>
          {label}
          {note && <span className={styles.note}>{note}</span>}
          <ChevronDown size={16} strokeWidth={3} className={open ? styles.chevOpen : styles.chev} />
        </span>
        <span className={[styles.amount, tone === 'minus' && styles.amountMinus].filter(Boolean).join(' ')}>{amount}</span>
      </button>
      <Explain open={open} text={STUB_INFO[line]} />
    </>
  )
}

function Explain({ open, text }: { open: boolean; text: string }) {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className={styles.explainWrap}
          initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        >
          <p className={styles.explain}>{text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const trimPct = (n: number) => (Number.isFinite(n) ? String(Math.round(n * 10) / 10) : '0')
