/*
  Tab 3: Tracker. Log what you actually spend, then watch it stack up
  against the plan from My Budget, one month at a time.
*/
import { useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ChevronLeft, ChevronRight, Plus, Trash } from 'lucide-react'
import { Button, IconButton, type ButtonColor } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { MoneyInput, ProgressBar, TextInput } from '../../components/ui'
import { dayKey, type DayKey } from '../../lib/dates'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { EVENTS } from '../../state/badges'
import { useNow } from '../../state/hooks'
import { useGame } from '../../state/store'
import {
  categoryProgress,
  cleanAmount,
  dayLabel,
  daysLeftInMonth,
  displayName,
  fillRatio,
  fmt,
  GROUP_ORDER,
  GROUPS,
  isOver,
  MAX_AMOUNT,
  MAX_EXPENSES,
  monthLabel,
  monthOf,
  NOTE_PLACEHOLDER,
  round2,
  uid,
  type Category,
  type CategoryProgress,
  type Expense,
  type Group,
  type MonthKey,
} from './model'
import { Chip, cx, GroupIcon, shakeClass, tone, type TabProps } from './parts'
import styles from './Budget.module.css'

/** How many expenses show before "Show all". */
const LIST_PREVIEW = 12

const sumOf = (xs: { amount: number }[]) => round2(xs.reduce((a, x) => a + (Number.isFinite(x.amount) ? x.amount : 0), 0))
const spring = { type: 'spring', stiffness: 500, damping: 36 } as const

interface Flash {
  key: number
  text: string
  color: ButtonColor
}

/** The category picked when you open the Tracker: the last one you used, or a likely one. */
function defaultCategory(categories: Category[], lastId: string | null): string | null {
  if (lastId && categories.some((c) => c.id === lastId)) return lastId
  return (categories.find((c) => c.group === 'wants') ?? categories[0])?.id ?? null
}

/** The short "here's what that did" line after logging. */
function flashFor(cat: Category, amount: number, spentThisMonth: number): Omit<Flash, 'key'> {
  const name = displayName(cat.name)
  const left = round2(cat.amount - spentThisMonth)
  if (cat.group === 'savings') {
    if (cat.amount <= 0) return { text: `Saved ${fmt(amount)} in ${name}.`, color: 'green' }
    if (left > 0.004) return { text: `Saved ${fmt(amount)}. ${fmt(left)} to go this month.`, color: 'green' }
    return { text: `${name} is fully funded this month.`, color: 'green' }
  }
  if (cat.amount <= 0) return { text: `Logged ${fmt(amount)}. ${name} has no plan yet.`, color: 'yellow' }
  if (left > 0.004) return { text: `Logged ${fmt(amount)}. ${fmt(left)} left in ${name}.`, color: 'green' }
  if (left > -0.005) return { text: `Logged. ${name} is exactly on plan.`, color: 'green' }
  return { text: `Logged. ${name} is ${fmt(-left)} over plan.`, color: 'red' }
}

/** The short status line under each progress bar. */
function rowNote(r: CategoryProgress): { text: string; mood: 'over' | 'good' | 'plain' } {
  const left = round2(r.planned - r.spent)
  if (r.orphan) return { text: 'Deleted, but the spending still counts.', mood: 'plain' }
  if (r.group === 'savings') {
    if (r.planned <= 0) return r.spent > 0 ? { text: 'Extra savings', mood: 'good' } : { text: 'No plan yet', mood: 'plain' }
    if (left > 0.004) return { text: `${fmt(left)} to go`, mood: 'plain' }
    if (left < -0.004) return { text: `Funded, plus ${fmt(-left)} extra`, mood: 'good' }
    return { text: 'Fully funded', mood: 'good' }
  }
  if (r.planned <= 0) return r.spent > 0 ? { text: 'Not in your plan yet', mood: 'over' } : { text: 'Nothing planned', mood: 'plain' }
  if (left < -0.004) return { text: `Over by ${fmt(-left)}`, mood: 'over' }
  if (left <= 0.004) return { text: 'Exactly on plan', mood: 'good' }
  return { text: `${fmt(left)} left`, mood: 'plain' }
}

