/* Credit card tab: minimum payments vs. your payment, side by side. */
import { useMemo } from 'react'
import { LineChart } from '../../components/Charts'
import { Callout, Empty, Field, MoneyInput, Slider } from '../../components/ui'
import { duration, money, moneyShort } from '../../lib/format'
import { loanPayment } from '../../lib/finance'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { LIMITS, balanceAt, cardCompare, growingBalances, chartMonths, monthLabel, type CardInputs } from './model'
import { Compare, SectionHead, Verdict } from './parts'
import styles from './Debt.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')
const ceil5 = (n: number) => Math.max(5, Math.ceil(n / 5) * 5)

export function CardTab({ value, onChange }: { value: CardInputs; onChange: (p: Partial<CardInputs>) => void }) {
  const { balance, apr, payment } = value
  const r = useMemo(() => cardCompare(value), [value])
  const { min, mine } = r

  const sliderMax = Math.max(50, ceil5(balance * (1 + apr / 1200)))
  const presets = useMemo(() => {
    if (balance <= 0) return []
    const minimum = Math.ceil(r.firstMin)
    const list = [
      { label: 'Minimum', amount: minimum },
      { label: 'Gone in 2 years', amount: Math.ceil(loanPayment(balance, apr, 24)) },
      { label: 'Gone in 1 year', amount: Math.ceil(loanPayment(balance, apr, 12)) },
    ]
    return list.filter((p, i) => Number.isFinite(p.amount) && p.amount > 0 && (i === 0 || p.amount > minimum))
  }, [balance, apr, r.firstMin])

  const chart = useMemo(() => {
    if (balance <= 0 || min.never) return null
    const span = mine.never ? Math.min(120, min.months) : Math.max(min.months, mine.months)
    const months = chartMonths(span)
    const end = months[months.length - 1]
    const mineList = mine.never ? growingBalances(balance, apr, payment, end) : mine.balances
    return {
      labels: months.map((m) => monthLabel(m, end)),
      series: [
        { name: 'Your payment', values: months.map((m) => balanceAt(mineList, m)), slot: 1 as const, area: true },
        { name: 'Minimum only', values: months.map((m) => balanceAt(min.balances, m)), slot: 2 as const, dashed: true },
      ],
    }
  }, [balance, apr, payment, min, mine])

  const savedInterest = !mine.never && !min.never ? min.totalInterest - mine.totalInterest : 0
  const savedMonths = !mine.never && !min.never ? min.months - mine.months : 0
  const verdict = balance <= 0 ? 'none' : mine.never ? 'never' : r.belowMin ? 'below' : savedMonths > 0 ? 'better' : 'same'
  const better = savedMonths > 0
  // A payment can beat the interest and still take 50+ years (low APR, big balance).
  const shrinking = payment > r.interest

  return (
    <div className={styles.stack}>
      <div className={styles.inputs}>
        <div className={styles.grid2}>
          <Field label="Card balance">
            <MoneyInput value={balance} onChange={(n) => onChange({ balance: Math.max(0, n) })} max={LIMITS.balance} ariaLabel="Card balance in dollars" />
          </Field>
          <Field label="APR" hint="Yearly interest rate">
            <MoneyInput value={apr} onChange={(n) => onChange({ apr: Math.max(0, n) })} prefix="" suffix="%" max={LIMITS.apr} step={0.1} ariaLabel="APR in percent" />
          </Field>
        </div>
        <Field label="You pay each month">
          <MoneyInput value={payment} onChange={(n) => onChange({ payment: Math.max(0, n) })} max={LIMITS.payment} ariaLabel="Your monthly payment in dollars" />
        </Field>
        {balance > 0 && (
          <Slider
            label="Try other amounts"
            value={Math.min(payment, sliderMax)}
            min={0}
            max={sliderMax}
            step={5}
            display={`${money(payment)}/mo`}
            color="red"
            onChange={(n) => onChange({ payment: n })}
          />
        )}
        {presets.length > 0 && (
          <div className={styles.presets} role="group" aria-label="Quick payment picks">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                className={cx(styles.preset, Math.round(payment) === p.amount && styles.presetOn)}
                aria-pressed={Math.round(payment) === p.amount}
                onClick={() => {
                  sfx.tap()
                  haptic.tap()
                  onChange({ payment: p.amount })
                }}
              >
                <span className={styles.presetAmount}>{money(p.amount)}</span>
                <span className={styles.presetLabel}>{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {verdict === 'none' ? (
        <Empty emoji="💳" title="No balance">
          Type in a balance to see how long it takes to pay off.
        </Empty>
      ) : (
        <>
          {verdict === 'never' && (
            <Verdict tone="bad" title="This never gets paid off" popKey="never">
              <p>
                {payment <= 0
                  ? `At $0 a month the balance ${apr > 0 ? 'only grows' : 'never moves'}.`
                  : shrinking
                    ? apr > 0
                      ? `${money(payment)} barely beats the ${money(r.interest, { cents: true })} monthly interest, so it takes over 50 years.`
                      : `At ${money(payment)} a month it takes over 50 years.`
                    : `Interest adds about ${money(r.interest, { cents: true })} a month and ${money(payment)} doesn't cover it, so the balance keeps growing.`}
              </p>
              <p>
                {!shrinking && apr > 0 && `Pay more than ${money(Math.ceil(r.interest + 1))} to start shrinking it. `}
                The minimum ({money(r.firstMin)}) clears it in {duration(min.months)}.
              </p>
            </Verdict>
          )}
          {verdict === 'below' && (
            <Verdict tone="warn" title="Below the minimum" popKey="below">
              <p>Paying less than the {money(r.firstMin)} minimum counts as a missed payment, with late fees and a credit score hit.</p>
            </Verdict>
          )}
          {verdict === 'better' && (
            <Verdict tone="good" title={`Debt-free in ${duration(mine.months)}`} popKey="better">
              <p>
                That's {duration(savedMonths)} sooner than the minimum, and <strong className={styles.good}>{money(savedInterest)}</strong> less interest.
              </p>
            </Verdict>
          )}
          {verdict === 'same' && (
            <Verdict tone="meh" title={`Debt-free in ${duration(mine.months)}`} popKey="same">
              <p>About as slow as the minimum. Even $20 more a month helps.</p>
            </Verdict>
          )}

          <Compare
            caption="Minimum payments compared with your payment"
            heads={[
              <>
                Minimum only<span className={styles.thSub}>from {money(r.firstMin)}/mo</span>
              </>,
              <>
                You<span className={styles.thSub}>{money(payment)}/mo</span>
              </>,
            ]}
            rows={
              mine.never
                ? [
                    { label: 'Time', values: [duration(min.months), 'Never'], tones: [undefined, 'bad'] },
                    { label: 'Interest', values: [money(min.totalInterest), 'Endless'], tones: [undefined, 'bad'] },
                    { label: 'Total paid', values: [money(min.totalPaid), 'Endless'] },
                  ]
                : [
                    { label: 'Time', values: [duration(min.months), duration(mine.months)], tones: [better ? 'bad' : undefined, better ? 'good' : undefined] },
                    { label: 'Interest', values: [money(min.totalInterest), money(mine.totalInterest)], tones: [savedInterest > 0 ? 'bad' : undefined, savedInterest > 0 ? 'good' : undefined] },
                    { label: 'Total paid', values: [money(min.totalPaid), money(mine.totalPaid)] },
                  ]
            }
          />

          {chart && (
            <section className={styles.section} aria-labelledby="card-chart">
              <SectionHead id="card-chart">Balance over time</SectionHead>
              <LineChart
                xLabels={chart.labels}
                series={chart.series}
                format={moneyShort}
                tooltipFormat={(n) => money(n)}
                ariaLabel="Card balance over time with your payment and with minimum payments only"
              />
            </section>
          )}
        </>
      )}

      <Callout emoji="💡" color="blue">
        If you pay the full balance every month, you pay $0 in interest.
      </Callout>
    </div>
  )
}
