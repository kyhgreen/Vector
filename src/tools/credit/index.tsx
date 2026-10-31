/*
  Credit Score Simulator: a pretend credit report you can change one move at
  a time. Every move says what happened to the score and why.
*/
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, RotateCcw, Undo2 } from 'lucide-react'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { Callout, ProgressBar } from '../../components/ui'
import { celebrate } from '../../lib/confetti'
import { money } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { EVENTS } from '../../state/badges'
import { useToolState } from '../../state/hooks'
import { useGame } from '../../state/store'
import { Gauge } from './Gauge'
import {
  ACTIONS,
  BANDS,
  FACTORS,
  START,
  ageText,
  bandIndex,
  blockedReason,
  factorDetail,
  factorScores,
  getAction,
  grade,
  onReport,
  runAction,
  scoreOf,
  utilization,
  type ActionId,
  type FactorId,
  type FactorScores,
  type Profile,
} from './model'
import { INITIAL_CREDIT, LOG_MAX, sanitizeCredit, type CreditState, type LogEntry } from './state'
import styles from './Credit.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '±0')
const tone = (n: number) => (n > 0 ? styles.up : n < 0 ? styles.down : styles.flat)
const START_SCORE = scoreOf(START)

/** A quick "nope" wiggle on a move that can't run right now. */
function wiggle(id: ActionId) {
  if (typeof document === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const el = document.querySelector<HTMLElement>(`[data-credit-action="${id}"]`)
  el?.animate?.(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }],
    { duration: 320, easing: 'ease-out' },
  )
}

export default function CreditTool() {
  const track = useGame((s) => s.track)
  const [saved, setSaved] = useToolState<CreditState>('credit', INITIAL_CREDIT)
  const state = useMemo(() => sanitizeCredit(saved), [saved])
  const { profile, log } = state
  const score = useMemo(() => scoreOf(profile), [profile])
  const factors = useMemo(() => factorScores(profile), [profile])
  const latest: LogEntry | undefined = log[0]
  const tracked = useRef(false)
  const [resetOpen, setResetOpen] = useState(false)

  const doAction = useCallback(
    (id: ActionId) => {
      const cur = sanitizeCredit(useGame.getState().tools.credit ?? INITIAL_CREDIT)
      if (blockedReason(cur.profile, id)) {
        sfx.wrong()
        haptic.wrong()
        wiggle(id)
        return
      }
      const o = runAction(cur.profile, id)
      const entry: LogEntry = {
        n: (cur.log[0]?.n ?? 0) + 1,
        action: id,
        before: o.before,
        after: o.after,
        month: o.next.month,
        title: o.title,
        body: o.body,
        factorDelta: o.factorDelta,
        prev: cur.profile,
      }
      setSaved({ profile: o.next, log: [entry, ...cur.log].slice(0, LOG_MAX) })

      const up = bandIndex(o.after) > bandIndex(o.before)
      if (up) {
        sfx.unlock()
        haptic.celebrate()
        celebrate(o.after >= 800 ? 'big' : 'small')
      } else if (o.after > o.before) {
        sfx.correct()
        haptic.correct()
      } else if (o.after < o.before) {
        sfx.wrong()
        haptic.wrong()
      } else {
        sfx.tap()
        haptic.tap()
      }
      if (!tracked.current) {
        tracked.current = true
        track(EVENTS.creditSimUsed)
      }
    },
    [setSaved, track],
  )

  const undo = () => {
    if (!latest) return
    sfx.tap()
    setSaved({ profile: latest.prev, log: log.slice(1) })
  }

  const reset = () => {
    setSaved(INITIAL_CREDIT)
    setResetOpen(false)
    sfx.tap()
    haptic.tap()
  }

  // Number keys 1-8 run the moves on a keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (resetOpen || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const i = Number(e.key) - 1
      if (Number.isInteger(i) && i >= 0 && i < ACTIONS.length) {
        e.preventDefault()
        doAction(ACTIONS[i].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doAction, resetOpen])

  return (
    <div className={styles.page}>
      <ScoreDial score={score} profile={profile} latest={latest} />
      <Outcome latest={latest} onUndo={undo} />

      <section className={styles.section} aria-labelledby="credit-moves">
        <div className={styles.sectionHead}>
          <h2 id="credit-moves" className={styles.h2}>
            Try a move
          </h2>
          <span className={cx(styles.hint, styles.keysOnly)}>Keys 1 to 8 work too</span>
        </div>
        <div className={styles.actions}>
          {ACTIONS.map((a, i) => {
            const reason = blockedReason(profile, a.id)
            return (
              <button
                key={a.id}
                type="button"
                data-credit-action={a.id}
                className={cx(styles.action, reason && styles.actionBlocked)}
                aria-disabled={!!reason}
                aria-keyshortcuts={String(i + 1)}
                onClick={() => doAction(a.id)}
              >
                <span className={styles.actionEmoji} aria-hidden>
                  {a.emoji}
                </span>
                <span className={styles.actionText}>
                  <span className={styles.actionLabel}>{a.label}</span>
                  {reason && <span className={styles.actionHint}>{reason}</span>}
                </span>
                <kbd className={styles.kbd} aria-hidden>
                  {i + 1}
                </kbd>
              </button>
            )
          })}
        </div>
      </section>

      <FactorList factors={factors} profile={profile} delta={latest?.factorDelta} />
      <Report profile={profile} />
      <History log={log} onReset={() => setResetOpen(true)} />

      <Callout emoji="💡" color="purple">
        Paying on time and keeping cards under 30% used cover the two biggest factors, 65% of the score.
      </Callout>
      <p className={styles.footnote}>A simplified model. Real scores like FICO use the same five factors.</p>

      <Sheet open={resetOpen} onClose={() => setResetOpen(false)} title="Start over?">
        <p className={styles.sheetText}>Back to a score of about {START_SCORE} with no moves.</p>
        <div className={styles.sheetButtons}>
          <Button color="red" onClick={reset}>
            Reset
          </Button>
          <Button variant="ghost" block onClick={() => setResetOpen(false)}>
            Keep going
          </Button>
        </div>
      </Sheet>
    </div>
  )
}

