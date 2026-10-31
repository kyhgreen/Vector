/* Snowball vs. Avalanche: two famous ways to knock out a pile of debts. */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton } from '../../components/Button'
import { LineChart } from '../../components/Charts'
import { Callout, Empty, Field, MoneyInput, TextInput } from '../../components/ui'
import { duration, money, moneyShort } from '../../lib/format'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { LIMITS, activeDebts, balanceAt, budgetTooSmall, chartMonths, isTie, monthLabel, simulate, SNOW_DEFAULTS, type DebtItem, type SnowInputs, type StrategyResult } from './model'
import { Compare, SectionHead, Verdict } from './parts'
import styles from './Debt.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')
const NEW_NAMES = ['Money owed to a cousin', 'Laptop payment plan', 'Gas station card', 'Furniture financing']

const INFO = {
  snowball: { name: 'Snowball', rule: 'smallest balance first' },
  avalanche: { name: 'Avalanche', rule: 'highest interest first' },
} as const

export function SnowTab({ value, onChange }: { value: SnowInputs; onChange: (p: Partial<SnowInputs>) => void }) {
  const reduce = useReducedMotion()
  const { debts, extra } = value
  const active = useMemo(() => activeDebts(debts), [debts])
  const snow = useMemo(() => simulate(debts, extra, 'snowball'), [debts, extra])
  const aval = useMemo(() => simulate(debts, extra, 'avalanche'), [debts, extra])
  const base = useMemo(() => simulate(debts, 0, 'avalanche'), [debts])
  const stuck = budgetTooSmall(debts, extra)
  const never = snow.never || aval.never

  const update = (id: number, p: Partial<DebtItem>) => onChange({ debts: debts.map((d) => (d.id === id ? { ...d, ...p } : d)) })
  const remove = (id: number) => {
    sfx.tap()
    haptic.tap()
    onChange({ debts: debts.filter((d) => d.id !== id) })
  }
  const add = () => {
    if (debts.length >= LIMITS.debts) return
    const name = NEW_NAMES.find((n) => !debts.some((d) => d.name === n)) ?? `Debt ${debts.length + 1}`
    onChange({ debts: [...debts, { id: value.nextId, name, balance: 500, apr: 18, min: 25 }], nextId: value.nextId + 1 })
  }

  const loadExamples = () => {
    const ex = SNOW_DEFAULTS.debts.map((d, i) => ({ ...d, id: value.nextId + i }))
    onChange({ debts: ex, nextId: value.nextId + ex.length })
  }

  const chart = useMemo(() => {
    if (!active.length || never) return null
    const span = Math.max(snow.months, aval.months)
    const months = chartMonths(span)
    const end = months[months.length - 1]
    return {
      labels: months.map((m) => monthLabel(m, end)),
      series: [
        { name: 'Snowball', values: months.map((m) => balanceAt(snow.balances, m)), slot: 1 as const },
        { name: 'Avalanche', values: months.map((m) => balanceAt(aval.balances, m)), slot: 2 as const, dashed: true },
      ],
    }
  }, [active.length, never, snow, aval])

  const saved = never ? 0 : snow.totalInterest - aval.totalInterest
  const cheaper: 'snowball' | 'avalanche' | null = saved > 0.5 ? 'avalanche' : saved < -0.5 ? 'snowball' : null
  const quicker: 'snowball' | 'avalanche' | null = snow.firstWin < aval.firstWin ? 'snowball' : aval.firstWin < snow.firstWin ? 'avalanche' : null
  const tie = isTie(snow, aval)
  const fastest = Math.min(snow.months, aval.months)
  // One plan can stall while the other finishes: a debt whose minimum doesn't cover its own interest grows while that plan pays something else.
  const loser = snow.never && !aval.never ? 'snowball' : aval.never && !snow.never ? 'avalanche' : null
  const neverLine = loser
    ? `One debt grows while ${INFO[loser].name.toLowerCase()} pays the others. ${INFO[loser === 'snowball' ? 'avalanche' : 'snowball'].name} finishes in ${duration(fastest)}.`
    : stuck
      ? "Your payments don't cover the interest, so the debt grows either way."
      : "It still isn't paid off after 50 years."

  return (
    <div className={styles.stack}>
      <ul className={styles.methods}>
        {(['snowball', 'avalanche'] as const).map((k) => (
          <li key={k}>
            <strong>{INFO[k].name}:</strong> {INFO[k].rule}. {k === 'snowball' ? 'You pay off your first debt sooner.' : 'You usually pay less interest.'}
          </li>
        ))}
      </ul>

      <section className={styles.section} aria-labelledby="snow-debts">
        <SectionHead id="snow-debts" right={<span className={styles.hint}>{debts.length} of {LIMITS.debts}</span>}>
          Your debts
        </SectionHead>
        {debts.length === 0 ? (
          <div className={styles.emptyBox}>
            <Empty emoji="📋" title="No debts yet" />
            <Button color="blue" onClick={loadExamples}>
              Use examples
            </Button>
          </div>
        ) : (
          <div className={styles.debtList}>
            <AnimatePresence initial={false}>
              {debts.map((d, i) => (
                <motion.div
                  key={d.id}
                  layout={!reduce}
                  className={styles.debt}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.debtHead}>
                    <span className={styles.debtNum} aria-hidden>
                      {i + 1}.
                    </span>
                    <TextInput
                      value={d.name}
                      maxLength={LIMITS.name}
                      placeholder={`Debt ${i + 1}`}
                      aria-label={`Name of debt ${i + 1}`}
                      className={styles.debtName}
                      onChange={(e) => update(d.id, { name: e.target.value.slice(0, LIMITS.name) })}
                    />
                    <IconButton label={`Remove ${d.name.trim() || `debt ${i + 1}`}`} onClick={() => remove(d.id)} className={styles.trash}>
                      <Trash2 size={18} strokeWidth={2.25} />
                    </IconButton>
                  </div>
                  <div className={cx(styles.grid3, styles.compact)}>
                    <Field label="Balance">
                      <MoneyInput value={d.balance} onChange={(n) => update(d.id, { balance: Math.max(0, n) })} max={LIMITS.balance} ariaLabel={`Balance of debt ${i + 1}`} />
                    </Field>
                    <Field label="APR">
                      <MoneyInput value={d.apr} onChange={(n) => update(d.id, { apr: Math.max(0, n) })} prefix="" suffix="%" max={LIMITS.apr} step={0.1} ariaLabel={`APR of debt ${i + 1}`} />
                    </Field>
                    <Field label="Minimum">
                      <MoneyInput value={d.min} onChange={(n) => update(d.id, { min: Math.max(0, n) })} max={LIMITS.min} ariaLabel={`Minimum payment of debt ${i + 1}`} />
                    </Field>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        {debts.length < LIMITS.debts && (
          <Button variant="outline" icon={<Plus size={18} strokeWidth={2.5} />} block onClick={add}>
            Add a debt
          </Button>
        )}
      </section>

      <Field label="Extra each month" hint="On top of the minimums">
        <MoneyInput value={extra} onChange={(n) => onChange({ extra: Math.max(0, n) })} max={LIMITS.extra} ariaLabel="Extra money each month in dollars" />
      </Field>

      {active.length === 0 ? (
        debts.length > 0 && (
          <Empty emoji="🧮" title="Nothing to pay off">
            Give a debt a balance to compare the plans.
          </Empty>
        )
      ) : never ? (
        <Verdict tone="bad" title={loser ? `${INFO[loser].name} never finishes` : 'This never gets paid off'} popKey="never">
          <p>
            {neverLine} Add extra money or raise a minimum.
          </p>
        </Verdict>
      ) : (
        <>
          <Verdict
            tone="good"
            title={tie ? "It's a tie" : cheaper === 'avalanche' ? `Avalanche saves ${money(saved)}` : cheaper === 'snowball' ? `Snowball saves ${money(-saved)}` : 'Nearly the same'}
            popKey={tie ? 'tie' : 'race'}
          >
            <p>
              {tie
                ? 'Both plans pick the same order here.'
                : [
                    cheaper === 'snowball' ? 'Rare, but with these numbers snowball costs less.' : cheaper === null ? 'They cost about the same.' : '',
                    quicker === 'snowball' ? `Snowball pays off its first debt sooner, in month ${snow.firstWin}.` : quicker === 'avalanche' ? `Avalanche pays off its first debt sooner, in month ${aval.firstWin}.` : '',
                    "Pick the plan you're most likely to keep following.",
                  ]
                    .filter(Boolean)
                    .join(' ')}
            </p>
          </Verdict>

          <Compare
            caption="Snowball compared with avalanche"
            heads={['Snowball', 'Avalanche']}
            rows={[
              { label: 'Debt-free in', values: [duration(snow.months), duration(aval.months)] },
              { label: 'Interest', values: [money(snow.totalInterest), money(aval.totalInterest)], tones: [cheaper === 'snowball' ? 'good' : undefined, cheaper === 'avalanche' ? 'good' : undefined] },
              { label: 'First debt gone', values: [`Month ${snow.firstWin}`, `Month ${aval.firstWin}`], tones: [quicker === 'snowball' ? 'good' : undefined, quicker === 'avalanche' ? 'good' : undefined] },
            ]}
          />
          {Number.isFinite(base.months) && base.months > fastest && extra > 0 && (
            <p className={styles.note}>
              Without the extra {money(extra)}, it'd take {duration(base.months)} instead of {duration(fastest)}.
            </p>
          )}

          <div className={styles.orders}>
            {[snow, aval].map((r) => (
              <PayoffOrder key={r.strategy} r={r} />
            ))}
          </div>

          {chart && (
            <section className={styles.section} aria-labelledby="snow-chart">
              <SectionHead id="snow-chart">Total debt over time</SectionHead>
              <LineChart xLabels={chart.labels} series={chart.series} format={moneyShort} tooltipFormat={(n) => money(n)} ariaLabel="Total debt over time for snowball and avalanche" />
            </section>
          )}
        </>
      )}

      <Callout emoji="💡" color="purple">
        The extra money matters more than which plan you pick.
      </Callout>
    </div>
  )
}

function PayoffOrder({ r }: { r: StrategyResult }) {
  const name = INFO[r.strategy].name
  return (
    <div className={styles.order}>
      <h3 className={styles.orderHead}>{name} order</h3>
      <ol className={styles.orderList} aria-label={`${name} payoff order`}>
        {r.order.map((p) => (
          <li key={p.id} className={styles.orderItem}>
            <span>{p.name}</span>
            <span className={styles.orderMonth}>month {p.month}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
