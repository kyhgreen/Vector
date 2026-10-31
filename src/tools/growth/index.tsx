/*
  Growth Calculator: compound interest you can poke at. Four sliders, a
  snowballing chart, and a race between two savers who start ten years apart.
*/
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '../../components/Button'
import { LineChart } from '../../components/Charts'
import { Card } from '../../components/ui'
import { celebrate } from '../../lib/confetti'
import { money, plural } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { EVENTS } from '../../state/badges'
import { useToolState } from '../../state/hooks'
import { useGame } from '../../state/store'
import { RangeRow } from './RangeRow'
import {
  ageThen,
  calculate,
  defaultsFor,
  EARLY_AGE,
  earlyBird,
  earlyBirdLine,
  LATE_AGE,
  MILLION,
  MONTHLY_STOPS,
  PRESETS,
  RATE,
  rateLabel,
  ruleOf72,
  sanitize,
  shareLine,
  START_STOPS,
  STOP_AGE,
  YEARS,
  type GrowthInputs,
} from './logic'
import styles from './Growth.module.css'

const TOOL_ID = 'growth'
const INITIAL: GrowthInputs | null = null

const RATE_VALUES = Array.from({ length: Math.round((RATE.max - RATE.min) / RATE.step) + 1 }, (_, i) => RATE.min + i * RATE.step)
const YEAR_VALUES = Array.from({ length: YEARS.max - YEARS.min + 1 }, (_, i) => YEARS.min + i)

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')
const same = (a: GrowthInputs, b: GrowthInputs) => a.start === b.start && a.monthly === b.monthly && a.rate === b.rate && a.years === b.years

