/*
  Habit Cost Calculator: pick a treat, see what it costs per week, month,
  year, and over many years, plus what that money could grow to if invested.
  Tone: zero shame. Treats are fine. Just know the price tag.
*/
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useMemo, useRef, type ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import { MoneyInput, Slider, TextInput } from '../../components/ui'
import { LineChart } from '../../components/Charts'
import { useGame } from '../../state/store'
import { useToolState } from '../../state/hooks'
import { EVENTS } from '../../state/badges'
import { money, number } from '../../lib/format'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { CUSTOM_ID, KID_INITIAL, NAME_MAX, PRESETS, PRICE_MAX, RATE_PCT, TEEN_INITIAL, currentHabit, sanitize, type HabitState } from './data'
import { bigEquivalent, equivalents, habitMath, timesPhrase } from './math'
import styles from './Habit.module.css'

/** Shows cents only when the real number has them. */
const moneyFor = (target: number) => {
  const cents = Math.round(target * 100) % 100 !== 0
  return (n: number) => money(n, { cents })
}
const countLabel = (c: number) => (Number.isInteger(c) ? number(c) : c.toFixed(1))

export default function HabitTool() {
  const age = useGame((s) => s.profile.age)
  const track = useGame((s) => s.track)
  const kid = age >= 11 && age <= 14
  const base = kid ? KID_INITIAL : TEEN_INITIAL
  const [raw, setRaw] = useToolState<HabitState>('habit', base)
  const s = sanitize(raw, base)
  const reduce = useReducedMotion()

  // Counts as "used" the first time anything changes (once per visit).
  const used = useRef(false)
  const markUsed = useCallback(() => {
    if (used.current) return
    used.current = true
    track(EVENTS.habitCalcUsed)
  }, [track])

  const update = (patch: Partial<HabitState>) => {
    setRaw((prev) => ({ ...sanitize(prev, base), ...patch }))
    markUsed()
  }

  const habit = currentHabit(s)
  const price = habit.price
  const m = useMemo(() => habitMath(price, s.perWeek, s.years), [price, s.perWeek, s.years])
  const yearThings = useMemo(() => equivalents(m.perYear), [m.perYear])
  const bigThing = useMemo(() => bigEquivalent(m.spent), [m.spent])
  const skip = Math.min(s.skip, s.perWeek)
  const trimmed = useMemo(() => habitMath(price, skip, s.years), [price, skip, s.years])
  const left = s.perWeek - skip
  const isCustom = s.presetId === CUSTOM_ID
  const yrs = `${s.years} ${s.years === 1 ? 'year' : 'years'}`
  const weekFmt = moneyFor(m.perWeek)

  const choose = (id: string) => {
    if (id === s.presetId) return
    sfx.tap()
    haptic.tap()
    update({ presetId: id })
  }

  const step = (d: number) => {
    const next = Math.max(1, Math.min(s.perWeek, skip + d))
    if (next === skip) return
    if (d > 0) sfx.coin()
    else sfx.tap()
    haptic.tap()
    update({ skip: next })
  }

  return (
    <div className={styles.page}>
      {/* ---------- Pick a habit ---------- */}
      <Reveal i={0} reduce={reduce}>
        <h2 className={styles.h2}>Pick a habit</h2>
        <div className={styles.chips} role="group" aria-label="Habits">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" className={[styles.chip, s.presetId === p.id && styles.chipOn].filter(Boolean).join(' ')} aria-pressed={s.presetId === p.id} onClick={() => choose(p.id)}>
              <span className={styles.chipEmoji} aria-hidden>
                {p.emoji}
              </span>
              {p.name}
              <span className={styles.chipPrice}>{money(p.price)}</span>
            </button>
          ))}
          <button type="button" className={[styles.chip, isCustom && styles.chipOn].filter(Boolean).join(' ')} aria-pressed={isCustom} onClick={() => choose(CUSTOM_ID)}>
            Something else
          </button>
        </div>
      </Reveal>

      {/* ---------- Inputs ---------- */}
      <Reveal i={1} reduce={reduce}>
        <div className={styles.inputs}>
          <AnimatePresence initial={false}>
            {isCustom && (
              <motion.div
                key="custom"
                className={styles.customWrap}
                initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              >
                <div className={styles.customGrid}>
                  <label className={styles.field}>
                    <span className={styles.label}>What is it?</span>
                    <TextInput value={s.customName} maxLength={NAME_MAX} placeholder={kid ? 'Sticker packs' : 'Energy drinks'} onChange={(e) => update({ customName: e.target.value.slice(0, NAME_MAX) })} />
                  </label>
                  <div className={styles.field}>
                    <span className={styles.label}>Price each time</span>
                    <MoneyInput value={s.customPrice} onChange={(n) => update({ customPrice: n })} max={PRICE_MAX} ariaLabel="Price each time in dollars" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Slider label="How often" min={1} max={14} value={s.perWeek} onChange={(n) => update({ perWeek: n })} display={timesPhrase(s.perWeek)} color="pink" />
          <Slider label="For how long" min={1} max={20} value={s.years} onChange={(n) => update({ years: n })} display={yrs} color="pink" />
        </div>
      </Reveal>

      {price < 0.01 ? (
        <Reveal i={2} reduce={reduce}>
          <div className={styles.empty}>
            <span className={styles.emptyEmoji} aria-hidden>
              🆓
            </span>
            <p className={styles.muted}>Add a price to see the cost.</p>
          </div>
        </Reveal>
      ) : (
        <>
          {/* ---------- Big number ---------- */}
          <Reveal i={2} reduce={reduce}>
            <div className={styles.hero}>
              <span className={styles.muted}>
                <span aria-hidden>{habit.emoji} </span>Your {habit.label} costs about
              </span>
              <span className={styles.heroValue}>
                {money(m.perYear)} <span className={styles.heroUnit}>a year</span>
              </span>
            </div>
          </Reveal>

          {/* ---------- Totals ---------- */}
          <Reveal i={3} reduce={reduce}>
            <dl className={styles.totals}>
              <div className={styles.totalRow}>
                <dt>A week</dt>
                <dd>{weekFmt(m.perWeek)}</dd>
              </div>
              <div className={styles.totalRow}>
                <dt>A month</dt>
                <dd>{money(m.perMonth)}</dd>
              </div>
              <div className={styles.totalRow}>
                <dt>
                  In {yrs}
                  {bigThing && <span className={styles.faint}> (about {bigThing.text})</span>}
                </dt>
                <dd className={styles.totalBig}>{money(m.spent)}</dd>
              </div>
            </dl>
          </Reveal>

          {/* ---------- Fun equivalents ---------- */}
          <Reveal i={4} reduce={reduce}>
            {yearThings.length > 0 ? (
              <>
                <h2 className={styles.h2}>One year of that buys about</h2>
                <ul className={styles.things}>
                  {yearThings.map((e) => (
                    <li key={e.thing.one}>
                      <strong>{countLabel(e.count)}</strong> {e.count === 1 ? e.thing.one : e.thing.many}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className={styles.muted}>That comes to less than $2 a year.</p>
            )}
          </Reveal>

          {/* ---------- Invested instead ---------- */}
          <Reveal i={5} reduce={reduce}>
            <h2 className={styles.h2}>If you invested it instead</h2>
            <div className={styles.hero}>
              <span className={styles.investValue}>{money(m.invested)}</span>
              <span className={styles.muted}>
                after {yrs} at {RATE_PCT}% a year. Growth added {money(m.growth)} of that.
              </span>
            </div>
            <div className={styles.chart}>
              <LineChart
                xLabels={m.xLabels}
                series={[
                  { name: 'Spent', values: m.spentLine, slot: 2, dashed: true },
                  { name: 'If invested', values: m.investedLine, slot: 1, area: true },
                ]}
                tooltipFormat={(n) => money(n)}
                ariaLabel={`Money spent on your ${habit.label} versus the same money invested, over ${yrs}. Spent: ${money(m.spent)}. If invested: ${money(m.invested)}.`}
              />
            </div>
          </Reveal>

          {/* ---------- Trim it ---------- */}
          <Reveal i={6} reduce={reduce}>
            <h2 className={styles.h2}>Or cut back</h2>
            <div className={styles.stepRow}>
              <span className={styles.stepWord}>Skip</span>
              <button type="button" className={styles.stepBtn} onClick={() => step(-1)} disabled={skip <= 1} aria-label="Skip one fewer each week">
                <Minus size={20} strokeWidth={3} />
              </button>
              <span className={styles.stepValue} aria-live="polite" aria-label={`Skipping ${skip} a week`}>
                {skip}
              </span>
              <button type="button" className={styles.stepBtn} onClick={() => step(1)} disabled={skip >= s.perWeek} aria-label="Skip one more each week">
                <Plus size={20} strokeWidth={3} />
              </button>
              <span className={styles.stepWord}>a week</span>
            </div>
            <p className={styles.trimText}>
              {left > 0 ? (
                <>
                  You still get your {habit.what} {timesPhrase(left)} and save <strong>{money(trimmed.perYear)}</strong> a year
                </>
              ) : (
                <>
                  Skipping all of them saves <strong>{money(trimmed.perYear)}</strong> a year
                </>
              )}
              , or <strong>{money(trimmed.invested)}</strong> if invested.
            </p>
          </Reveal>
        </>
      )}

      <p className={styles.fine}>
        Prices are estimates. {RATE_PCT}% is a long-run stock market average after inflation. Real returns vary and are not guaranteed.
      </p>
    </div>
  )
}

/** Slides each section up a little as the page appears. */
function Reveal({ i, reduce, children }: { i: number; reduce: boolean | null; children: ReactNode }) {
  return (
    <motion.section
      className={styles.section}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30, delay: Math.min(i, 9) * 0.04 }}
    >
      {children}
    </motion.section>
  )
}
