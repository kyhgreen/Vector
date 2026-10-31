/* Small pieces shared by the three Debt Payoff Lab tabs. */
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import styles from './Debt.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

export type Tone = 'good' | 'bad' | 'warn' | 'meh'
const TONE: Record<Tone, string> = { good: styles.vGood, bad: styles.vBad, warn: styles.vWarn, meh: styles.vMeh }

/** The verdict at the top of each result: a tinted box with a heading and a line or two. */
export function Verdict({ tone, title, children, popKey }: { tone: Tone; title: ReactNode; children?: ReactNode; popKey?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      key={popKey}
      className={cx(styles.verdict, TONE[tone])}
      initial={reduce ? false : { opacity: 0.4, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-live="polite"
    >
      <h2 className={styles.verdictTitle}>{title}</h2>
      {children && <div className={styles.verdictBody}>{children}</div>}
    </motion.div>
  )
}

export interface CompareRow {
  label: ReactNode
  values: [ReactNode, ReactNode]
  tones?: [('good' | 'bad' | undefined)?, ('good' | 'bad' | undefined)?]
}

/** A plain two-column comparison table. */
export function Compare({ caption, heads, rows }: { caption: string; heads: [ReactNode, ReactNode]; rows: CompareRow[] }) {
  const t = (x?: 'good' | 'bad') => (x === 'good' ? styles.good : x === 'bad' ? styles.bad : undefined)
  return (
    <table className={styles.table}>
      <caption className={styles.srOnly}>{caption}</caption>
      <thead>
        <tr>
          <td />
          <th scope="col">{heads[0]}</th>
          <th scope="col">{heads[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <th scope="row">{r.label}</th>
            <td className={t(r.tones?.[0])}>{r.values[0]}</td>
            <td className={t(r.tones?.[1])}>{r.values[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Section heading with an optional bit on the right. */
export function SectionHead({ id, children, right }: { id?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className={styles.sectionHead}>
      <h2 id={id} className={styles.h2}>
        {children}
      </h2>
      {right}
    </div>
  )
}