export default function GrowthTool() {
  const navigate = useNavigate()
  const age = useGame((s) => s.profile.age)
  const track = useGame((s) => s.track)
  const [stored, setStored] = useToolState<GrowthInputs | null>(TOOL_ID, INITIAL)

  // Sliders move fast, so we keep a local copy and save to the device a beat later.
  const [inputs, setInputs] = useState<GrowthInputs>(() => sanitize(stored, age))
  const dirty = useRef(false)
  const tracked = useRef(false)
  const latest = useRef(inputs)

  useEffect(() => {
    latest.current = inputs
    if (!dirty.current) return
    const t = setTimeout(() => {
      setStored(inputs)
      dirty.current = false
    }, 300)
    return () => clearTimeout(t)
  }, [inputs, setStored])

  useEffect(
    () => () => {
      if (dirty.current) setStored(latest.current)
    },
    [setStored],
  )

  const update = (patch: Partial<GrowthInputs>) => {
    dirty.current = true
    setInputs((prev) => ({ ...prev, ...patch }))
    if (!tracked.current) {
      tracked.current = true
      track(EVENTS.growthCalcUsed)
    }
  }

  const result = useMemo(() => calculate(inputs), [inputs])
  const bird = useMemo(() => earlyBird(inputs.monthly, inputs.rate), [inputs.monthly, inputs.rate])
  const rule = ruleOf72(inputs.rate, inputs.start)
  const defaults = defaultsFor(age)
  const isDefault = same(inputs, defaults)

  // A little party the first time your sliders make you a (pretend) millionaire.
  const prevTotal = useRef(result.total)
  const partied = useRef(false)
  useEffect(() => {
    const before = prevTotal.current
    prevTotal.current = result.total
    if (tracked.current && !partied.current && before < MILLION && result.total >= MILLION) {
      partied.current = true
      sfx.unlock()
      haptic.celebrate()
      celebrate('small')
    }
  }, [result.total])

  const xLabels = useMemo(() => result.balanceByYear.map((_, i) => (i === 0 ? 'Now' : `Yr ${i}`)), [result.balanceByYear])
  const inPct = result.total > 0 ? (Math.min(result.contributed, result.total) / result.total) * 100 : 0
  const growthPct = result.total > 0 ? (result.growth / result.total) * 100 : 0
  const weekly = (inputs.monthly * 12) / 52
  const latePct = bird.early > 0 ? (bird.late / bird.early) * 100 : 0

  return (
    <div className={styles.page}>
      {/* ---------- The big number, straight on the page ---------- */}
      <section className={styles.hero}>
        <p className={styles.heroLabel}>In {plural(inputs.years, 'year')} you'd have</p>
        <p className={styles.heroValue}>{money(result.total)}</p>

        <div className={styles.split} role="img" aria-label={`You put in ${money(result.contributed)}. Growth earned ${money(result.growth)}.`}>
          {inPct > 0.5 && <span className={cx(styles.splitPart, styles.splitIn)} style={{ width: `${inPct}%` }} />}
          {growthPct > 0.5 && <span className={cx(styles.splitPart, styles.splitGrowth)} style={{ width: `${growthPct}%` }} />}
        </div>

        <p className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={cx(styles.key, styles.keyIn)} aria-hidden /> You put in <strong>{money(result.contributed)}</strong>
          </span>
          <span className={styles.legendItem}>
            <span className={cx(styles.key, styles.keyGrowth)} aria-hidden /> Growth <strong>{money(result.growth)}</strong>
          </span>
        </p>
        <p className={styles.muted}>{shareLine(result)}</p>
      </section>

      {/* ---------- The knobs ---------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.title}>Your numbers</h2>
          {!isDefault && (
            <Button variant="ghost" size="sm" color="gray" icon={<RotateCcw size={16} strokeWidth={2.5} />} onClick={() => update(defaults)}>
              Reset
            </Button>
          )}
        </div>

        <RangeRow label="Starting amount" values={START_STOPS} value={inputs.start} format={(v) => money(v)} onChange={(v) => update({ start: v })} />
        <RangeRow
          label="Each month"
          values={MONTHLY_STOPS}
          value={inputs.monthly}
          format={(v) => `${money(v)}/mo`}
          sub={weekly > 0 ? `About ${money(weekly, { cents: weekly < 10 })} a week.` : null}
          onChange={(v) => update({ monthly: v })}
        />
        <div className={styles.rateGroup}>
          <RangeRow
            label="Yearly return"
            values={RATE_VALUES}
            value={inputs.rate}
            format={rateLabel}
            sub="Average growth per year."
            onChange={(v) => update({ rate: v })}
          />
          <div className={styles.presets} role="group" aria-label="Yearly return presets">
            {PRESETS.map((p) => {
              const on = inputs.rate === p.rate
              return (
                <button
                  key={p.name}
                  type="button"
                  className={cx(styles.preset, on && styles.presetOn)}
                  aria-pressed={on}
                  onClick={() => {
                    sfx.tap()
                    haptic.tap()
                    update({ rate: p.rate })
                  }}
                >
                  {p.name} <span className={styles.presetRate}>{rateLabel(p.rate)}</span>
                </button>
              )
            })}
          </div>
        </div>
        <RangeRow
          label="Years"
          values={YEAR_VALUES}
          value={inputs.years}
          format={(v) => plural(v, 'year')}
          sub={ageThen(age, inputs.years)}
          onChange={(v) => update({ years: v })}
        />
      </section>

      {/* ---------- The chart ---------- */}
      <section className={styles.section}>
        <h2 className={styles.title}>Year by year</h2>
        <LineChart
          xLabels={xLabels}
          series={[
            { name: 'You put in', values: result.contributedByYear },
            { name: 'Total with growth', values: result.balanceByYear, area: true },
          ]}
          tooltipFormat={(n) => money(n)}
          ariaLabel={`Line chart. After ${plural(inputs.years, 'year')} the total with growth is ${money(result.total)}, and you put in ${money(result.contributed)}.`}
        />
      </section>

      {/* ---------- Early bird vs. late starter ---------- */}
      <section className={styles.section}>
        <div>
          <h2 className={styles.title}>Starting early vs. late</h2>
          <p className={styles.muted}>
            Both save {money(bird.monthly)} a month at {rateLabel(inputs.rate)} until {STOP_AGE}.
          </p>
        </div>

        <div className={styles.lanes}>
          <div className={styles.lane} style={{ ['--lane' as string]: 'var(--c-teal)' } as CSSProperties}>
            <div className={styles.laneTop}>
              <span>Starts at {EARLY_AGE}</span>
              <strong className={styles.laneValue}>{money(bird.early)}</strong>
            </div>
            <div className={styles.track}>
              <span className={styles.fill} style={{ width: bird.early > 0 ? '100%' : '0%' }} />
            </div>
            <span className={styles.small}>Puts in {money(bird.earlyIn)}</span>
          </div>

          <div className={styles.lane} style={{ ['--lane' as string]: 'var(--c-orange)' } as CSSProperties}>
            <div className={styles.laneTop}>
              <span>Starts at {LATE_AGE}</span>
              <strong className={styles.laneValue}>{money(bird.late)}</strong>
            </div>
            <div className={styles.track}>
              <span className={styles.fill} style={{ width: `${latePct}%` }} />
            </div>
            <span className={styles.small}>Puts in {money(bird.lateIn)}</span>
          </div>
        </div>

        <div>
          <p className={styles.gapValue}>+{money(bird.gap)}</p>
          <p className={styles.body}>{earlyBirdLine(bird, inputs.rate)}</p>
          {bird.borrowed && <p className={styles.small}>This uses {money(bird.monthly)} a month as an example because yours is $0.</p>}
        </div>
      </section>

      {/* ---------- One tip, plus the fine print ---------- */}
      <section className={styles.section}>
        <p className={styles.body}>
          <strong>{rule.title}.</strong> {rule.body}
        </p>
        <p className={styles.small}>
          Real returns go up and down from year to year. This calculator does not include taxes or fees.
        </p>
      </section>

      <Card onClick={() => navigate('/tools/savings')} className={styles.linkCard}>
        <span className={styles.linkText}>
          <span className={styles.linkTitle}>Savings Goals</span>
          <span className={styles.small}>Plan how to save for something specific.</span>
        </span>
        <ChevronRight size={22} strokeWidth={2.5} className={styles.linkChev} aria-hidden />
      </Card>
    </div>
  )
}
