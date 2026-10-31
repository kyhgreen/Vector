/* Loan tab: monthly payment, true cost, and how longer terms quietly cost more. */
import { motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { DonutChart } from '../../components/Charts'
import { Callout, Empty, Field, MoneyInput, Segmented, Slider } from '../../components/ui'
import { money, moneyShort, plural } from '../../lib/format'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { LIMITS, loanDefaults, loanStats, termCompare, type LoanInputs, type LoanKind } from './model'
import { SectionHead } from './parts'
import styles from './Debt.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

export function LoanTab({ value, onChange, age }: { value: LoanInputs; onChange: (p: Partial<LoanInputs>) => void; age: number }) {
  const reduce = useReducedMotion()
  const { kind, amount, rate, years } = value
  const stats = useMemo(() => loanStats(amount, rate, years), [amount, rate, years])
  const rows = useMemo(() => termCompare(value), [value])
  const maxInterest = Math.max(1, ...rows.map((r) => r.interest))
  const short = rows.find((r) => r.years === 3) ?? rows[0]
  const long = rows.find((r) => r.years === 7) ?? rows[rows.length - 1]

  return (
    <div className={styles.stack}>
      <div className={styles.inputs}>
        <Segmented<LoanKind>
          value={kind}
          onChange={(k) => {
            if (k !== kind) onChange(loanDefaults(k, age))
          }}
          options={[
            { value: 'car', label: 'Car loan' },
            { value: 'student', label: 'Student loan' },
          ]}
        />
        <div className={styles.grid2}>
          <Field label="Amount">
            <MoneyInput value={amount} onChange={(n) => onChange({ amount: Math.max(0, n) })} max={LIMITS.amount} ariaLabel="Loan amount in dollars" />
          </Field>
          <Field label="APR" hint="Yearly interest rate">
            <MoneyInput value={rate} onChange={(n) => onChange({ rate: Math.max(0, n) })} prefix="" suffix="%" max={LIMITS.rate} step={0.1} ariaLabel="Interest rate in percent" />
          </Field>
        </div>
        <Slider label="Years to pay it back" value={years} min={LIMITS.yearsMin} max={LIMITS.yearsMax} step={1} display={plural(years, 'year')} color="blue" onChange={(n) => onChange({ years: n })} />
      </div>

      {amount <= 0 ? (
        <Empty emoji="📄" title="No loan yet">
          Type in an amount to see the payment.
        </Empty>
      ) : (
        <>
          <section className={styles.loanTop} aria-live="polite" aria-label="Your loan">
            <div className={styles.loanPay}>
              <p className={styles.loanPayNum}>
                {money(stats.payment)}
                <span className={styles.loanPer}>/mo</span>
              </p>
              <p className={styles.muted}>for {plural(stats.months, 'month')}</p>
              <p className={styles.loanLine}>
                {stats.interest <= 0.5 ? (
                  'At 0%, you pay back exactly what you borrowed.'
                ) : (
                  <>
                    Interest adds <strong className={styles.bad}>{money(stats.interest)}</strong>, so borrowing {money(amount)} costs <strong>{money(stats.totalPaid)}</strong> in total.
                  </>
                )}
              </p>
            </div>
            <div className={styles.donut}>
              <DonutChart
                size={150}
                segments={[
                  { name: 'What you borrowed', value: amount },
                  { name: 'Interest', value: stats.interest },
                ]}
                center={moneyShort(stats.totalPaid)}
                sub="total"
                format={moneyShort}
              />
            </div>
          </section>

          <section className={styles.section} aria-labelledby="loan-terms">
            <SectionHead id="loan-terms">3, 5, or 7 years</SectionHead>
            <div className={styles.terms}>
              {rows.map((r) => (
                <button
                  key={r.years}
                  type="button"
                  className={cx(styles.term, r.yours && styles.termOn)}
                  aria-pressed={r.yours}
                  onClick={() => {
                    sfx.tap()
                    haptic.tap()
                    onChange({ years: r.years })
                  }}
                >
                  <span className={styles.termTop}>
                    <span className={styles.termYears}>{plural(r.years, 'year')}</span>
                    <span className={styles.termPay}>{money(r.payment)}/mo</span>
                  </span>
                  <span className={styles.termBarTrack} aria-hidden>
                    <motion.span
                      className={styles.termBar}
                      initial={false}
                      animate={{ width: `${Math.max(2, (r.interest / maxInterest) * 100)}%` }}
                      transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                  <span className={styles.termSub}>
                    {money(r.interest)} interest, {money(r.totalPaid)} total
                  </span>
                </button>
              ))}
            </div>
            <p className={styles.note}>
              {long.interest - short.interest < 1
                ? 'At 0%, the length changes the payment but not the total.'
                : `Going from 3 to 7 years cuts the payment by ${money(short.payment - long.payment)} a month and adds ${money(long.interest - short.interest)} in interest.`}
            </p>
          </section>
        </>
      )}

      {kind === 'car' ? (
        <Callout emoji="💡" color="orange">
          When a seller asks what monthly payment works, ask for the total cost instead.
        </Callout>
      ) : (
        <Callout emoji="💡" color="purple">
          Many student loans charge interest while you're still in school, so paying early helps.
        </Callout>
      )}
    </div>
  )
}
