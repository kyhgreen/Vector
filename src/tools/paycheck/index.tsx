/*
  Paycheck Calculator: hourly wage in, take-home pay out, with a pay stub
  you can tap to decode. All math lives in tax.ts.
*/
import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useMemo, useRef, type ReactNode } from 'react'
import { Callout, MoneyInput, Segmented, Slider, Toggle } from '../../components/ui'
import { DonutChart } from '../../components/Charts'
import { useGame } from '../../state/store'
import { useToolState } from '../../state/hooks'
import { EVENTS } from '../../state/badges'
import { money, number, percent } from '../../lib/format'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { PayStub } from './PayStub'
import { CUSTOM_JOB, HOUR_ITEMS, JOBS, KID_INITIAL, TEEN_INITIAL, jobById, sanitize, type PaycheckState, type StubView } from './data'
import { LIMITS, ROUGH_ABOVE, estimatePaycheck, roundBreakdown, type PayFrequency } from './tax'
import styles from './Paycheck.module.css'

const PERIOD: Record<PayFrequency, string> = { weekly: 'Every week', biweekly: 'Every 2 weeks' }

export default function PaycheckTool() {
  const age = useGame((s) => s.profile.age)
  const track = useGame((s) => s.track)
  const kid = age >= 11 && age <= 14
  const base = kid ? KID_INITIAL : TEEN_INITIAL
  const [raw, setRaw] = useToolState<PaycheckState>('paycheck', base)
  const s = sanitize(raw, base)
  const reduce = useReducedMotion()

  // Count the tool as "used" the first time someone changes anything (once per visit).
  const used = useRef(false)
  const markUsed = useCallback(() => {
    if (used.current) return
    used.current = true
    track(EVENTS.paycheckCalcUsed)
  }, [track])

  const update = (patch: Partial<PaycheckState>) => {
    setRaw((prev) => ({ ...sanitize(prev, base), ...patch }))
    markUsed()
  }

  const r = useMemo(
    () =>
      estimatePaycheck({
        wage: s.wage,
        hoursPerWeek: s.hours,
        tipsPerWeek: s.tipsOn ? s.tips : 0,
        stateRatePct: s.stateRate,
        frequency: s.frequency,
      }),
    [s.wage, s.hours, s.tipsOn, s.tips, s.stateRate, s.frequency],
  )

  const job = jobById(s.jobId)
  const view: StubView = s.view
  // The year view shows whole dollars, so re-round its lines to keep the stub adding up.
  const b = view === 'check' ? r.perCheck : roundBreakdown(r.perYear, false)
  const cents = view === 'check'
  const fmt = (n: number) => money(n, { cents })
  const hasPay = r.perYear.gross > 0.5
  const teenHoursCap = age >= 14 && age <= 15 && s.hours > 18

  const pickJob = (id: string) => {
    sfx.coin()
    haptic.tap()
    if (id === CUSTOM_JOB.id) return update({ jobId: id })
    const j = jobById(id)
    update({ jobId: j.id, wage: j.wage, hours: j.hours, tipsOn: j.tips > 0, tips: j.tips > 0 ? j.tips : s.tips })
  }

  return (
    <div className={styles.page}>
      {/* ---------- Job picker ---------- */}
      <Reveal i={0} reduce={reduce}>
        <h2 className={styles.h2}>Pick a job</h2>
        <div className={styles.chips} role="group" aria-label="Starter jobs">
          {[...JOBS, CUSTOM_JOB].map((j) => (
            <button key={j.id} type="button" className={[styles.chip, s.jobId === j.id && styles.chipOn].filter(Boolean).join(' ')} aria-pressed={s.jobId === j.id} onClick={() => pickJob(j.id)}>
              <span className={styles.chipEmoji} aria-hidden>
                {j.emoji}
              </span>
              {j.name}
            </button>
          ))}
        </div>
      </Reveal>

      {/* ---------- Inputs ---------- */}
      <Reveal i={1} reduce={reduce}>
        <div className={styles.inputs}>
          <div className={styles.field}>
            <span className={styles.label}>Hourly wage</span>
            <MoneyInput value={s.wage} onChange={(n) => update({ wage: n })} suffix="/hr" max={LIMITS.wageMax} ariaLabel="Hourly wage in dollars" />
            {s.wage > 0 && s.wage < 7.25 && (
              <span className={styles.hint}>
                {s.tipsOn ? 'Tipped jobs can pay less, as long as tips reach minimum wage.' : "That's under the $7.25 federal minimum wage."}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <Slider label="Hours a week" min={LIMITS.hoursMin} max={LIMITS.hoursMax} value={s.hours} onChange={(n) => update({ hours: n })} display={`${s.hours} hrs`} color="green" />
            {teenHoursCap && <span className={styles.hint}>At 14 or 15, the federal limit is 18 hours in a school week.</span>}
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Payday</span>
            <Segmented<PayFrequency>
              value={s.frequency}
              onChange={(v) => update({ frequency: v })}
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'biweekly', label: 'Every 2 weeks' },
              ]}
            />
          </div>

          <Toggle checked={s.tipsOn} onChange={(v) => update({ tipsOn: v })} label="I get tips" />
          {s.tipsOn && (
            <motion.div className={styles.field} initial={reduce ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
              <span className={styles.label}>Tips a week</span>
              <MoneyInput value={s.tips} onChange={(n) => update({ tips: n })} suffix="/wk" max={LIMITS.tipsMax} ariaLabel="Tips per week in dollars" />
            </motion.div>
          )}

          <div className={styles.field}>
            <Slider label="State income tax" min={0} max={LIMITS.stateMax} step={0.5} value={s.stateRate} onChange={(n) => update({ stateRate: n })} display={percent(s.stateRate, s.stateRate % 1 ? 1 : 0)} color="green" />
            <span className={styles.hint}>Some states have no income tax. If you're not sure, 4% is a reasonable estimate.</span>
          </div>
        </div>
      </Reveal>

      {!hasPay ? (
        <Reveal i={2} reduce={reduce}>
          <div className={styles.empty}>
            <p className={styles.muted}>Add an hourly wage to see your paycheck.</p>
          </div>
        </Reveal>
      ) : (
        <>
          {/* ---------- Big number ---------- */}
          <Reveal i={2} reduce={reduce}>
            <div className={styles.hero}>
              <span className={styles.muted}>You take home</span>
              <span className={styles.heroValue}>{money(r.perCheck.takeHome, { cents: true })}</span>
              <span className={styles.heroSub}>
                {PERIOD[s.frequency]}, from {money(r.perCheck.gross, { cents: true })} before taxes. That's {money(r.realHourly, { cents: true })} an hour.
              </span>
            </div>
          </Reveal>

          {/* ---------- Pay stub ---------- */}
          <Reveal i={3} reduce={reduce}>
            <div className={styles.sectionHead}>
              <h2 className={styles.h2}>Your pay stub</h2>
              <span className={styles.tapHint}>Tap a line to see what it means</span>
            </div>
            <Segmented<StubView>
              value={view}
              onChange={(v) => update({ view: v })}
              options={[
                { value: 'check', label: 'Per paycheck' },
                { value: 'year', label: 'Per year' },
              ]}
            />
            <PayStub
              b={b}
              view={view}
              job={job}
              frequency={s.frequency}
              wage={s.wage}
              hours={view === 'check' ? r.hoursPerCheck : s.hours * 52}
              stateRatePct={s.stateRate}
            />
          </Reveal>

          {/* ---------- Donut ---------- */}
          <Reveal i={4} reduce={reduce}>
            <h2 className={styles.h2}>Where your pay goes</h2>
            <div className={styles.donut}>
              <DonutChart
                segments={[
                  { name: 'Take-home', value: b.takeHome, color: 'var(--chart-4)' },
                  { name: 'Social Security + Medicare', value: b.socialSecurity + b.medicare, color: 'var(--chart-1)' },
                  { name: 'Federal tax', value: b.federal, color: 'var(--chart-2)' },
                  { name: 'State tax', value: b.state, color: 'var(--chart-3)' },
                ]}
                center={`${Math.round(r.keepRate * 100)}%`}
                sub="you keep"
                format={fmt}
              />
            </div>
          </Reveal>

          {/* ---------- Cost in hours ---------- */}
          <Reveal i={5} reduce={reduce}>
            <Hours realHourly={r.realHourly} price={s.price} onPrice={(n) => update({ price: n })} />
          </Reveal>
        </>
      )}

      <Reveal i={6} reduce={reduce}>
        <Callout color={kid ? 'yellow' : 'green'}>
          {kid
            ? 'Most states let you start a part-time job around 14 to 16.'
            : 'If income tax was withheld, filing a tax return can often get it back.'}
        </Callout>
      </Reveal>

      <p className={styles.fine}>
        A simplified estimate, good for learning, not for filing.
        {r.perYear.gross > ROUGH_ABOVE ? ' Less accurate above $100,000 a year.' : ''}
      </p>
    </div>
  )
}