interface MonthNumbers {
  count: number
  isCurrent: boolean
  spent: number
  plannedSpend: number
  saved: number
  plannedSave: number
  daysToGo: number
}

/** One short line about how the month is going. */
function summaryLine(m: MonthNumbers): string {
  if (m.count === 0) return m.isCurrent ? 'Nothing logged yet this month.' : 'Nothing logged that month.'

  let main: string
  const left = round2(m.plannedSpend - m.spent)
  if (m.plannedSpend <= 0 && m.spent > 0) {
    main = `${fmt(m.spent)} spent, but nothing's planned for needs or wants.`
  } else if (m.spent <= 0) {
    main = m.isCurrent && m.plannedSpend > 0 ? `Nothing spent yet. All ${fmt(m.plannedSpend)} is still there.` : 'Nothing spent on needs or wants.'
  } else if (left < -0.004) {
    main = m.isCurrent ? `${fmt(-left)} over the plan for needs and wants. Check the red bars.` : `Finished ${fmt(-left)} over the plan.`
  } else if (!m.isCurrent) {
    main = left > 0.004 ? `Finished ${fmt(left)} under the plan.` : 'Spent exactly the plan.'
  } else if (left <= 0.004) {
    main = 'Plan used up. Anything more comes out of savings.'
  } else if (m.daysToGo <= 1) {
    main = `Last day, and you're ${fmt(left)} under.`
  } else {
    main = `${fmt(left)} left for ${m.daysToGo} days. About ${fmt(left / m.daysToGo)} a day.`
  }

  let savings = ''
  if (m.plannedSave > 0 && m.saved >= m.plannedSave - 0.004) savings = ' Savings is fully funded.'
  else if (m.saved > 0) savings = ` Plus ${fmt(m.saved)} saved.`
  else if (m.plannedSave > 0) savings = m.isCurrent ? ' Savings is still at $0.' : ' Savings got $0.'
  return main + savings
}

