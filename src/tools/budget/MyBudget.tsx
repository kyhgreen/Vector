/*
  Tab 2: My Budget. A zero-based budget: money coming in, minus every
  category you plan, should land on exactly $0 left to assign.
*/
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Plus, RotateCcw, Wallet, X } from 'lucide-react'
import { Button, IconButton } from '../../components/Button'
import { DonutChart } from '../../components/Charts'
import { MoneyInput, ProgressBar, TextInput } from '../../components/ui'
import { Sheet } from '../../components/Sheet'
import { celebrate } from '../../lib/confetti'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { EVENTS } from '../../state/badges'
import { useGame } from '../../state/store'
import type { ButtonColor } from '../../components/Button'
import {
  CATEGORY_IDEAS,
  cleanAmount,
  fmt,
  fmtShort,
  GROUP_ORDER,
  GROUPS,
  INCOME_PRESETS,
  leftState,
  MAX_AMOUNT,
  pctText,
  signature,
  starterForReset,
  totals,
  uid,
  type BudgetData,
  type Group,
  type LeftState,
  type Totals,
} from './model'
import { Chip, cx, GroupIcon, tone, useOnScreen, type TabProps } from './parts'
import styles from './Budget.module.css'

const STATE_COLOR: Record<LeftState, ButtonColor> = { empty: 'gray', zero: 'green', under: 'yellow', over: 'red' }

function heroLine(state: LeftState, t: Totals): string {
  switch (state) {
    case 'empty':
      return 'Add some income to get going.'
    case 'zero':
      return 'All of your income is planned.'
    case 'under':
      return 'Plan where the rest goes.'
    case 'over':
      return `That's ${fmt(-t.left)} more than you have. Lower a category to fix it.`
  }
}

/** How a group compares with its 50/30/20 target, in a few words. */
function compareText(g: Group, share: number): { text: string; color: ButtonColor } {
  const diff = share - GROUPS[g].pct
  if (Math.abs(diff) <= 0.05) return { text: 'On target', color: 'green' }
  const high = diff > 0
  if (g === 'needs') return high ? { text: 'A bit high', color: 'orange' } : { text: 'Under target', color: 'blue' }
  if (g === 'wants') return high ? { text: 'A bit high', color: 'orange' } : { text: 'Under target', color: 'blue' }
  return high ? { text: 'Above target', color: 'green' } : { text: 'Could use more', color: 'orange' }
}