function formatHours(h: number): string {
  if (!Number.isFinite(h) || h <= 0) return '0 min'
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`
  const v = h < 10 ? Math.round(h * 10) / 10 : Math.round(h)
  return `${v < 10 ? v : number(v)} ${v === 1 ? 'hr' : 'hrs'}`
}

function Hours({ realHourly, price, onPrice }: { realHourly: number; price: number; onPrice: (n: number) => void }) {
  const ok = realHourly > 0
  const custom = ok && price > 0 ? price / realHourly : 0
  return (
    <>
      <h2 className={styles.h2}>Prices in hours of work</h2>
      <ul className={styles.hourList}>
        {HOUR_ITEMS.map((it) => (
          <li key={it.name} className={styles.hourRow}>
            <span>
              {it.name} <span className={styles.faint}>{money(it.price)}</span>
            </span>
            <span className={styles.hourValue}>{ok ? formatHours(it.price / realHourly) : 'n/a'}</span>
          </li>
        ))}
      </ul>
      <div className={styles.field}>
        <span className={styles.label}>Try any price</span>
        <MoneyInput value={price} onChange={onPrice} max={100_000} ariaLabel="Price of something you want" placeholder="45" />
        <p className={styles.priceAnswer} aria-live="polite">
          {price > 0 ? (
            <>
              That's <strong>{formatHours(custom)}</strong> of work.
            </>
          ) : (
            'Type a price to see the hours.'
          )}
        </p>
      </div>
    </>
  )
}

/** Slides each section up a little as the page appears. */
function Reveal({ i, reduce, children }: { i: number; reduce: boolean | null; children: ReactNode }) {
  return (
    <motion.section
      className={styles.section}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30, delay: Math.min(i, 8) * 0.04 }}
    >
      {children}
    </motion.section>
  )
}