export default function Tracker({ data, update, tier, goTo }: TabProps) {
  const track = useGame((s) => s.track)
  const reduce = useReducedMotion()
  const now = useNow(60_000)
  const today = dayKey(now)
  const thisMonth = monthOf(today)
  const { categories, expenses } = data

  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  const [problem, setProblem] = useState<'amount' | 'category' | null>(null)
  const [shakes, setShakes] = useState(0)
  const [flash, setFlash] = useState<Flash | null>(null)
  const [month, setMonth] = useState<MonthKey>(thisMonth)
  const [showAll, setShowAll] = useState(false)
  const [doomed, setDoomed] = useState<Expense | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const amountBox = useRef<HTMLDivElement>(null)

  const categoryId = picked && categories.some((c) => c.id === picked) ? picked : defaultCategory(categories, data.lastCategoryId)

  /* ----- Which month we're looking at ----- */
  const months = useMemo(() => {
    const set = new Set<MonthKey>([thisMonth])
    for (const e of expenses) set.add(monthOf(e.day))
    return [...set].sort().reverse()
  }, [expenses, thisMonth])
  const view = months.includes(month) ? month : thisMonth
  const viewIdx = months.indexOf(view)
  const older: MonthKey | undefined = months[viewIdx + 1]
  const newer: MonthKey | undefined = viewIdx > 0 ? months[viewIdx - 1] : undefined
  const isCurrent = view === thisMonth

  // Newest day first, then newest logged. Sorting by day keeps each day in one group (and React keys unique).
  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthOf(e.day) === view).sort((a, b) => (a.day === b.day ? b.at - a.at : a.day < b.day ? 1 : -1)),
    [expenses, view],
  )
  const rows = useMemo(() => categoryProgress(categories, monthExpenses), [categories, monthExpenses])

  const plan: Record<Group, number> = { needs: 0, wants: 0, savings: 0 }
  for (const c of categories) plan[c.group] = round2(plan[c.group] + c.amount)
  const used: Record<Group, number> = { needs: 0, wants: 0, savings: 0 }
  for (const e of monthExpenses) used[e.group] = round2(used[e.group] + e.amount)

  const total = sumOf(monthExpenses)
  const plannedTotal = round2(plan.needs + plan.wants + plan.savings)
  const plannedSpend = round2(plan.needs + plan.wants)
  const spent = round2(used.needs + used.wants)
  const daysToGo = daysLeftInMonth(now) + 1
  const summary = summaryLine({ count: monthExpenses.length, isCurrent, spent, plannedSpend, saved: used.savings, plannedSave: plan.savings, daysToGo })
  const summaryColor: ButtonColor = monthExpenses.length === 0 ? 'green' : plannedSpend <= 0 && spent > 0 ? 'yellow' : isOver(spent, plannedSpend) ? 'red' : 'green'

  const nameOf = (e: Expense) => displayName(categories.find((c) => c.id === e.categoryId)?.name ?? e.categoryName)
  const when = (day: DayKey) => {
    const label = dayLabel(day, today)
    return label === 'Today' || label === 'Yesterday' ? label.toLowerCase() : `on ${label}`
  }

  /* ----- Logging ----- */
  const log = (e?: FormEvent) => {
    e?.preventDefault()
    const cat = categories.find((c) => c.id === categoryId)
    const amt = cleanAmount(amount)
    if (!cat || !(amt > 0)) {
      sfx.wrong()
      haptic.wrong()
      setProblem(!(amt > 0) ? 'amount' : 'category')
      setShakes((n) => n + 1)
      if (!(amt > 0)) amountBox.current?.querySelector('input')?.focus()
      return
    }
    const at = Date.now()
    // Read the clock now: `today` only refreshes once a minute, which can be yesterday right after midnight.
    const day = dayKey(new Date(at))
    const expense: Expense = {
      id: uid('e'),
      amount: amt,
      categoryId: cat.id,
      categoryName: cat.name.trim().slice(0, 28),
      group: cat.group,
      note: note.trim().slice(0, 40),
      day,
      at,
    }
    const spentBefore = sumOf(expenses.filter((x) => x.categoryId === cat.id && monthOf(x.day) === monthOf(day)))
    update((d) => ({ ...d, expenses: [expense, ...d.expenses].slice(0, MAX_EXPENSES), lastCategoryId: cat.id }))
    setFlash({ key: at, ...flashFor(cat, amt, round2(spentBefore + amt)) })
    sfx.coin()
    haptic.tap()
    track(EVENTS.expenseLogged)
    setAmount(0)
    setNote('')
    setProblem(null)
    setPicked(cat.id)
    setMonth(monthOf(day))
  }

  const pick = (id: string) => {
    sfx.tap()
    haptic.tap()
    setPicked(id)
    if (problem === 'category') setProblem(null)
  }

  const changeMonth = (m: MonthKey | undefined) => {
    if (!m) return
    sfx.tap()
    haptic.tap()
    setMonth(m)
    setShowAll(false)
  }

  const askDelete = (e: Expense) => {
    setDoomed(e)
    setSheetOpen(true)
  }
  const confirmDelete = () => {
    if (!doomed) return
    const id = doomed.id
    update((d) => ({ ...d, expenses: d.expenses.filter((x) => x.id !== id) }))
    haptic.tap()
    setSheetOpen(false)
  }

  /* ----- The list, grouped by day ----- */
  const shown = showAll ? monthExpenses : monthExpenses.slice(0, LIST_PREVIEW)
  const hidden = monthExpenses.length - shown.length
  const byDay: [DayKey, Expense[]][] = []
  for (const e of shown) {
    const lastGroup = byDay[byDay.length - 1]
    if (lastGroup && lastGroup[0] === e.day) lastGroup[1].push(e)
    else byDay.push([e.day, [e]])
  }

  return (
    <div className={styles.stack}>
      {/* ----- Log form ----- */}
      {categories.length > 0 ? (
        <form className={styles.calc} onSubmit={log} noValidate>
          <h2 className={styles.h2}>Log spending</h2>

          <div>
            <span className={styles.fieldLabel} aria-hidden="true">
              How much
            </span>
            <div ref={amountBox} className={cx(styles.bigInput, problem === 'amount' && shakeClass(shakes))}>
              <MoneyInput
                value={amount}
                max={MAX_AMOUNT}
                ariaLabel="How much you spent, in dollars"
                onChange={(n) => {
                  setAmount(cleanAmount(n))
                  if (problem === 'amount') setProblem(null)
                }}
              />
            </div>
          </div>

          <fieldset className={cx(styles.picker, problem === 'category' && shakeClass(shakes))}>
            <legend>What was it for?</legend>
            {GROUP_ORDER.map((g) => {
              const list = categories.filter((c) => c.group === g)
              if (list.length === 0) return null
              const info = GROUPS[g]
              return (
                <div key={g} className={cx(styles.pickerGroup, tone(info.color))}>
                  <span className={styles.pickerLabel}>{info.name}</span>
                  <div className={styles.chips}>
                    {list.map((c) => (
                      <Chip key={c.id} color={info.color} selected={c.id === categoryId} onClick={() => pick(c.id)}>
                        {displayName(c.name)}
                      </Chip>
                    ))}
                  </div>
                </div>
              )
            })}
          </fieldset>

          <label>
            <span className={styles.fieldLabel}>
              Note <span className={styles.faint}>(optional)</span>
            </span>
            <TextInput value={note} maxLength={40} placeholder={NOTE_PLACEHOLDER[tier]} enterKeyHint="done" onChange={(e) => setNote(e.target.value)} />
          </label>

          <AnimatePresence initial={false}>
            {problem && (
              <motion.p key={problem} className={styles.nudge} role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {problem === 'amount' ? 'Type an amount first.' : 'Pick what it was for.'}
              </motion.p>
            )}
          </AnimatePresence>

          <Button type="submit" feedback={false} icon={<Plus size={22} strokeWidth={3} />}>
            Log it
          </Button>

          <AnimatePresence mode="popLayout" initial={false}>
            {flash && (
              <motion.p
                key={flash.key}
                className={cx(styles.flash, tone(flash.color))}
                aria-hidden="true"
                initial={reduce ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
              >
                {flash.text}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="sr-only" role="status">
            {flash?.text ?? ''}
          </p>
        </form>
      ) : (
        <section className={styles.emptyBlock}>
          <h2 className={styles.h2}>Nothing to track yet</h2>
          <p className={styles.muted}>Add a few categories in My Budget first.</p>
          <Button color="blue" block={false} icon={<ArrowRight size={20} strokeWidth={3} />} onClick={() => goTo('budget')}>
            Go to My Budget
          </Button>
        </section>
      )}

      {/* ----- Month summary ----- */}
      <section className={cx(styles.section, tone(summaryColor))} aria-labelledby="tracker-month">
        <div className={styles.monthNav}>
          <h2 id="tracker-month" className={styles.h3}>
            {monthLabel(view)}
          </h2>
          {months.length > 1 && (
            <>
              <IconButton label="Older month" className={styles.navBtn} disabled={!older} onClick={() => changeMonth(older)}>
                <ChevronLeft size={22} strokeWidth={3} />
              </IconButton>
              <IconButton label="Newer month" className={styles.navBtn} disabled={!newer} onClick={() => changeMonth(newer)}>
                <ChevronRight size={22} strokeWidth={3} />
              </IconButton>
            </>
          )}
        </div>

        <div className={styles.summaryTop}>
          <span className={cx(styles.bigNumber, fmt(total).length > 10 && styles.bigNumberLong)}>{fmt(total)}</span>
          <span className={styles.muted}>
            {isCurrent
              ? `logged of ${fmt(plannedTotal)} planned. ${daysToGo <= 1 ? 'Last day of the month.' : `${daysToGo} days to go.`}`
              : `logged, vs. ${fmt(plannedTotal)} in your current plan`}
          </span>
        </div>
        <ProgressBar
          value={plannedTotal > 0 ? total / plannedTotal : total > 0 ? 1 : 0}
          color={summaryColor}
          height={12}
          label={`${fmt(total)} logged out of ${fmt(plannedTotal)} planned`}
        />
        <p>{summary}</p>
      </section>

      {/* ----- Spent vs planned, per category ----- */}
      {rows.length > 0 && (
        <section className={styles.section} aria-labelledby="tracker-cats">
          <h2 id="tracker-cats" className={styles.h3}>
            Spent vs planned
          </h2>
          {GROUP_ORDER.map((g) => {
            const groupRows = rows.filter((r) => r.group === g)
            if (groupRows.length === 0) return null
            const gSpent = sumOf(groupRows.map((r) => ({ amount: r.spent })))
            return (
              <div key={g} className={cx(styles.catGroup, tone(GROUPS[g].color))}>
                <div className={styles.catGroupHead}>
                  <GroupIcon group={g} size={20} strokeWidth={2.5} className={styles.sectionIcon} />
                  <h3 className={styles.catGroupName}>{GROUPS[g].name}</h3>
                  <span className={styles.catGroupNums}>
                    <strong>{fmt(gSpent)}</strong> of {fmt(plan[g])}
                  </span>
                </div>
                {groupRows.map((r) => (
                  <CategoryRow key={r.key} row={r} />
                ))}
              </div>
            )
          })}
        </section>
      )}

      {/* ----- This month's list ----- */}
      {monthExpenses.length > 0 && (
        <section className={styles.section} aria-labelledby="tracker-list">
          <h2 id="tracker-list" className={styles.h3}>
            {isCurrent ? "This month's spending" : `${monthLabel(view)} spending`}
          </h2>
          {byDay.map(([day, list]) => (
            <div key={day} className={styles.dayGroup}>
              <h3 className={styles.dayHead}>{dayLabel(day, today)}</h3>
              <ul className={styles.expList}>
                <AnimatePresence initial={false}>
                  {list.map((e) => (
                    <motion.li
                      key={e.id}
                      className={styles.expRow}
                      initial={reduce ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={spring}
                    >
                      <div className={cx(styles.expInner, tone(GROUPS[e.group].color))}>
                        <span className={styles.dot} aria-hidden="true" />
                        <span className={styles.expText}>
                          <span className={styles.expName}>{nameOf(e)}</span>
                          {e.note && <span className={styles.expNote}>{e.note}</span>}
                        </span>
                        <span className={styles.expAmount}>{fmt(e.amount)}</span>
                        <IconButton label={`Delete ${fmt(e.amount)} for ${nameOf(e)}`} className={styles.trashBtn} onClick={() => askDelete(e)}>
                          <Trash size={19} strokeWidth={2.5} />
                        </IconButton>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          ))}
          {hidden > 0 && (
            <Button variant="outline" size="md" onClick={() => setShowAll(true)}>
              Show all {monthExpenses.length}
            </Button>
          )}
          <div className={styles.listFoot}>
            <span>Month total</span>
            <strong>{fmt(total)}</strong>
          </div>
        </section>
      )}

      <p className={styles.tip}>
        {tier === 1
          ? 'A $2 snack four times a week costs about $35 a month.'
          : 'A $6 drink five times a week costs about $130 a month.'}
      </p>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Delete this one?">
        {doomed && (
          <p className={styles.sheetText}>
            {fmt(doomed.amount)} on {nameOf(doomed)}
            {doomed.note ? ` ("${doomed.note}")` : ''}, logged {when(doomed.day)}. There's no undo.
          </p>
        )}
        <Button color="red" icon={<Trash size={20} strokeWidth={3} />} onClick={confirmDelete}>
          Delete it
        </Button>
        <Button variant="outline" onClick={() => setSheetOpen(false)}>
          Keep it
        </Button>
      </Sheet>
    </div>
  )
}

function CategoryRow({ row }: { row: CategoryProgress }) {
  const over = isOver(row.spent, row.planned)
  const color: ButtonColor = over ? (row.group === 'savings' ? 'green' : 'red') : GROUPS[row.group].color
  const note = rowNote(row)
  return (
    <div className={styles.catRow}>
      <div className={styles.catTop}>
        <span className={styles.catName}>{row.name}</span>
        <span className={styles.catNums}>
          <strong>{fmt(row.spent)}</strong> / {fmt(row.planned)}
        </span>
      </div>
      <ProgressBar value={fillRatio(row.spent, row.planned)} color={color} height={10} label={`${row.name}: ${fmt(row.spent)} of ${fmt(row.planned)}`} />
      <span className={cx(styles.catNote, note.mood === 'over' && styles.catNoteOver, note.mood === 'good' && styles.catNoteGood)}>{note.text}</span>
    </div>
  )
}