/* ---------- Score dial ---------- */

function ScoreDial({ score, profile, latest }: { score: number; profile: Profile; latest?: LogEntry }) {
  const reduce = useReducedMotion()
  const band = BANDS[bandIndex(score)]
  const delta = latest ? latest.after - latest.before : 0
  const age = profile.month === 0 ? 'Day one' : `${ageText(profile.month)} in`

  return (
    <section className={styles.score} aria-label="Your pretend credit score">
      <span className={styles.age}>{age}</span>
      <div className={styles.gaugeWrap}>
        <Gauge score={score} />
      </div>
      <div className={styles.scoreRow}>
        <span className={styles.scoreNum}>{score}</span>
        <AnimatePresence mode="popLayout">
          {latest && (
            <motion.span
              key={latest.n}
              className={cx(styles.delta, tone(delta))}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-label={`Score changed by ${delta}`}
            >
              {signed(delta)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <p className={styles.band} style={{ ['--band' as string]: `var(--c-${band.color})` }}>
        <span className={styles.bandDot} aria-hidden />
        {band.name}
      </p>
      <p className={styles.meaning}>{band.meaning}</p>
    </section>
  )
}

/* ---------- What just happened ---------- */

function Outcome({ latest, onUndo }: { latest?: LogEntry; onUndo: () => void }) {
  const reduce = useReducedMotion()
  if (!latest) {
    return <p className={styles.empty}>Pick a move to see what it does. The score is pretend, so you can try bad moves too.</p>
  }
  const delta = latest.after - latest.before
  const moved = FACTORS.map((f) => ({ f, d: Math.round(latest.factorDelta[f.id]) })).filter((x) => x.d !== 0)
  const bg = delta > 0 ? styles.outcomeUp : delta < 0 ? styles.outcomeDown : styles.outcomeFlat
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={latest.n}
        className={cx(styles.outcome, bg)}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        aria-live="polite"
      >
        <div className={styles.outcomeHead}>
          <h2 className={styles.outcomeTitle}>{latest.title}</h2>
          <span className={cx(styles.outcomeDelta, tone(delta))}>{signed(delta)}</span>
        </div>
        <p className={styles.outcomeBody}>{latest.body}</p>
        {moved.length > 0 && (
          <p className={styles.moved} aria-label="Factor changes">
            {moved.map(({ f, d }, i) => (
              <span key={f.id}>
                {i > 0 && ', '}
                {f.name} <span className={tone(d)}>{signed(d)}</span>
              </span>
            ))}
          </p>
        )}
        <div className={styles.outcomeFoot}>
          <span className={styles.muted}>
            {latest.before} → {latest.after}
          </span>
          <Button variant="ghost" size="sm" color="gray" icon={<Undo2 size={16} strokeWidth={2.5} />} onClick={onUndo}>
            Undo
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ---------- The five factors ---------- */

function FactorList({ factors, profile, delta }: { factors: FactorScores; profile: Profile; delta?: FactorScores }) {
  const [open, setOpen] = useState<FactorId | null>(null)
  return (
    <section className={styles.section} aria-labelledby="credit-factors">
      <h2 id="credit-factors" className={styles.h2}>
        What makes up the score
      </h2>
      <div className={styles.factors}>
        {FACTORS.map((f) => {
          const v = Math.round(factors[f.id])
          const g = grade(v)
          const d = delta ? Math.round(delta[f.id]) : 0
          const isOpen = open === f.id
          return (
            <div key={f.id} className={styles.factor}>
              <button
                type="button"
                className={styles.factorBtn}
                aria-expanded={isOpen}
                aria-controls={`factor-${f.id}`}
                onClick={() => {
                  sfx.tap()
                  setOpen(isOpen ? null : f.id)
                }}
              >
                <span className={styles.factorMain}>
                  <span className={styles.factorTop}>
                    <span className={styles.factorName}>{f.name}</span>
                    <span className={styles.muted}>{Math.round(f.weight * 100)}%</span>
                    {d !== 0 && <span className={cx(styles.factorDelta, tone(d))}>{signed(d)}</span>}
                    <span className={styles.grade}>{g.word}</span>
                  </span>
                  <ProgressBar value={v / 100} color={g.color} height={10} label={`${f.name}: ${v} out of 100`} />
                </span>
                <ChevronDown className={cx(styles.chev, isOpen && styles.chevOpen)} size={20} strokeWidth={2.5} aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`factor-${f.id}`}
                    className={styles.factorMore}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.factorMoreInner}>
                      <p className={styles.factorNow}>
                        {factorDetail(profile, f.id)} ({v}/100)
                      </p>
                      <p>{f.blurb}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------- The pretend credit report ---------- */

function Report({ profile }: { profile: Profile }) {
  const accounts = profile.accounts.filter(onReport)
  const u = utilization(profile)
  const uColor = u < 0.1 ? 'green' : u < 0.3 ? 'teal' : u < 0.5 ? 'orange' : 'red'
  return (
    <section className={styles.section} aria-labelledby="credit-report">
      <h2 id="credit-report" className={styles.h2}>
        Your report
      </h2>
      <div className={styles.util}>
        <div className={styles.utilTop}>
          <span>Card balance</span>
          <span>
            <strong className={styles.num}>{money(profile.balance)}</strong> <span className={styles.muted}>({Math.round(u * 100)}% used)</span>
          </span>
        </div>
        <ProgressBar value={u} color={uColor} height={12} label="Share of card limits in use" />
        <div className={styles.utilMarks} aria-hidden>
          <span style={{ left: '10%' }}>10%</span>
          <span style={{ left: '30%' }}>30%</span>
        </div>
      </div>
      {accounts.length === 0 ? (
        <p className={styles.muted}>No accounts on your report.</p>
      ) : (
        <ul className={styles.list}>
          {accounts.map((a) => {
            const status = a.closedFor === null ? 'Open' : a.closedReason === 'paid' ? 'Paid off' : 'Closed'
            return (
              <li key={a.id} className={styles.listItem}>
                <span className={styles.listMain}>
                  <span className={styles.listName}>{a.name}</span>
                  <span className={styles.muted}>
                    {a.kind === 'card' ? `${money(a.limit)} limit` : `${money(a.limit)} borrowed`}, {ageText(a.ageMonths)}
                  </span>
                </span>
                <span className={cx(styles.status, status === 'Open' ? styles.statusOpen : status === 'Paid off' ? styles.up : styles.muted)}>{status}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/* ---------- History log ---------- */

function History({ log, onReset }: { log: LogEntry[]; onReset: () => void }) {
  return (
    <section className={styles.section} aria-labelledby="credit-history">
      <div className={styles.sectionHead}>
        <h2 id="credit-history" className={styles.h2}>
          Your moves
        </h2>
        {log.length > 0 && (
          <Button variant="outline" size="sm" icon={<RotateCcw size={15} strokeWidth={2.5} />} onClick={onReset}>
            Reset
          </Button>
        )}
      </div>
      {log.length === 0 ? (
        <p className={styles.muted}>No moves yet.</p>
      ) : (
        <ol className={cx(styles.list, styles.log)}>
          {log.map((e) => {
            const d = e.after - e.before
            return (
              <li key={e.n} className={styles.listItem}>
                <span className={styles.listMain}>
                  <span className={styles.listName}>{getAction(e.action).short}</span>
                  <span className={cx(styles.muted, styles.num)}>
                    Month {e.month}, {e.before} → {e.after}
                  </span>
                </span>
                <span className={cx(styles.logDelta, tone(d))}>{signed(d)}</span>
              </li>
            )
          })}
        </ol>
      )}
      {log.length >= LOG_MAX && <p className={styles.logNote}>Only the last {LOG_MAX} moves are kept.</p>}
    </section>
  )
}