export default function MyBudget({ data, update, tier }: TabProps) {
  const track = useGame((s) => s.track)
  const pushToast = useGame((s) => s.pushToast)
  const reduce = useReducedMotion()
  const t = totals(data)
  const state = leftState(t)
  const color = STATE_COLOR[state]
  const [focusId, setFocusId] = useState<{ id: string; field: 'name' | 'amount' } | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const heroOnScreen = useOnScreen(heroRef)
  const confettiDone = useRef(false)
  const prevState = useRef(state)

  // Landing on exactly $0 is the big moment. Wait a beat so typing "60" doesn't party at "6".
  useEffect(() => {
    const before = prevState.current
    prevState.current = state
    if (state !== 'zero' || before === 'zero') return
    const timer = setTimeout(() => {
      sfx.complete()
      haptic.celebrate()
      if (!confettiDone.current) {
        confettiDone.current = true
        celebrate('small')
      }
    }, 650)
    return () => clearTimeout(timer)
  }, [state])

  /* ----- edits ----- */
  const edit = (fn: (d: BudgetData) => BudgetData) => update(fn)

  const addIncome = (name: string) => {
    sfx.tap()
    haptic.tap()
    const id = uid('i')
    edit((d) => ({ ...d, income: [...d.income, { id, name, amount: 0 }] }))
    setFocusId({ id, field: name ? 'amount' : 'name' })
  }
  const setIncome = (id: string, patch: { name?: string; amount?: number }) =>
    edit((d) => ({ ...d, income: d.income.map((l) => (l.id === id ? { ...l, ...patch } : l)) }))
  const removeIncome = (id: string) => {
    sfx.tap()
    edit((d) => ({ ...d, income: d.income.filter((l) => l.id !== id) }))
  }

  const addCategory = (group: Group, name: string) => {
    sfx.tap()
    haptic.tap()
    const id = uid('c')
    edit((d) => ({ ...d, categories: [...d.categories, { id, name, amount: 0, group }] }))
    setFocusId({ id, field: name ? 'amount' : 'name' })
  }
  const setCategory = (id: string, patch: { name?: string; amount?: number }) =>
    edit((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
  const removeCategory = (id: string) => {
    sfx.tap()
    edit((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }))
  }

  const fillLeftover = (group: Group) => {
    // Handy shortcut: dump whatever is unassigned into the first line of a group.
    const target = data.categories.find((c) => c.group === group)
    if (!target || t.left <= 0) return
    sfx.coin()
    haptic.tap()
    setCategory(target.id, { amount: cleanAmount(target.amount + t.left) })
  }

  const save = () => {
    if (state === 'empty') {
      sfx.wrong()
      haptic.wrong()
      pushToast({ emoji: '🤔', title: 'Nothing to save yet', body: 'Add income and a category first.', tone: 'warning' })
      return
    }
    edit((d) => ({ ...d, savedSig: signature(d), savedAt: Date.now() }))
    sfx.coin()
    haptic.celebrate()
    if (state === 'zero') {
      celebrate('small')
      pushToast({ emoji: '📊', title: 'Budget saved', body: 'All of your income is planned.', tone: 'info' })
    } else if (state === 'under') {
      pushToast({ emoji: '📊', title: 'Budget saved', body: `${fmt(t.left)} is not planned yet.`, tone: 'info' })
    } else {
      pushToast({ emoji: '📊', title: 'Budget saved', body: `You're ${fmt(-t.left)} over. Lower a category and save again.`, tone: 'warning' })
    }
    track(EVENTS.budgetSaved)
  }

  const reset = (blank: boolean) => {
    sfx.tap()
    edit((d) => ({ ...d, ...(blank ? { income: [], categories: [] } : starterForReset(d, tier)), savedSig: null, savedAt: null }))
    setResetOpen(false)
    setFocusId(null)
  }

  const savedNow = data.savedSig !== null && data.savedSig === signature(data)
  const saveStatus = data.savedSig === null ? 'Edits are kept as you go. Save when the plan is ready.' : savedNow ? 'Saved and up to date.' : 'Changed since your last save.'

  const incomeNames = new Set(data.income.map((l) => l.name.trim().toLowerCase()))
  const categoryNames = new Set(data.categories.map((c) => c.name.trim().toLowerCase()))

  const donut = [
    ...GROUP_ORDER.map((g) => ({ name: GROUPS[g].name, value: t.byGroup[g], color: GROUPS[g].chart })),
    ...(t.left > 0 ? [{ name: 'Not planned', value: t.left, color: 'var(--c-gray)' }] : []),
  ]

  return (
    <div className={styles.stack}>
      {/* Mini "left to assign" strip that follows you down the page */}
      <div className={styles.stickyAnchor}>
        <AnimatePresence>
          {!heroOnScreen && (
            <motion.div
              className={cx(styles.mini, tone(color))}
              initial={{ opacity: 0, y: reduce ? 0 : -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -12 }}
              transition={{ duration: 0.2 }}
            >
              <span>Left to assign</span>
              <strong>{fmt(t.left)}</strong>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={heroRef} className={cx(styles.hero, tone(color))}>
        <div className={styles.heroTop}>
          <span className={cx(styles.heroNumber, fmt(t.left).length > 9 && styles.heroNumberLong)}>{fmt(t.left)}</span>
          <span className={styles.heroLabel}>left to assign</span>
        </div>
        <p className={styles.heroTitle} aria-live="polite">
          {heroLine(state, t)}
        </p>
        <ProgressBar value={t.income > 0 ? t.assigned / t.income : 0} color={state === 'over' ? 'red' : 'green'} height={12} label="Share of income planned" />
        <div className={styles.heroMeta}>
          <span>
            Coming in <strong>{fmt(t.income)}</strong>
          </span>
          <span>
            Planned <strong>{fmt(t.assigned)}</strong>
          </span>
        </div>
      </div>

      {/* ----- Income ----- */}
      <section className={cx(styles.section, tone('teal'))} aria-labelledby="budget-income">
        <header className={styles.sectionHead}>
          <Wallet size={22} strokeWidth={2.5} className={styles.sectionIcon} aria-hidden />
          <div className={styles.sectionTitles}>
            <h2 id="budget-income" className={styles.h3}>
              Money coming in
            </h2>
            <span className={styles.muted}>Per month. For weekly pay, multiply by 4.3.</span>
          </div>
          <span className={styles.sectionTotal}>{fmt(t.income)}</span>
        </header>
        <Lines
          lines={data.income}
          focus={focusId}
          placeholder="Where it comes from"
          onName={(id, name) => setIncome(id, { name })}
          onAmount={(id, amount) => setIncome(id, { amount })}
          onRemove={removeIncome}
        />
        <div className={styles.chips}>
          {INCOME_PRESETS[tier]
            .filter((n) => !incomeNames.has(n.toLowerCase()))
            .map((n) => (
              <Chip key={n} color="teal" icon={<Plus size={16} strokeWidth={3} />} onClick={() => addIncome(n)} label={`Add ${n}`}>
                {n}
              </Chip>
            ))}
          <Chip color="teal" icon={<Plus size={16} strokeWidth={3} />} onClick={() => addIncome('')} label="Add other income">
            Something else
          </Chip>
        </div>
      </section>

      {/* ----- Needs / Wants / Savings ----- */}
      {GROUP_ORDER.map((g) => {
        const info = GROUPS[g]
        const lines = data.categories.filter((c) => c.group === g)
        const ideas = CATEGORY_IDEAS[tier][g].filter((n) => !categoryNames.has(n.toLowerCase())).slice(0, 4)
        const share = t.income > 0 ? t.byGroup[g] / t.income : 0
        return (
          <section key={g} className={cx(styles.section, tone(info.color))} aria-labelledby={`budget-${g}`}>
            <header className={styles.sectionHead}>
              <GroupIcon group={g} size={22} strokeWidth={2.5} className={styles.sectionIcon} />
              <div className={styles.sectionTitles}>
                <h2 id={`budget-${g}`} className={styles.h3}>
                  {info.name}
                </h2>
                <span className={styles.muted}>
                  {info.tagline}
                  {t.income > 0 && <>, {pctText(share)} of income</>}
                </span>
              </div>
              <span className={styles.sectionTotal}>{fmt(t.byGroup[g])}</span>
            </header>
            <Lines
              lines={lines}
              focus={focusId}
              placeholder="Name it"
              onName={(id, name) => setCategory(id, { name })}
              onAmount={(id, amount) => setCategory(id, { amount })}
              onRemove={removeCategory}
            />
            <div className={styles.chips}>
              {ideas.map((n) => (
                <Chip key={n} color={info.color} icon={<Plus size={16} strokeWidth={3} />} onClick={() => addCategory(g, n)} label={`Add ${n} to ${info.name}`}>
                  {n}
                </Chip>
              ))}
              <Chip color={info.color} icon={<Plus size={16} strokeWidth={3} />} onClick={() => addCategory(g, '')} label={`Add your own ${info.name} category`}>
                Your own
              </Chip>
            </div>
            {state === 'under' && lines.length > 0 && g === 'savings' && (
              <button type="button" className={styles.linkBtn} onClick={() => fillLeftover('savings')}>
                Put the extra {fmt(t.left)} in {lines[0].name.trim() || 'savings'}
              </button>
            )}
          </section>
        )
      })}

      {/* ----- Chart + 50/30/20 check ----- */}
      <section className={styles.section} aria-labelledby="budget-chart">
        <h2 id="budget-chart" className={styles.h3}>
          Where it goes
        </h2>
        {t.assigned > 0 || t.left > 0 ? (
          <DonutChart segments={donut} center={fmtShort(t.income)} sub="coming in" format={fmt} />
        ) : (
          <p className={styles.muted}>Add amounts to see the chart.</p>
        )}
        {t.income > 0 && (
          <div className={styles.compare}>
            <h3 className={styles.compareHead}>Compared with 50/30/20</h3>
            {GROUP_ORDER.map((g) => {
              const share = t.byGroup[g] / t.income
              const c = compareText(g, share)
              return (
                <div key={g} className={cx(styles.compareRow, tone(c.color))}>
                  <span className={styles.compareName}>{GROUPS[g].name}</span>
                  <span className={styles.compareNums}>
                    {pctText(share)} <span className={styles.faint}>of {pctText(GROUPS[g].pct)}</span>
                  </span>
                  <span className={styles.compareTag}>{c.text}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <p className={styles.tip}>The goal is $0 left to assign, not $0 in your pocket. Money you plan to save counts as assigned.</p>

      <div className={styles.saveArea}>
        <Button feedback={false} onClick={save}>
          Save budget
        </Button>
        <p className={cx(styles.saveStatus, savedNow && styles.saveStatusOk)}>{saveStatus}</p>
        <Button variant="ghost" color="blue" size="sm" icon={<RotateCcw size={16} strokeWidth={3} />} onClick={() => setResetOpen(true)}>
          Start over
        </Button>
      </div>

      <Sheet open={resetOpen} onClose={() => setResetOpen(false)} title="Start over?">
        <p className={styles.sheetText}>Your Tracker history stays either way.</p>
        <Button color="blue" onClick={() => reset(false)}>
          Use the example
        </Button>
        <Button color="red" onClick={() => reset(true)}>
          Start blank
        </Button>
        <Button variant="outline" onClick={() => setResetOpen(false)}>
          Never mind
        </Button>
      </Sheet>
    </div>
  )
}

/* ---------- One editable list of name + amount lines ---------- */

function Lines({
  lines,
  focus,
  placeholder,
  onName,
  onAmount,
  onRemove,
}: {
  lines: { id: string; name: string; amount: number }[]
  focus: { id: string; field: 'name' | 'amount' } | null
  placeholder: string
  onName: (id: string, name: string) => void
  onAmount: (id: string, amount: number) => void
  onRemove: (id: string) => void
}) {
  const reduce = useReducedMotion()
  return (
    <div className={styles.lines}>
      <AnimatePresence initial={false}>
        {lines.map((l) => (
          <motion.div
            key={l.id}
            className={styles.line}
            layout={!reduce}
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          >
            <div className={styles.lineInner}>
              <TextInput
                className={styles.lineName}
                value={l.name}
                maxLength={28}
                placeholder={placeholder}
                aria-label="Name"
                autoFocus={focus?.id === l.id && focus.field === 'name'}
                onChange={(e) => onName(l.id, e.target.value)}
              />
              <div className={styles.lineAmount}>
                <MoneyInput
                  value={l.amount}
                  max={MAX_AMOUNT}
                  ariaLabel={`${l.name.trim() || 'This line'}, dollars per month`}
                  autoFocus={focus?.id === l.id && focus.field === 'amount'}
                  onChange={(n) => onAmount(l.id, cleanAmount(n))}
                />
              </div>
              <IconButton label={`Remove ${l.name.trim() || 'this line'}`} className={styles.removeBtn} onClick={() => onRemove(l.id)}>
                <X size={20} strokeWidth={3} />
              </IconButton>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
