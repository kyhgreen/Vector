/*
  Debt Payoff Lab: three little labs for figuring out how long debt hangs
  around and what it really costs. Inputs are saved on the device a beat
  after you stop typing, so your numbers are waiting when you come back.
*/
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Segmented } from '../../components/ui'
import { EVENTS, type EventName } from '../../state/badges'
import { useToolState } from '../../state/hooks'
import { useGame } from '../../state/store'
import { CardTab } from './CardTab'
import { LoanTab } from './LoanTab'
import { SnowTab } from './SnowTab'
import { sanitizeDebt, type CardInputs, type DebtSave, type DebtTab, type LoanInputs, type SnowInputs } from './model'
import styles from './Debt.module.css'

const INITIAL: DebtSave | null = null

export default function DebtTool() {
  const age = useGame((s) => s.profile.age)
  const track = useGame((s) => s.track)
  const [stored, setStored] = useToolState<DebtSave | null>('debt', INITIAL)
  const [data, setData] = useState<DebtSave>(() => sanitizeDebt(stored, age))
  const reduce = useReducedMotion()

  // Save a beat after the last change, and once more on the way out.
  const latest = useRef(data)
  useEffect(() => {
    latest.current = data
    const t = setTimeout(() => setStored(data), 350)
    return () => clearTimeout(t)
  }, [data, setStored])
  useEffect(() => () => setStored(latest.current), [setStored])

  const tracked = useRef(new Set<EventName>())
  const mark = useCallback(
    (ev: EventName) => {
      if (tracked.current.has(ev)) return
      tracked.current.add(ev)
      track(ev)
    },
    [track],
  )

  const setCard = useCallback(
    (p: Partial<CardInputs>) => {
      setData((d) => ({ ...d, card: { ...d.card, ...p } }))
      mark(EVENTS.debtCalcUsed)
    },
    [mark],
  )
  const setLoan = useCallback(
    (p: Partial<LoanInputs>) => {
      setData((d) => ({ ...d, loan: { ...d.loan, ...p } }))
      mark(EVENTS.loanCalcUsed)
    },
    [mark],
  )
  const setSnow = useCallback(
    (p: Partial<SnowInputs>) => {
      setData((d) => ({ ...d, snow: { ...d.snow, ...p } }))
      mark(EVENTS.debtCalcUsed)
    },
    [mark],
  )

  const tab = data.tab
  const setTab = (t: DebtTab) => setData((d) => ({ ...d, tab: t }))

  return (
    <div className={styles.page}>
      <Segmented<DebtTab>
        value={tab}
        onChange={setTab}
        className={styles.tabs}
        options={[
          { value: 'card', label: <TabLabel wide="Credit card" narrow="Card" /> },
          { value: 'loan', label: <TabLabel wide="Loan" narrow="Loan" /> },
          { value: 'snow', label: <TabLabel wide="Snowball vs. avalanche" narrow="Snowball" /> },
        ]}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          role="tabpanel"
        >
          {tab === 'card' && <CardTab value={data.card} onChange={setCard} />}
          {tab === 'loan' && <LoanTab value={data.loan} onChange={setLoan} age={age} />}
          {tab === 'snow' && <SnowTab value={data.snow} onChange={setSnow} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TabLabel({ wide, narrow }: { wide: string; narrow: string }) {
  return (
    <span className={styles.tabLabel}>
      <span className={styles.wide}>{wide}</span>
      <span className={styles.narrow}>{narrow}</span>
    </span>
  )
}
