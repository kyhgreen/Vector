/*
  Savings Goals: pick something you want, set a weekly amount, and watch the
  bar fill up. Hitting a goal throws a small party.
*/
import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronRight, Plus } from 'lucide-react'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { Card, Empty, MoneyInput, Segmented } from '../../components/ui'
import { celebrate } from '../../lib/confetti'
import { dayKey } from '../../lib/dates'
import { plural } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { EVENTS } from '../../state/badges'
import { useToolState } from '../../state/hooks'
import { useGame } from '../../state/store'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'
import {
  cash,
  DEFAULT_EMOJI,
  defaultsFor,
  GOAL_COLORS,
  IDEAS_OLDER,
  IDEAS_YOUNGER,
  INITIAL_SAVINGS,
  isDone,
  isOlder,
  MAX_AMOUNT,
  newId,
  sanitize,
  sortGoals,
  toCents,
  tookPhrase,
  type Goal,
  type GoalDraft,
  type Idea,
  type SavingsData,
} from './logic'
import styles from './Savings.module.css'

const TOOL_ID = 'savings'

type SheetState =
  | { kind: 'new'; key: number; preset?: Idea }
  | { kind: 'edit'; key: number; goal: Goal }
  | { kind: 'custom'; key: number; goal: Goal }
  | { kind: 'delete'; key: number; goal: Goal }
  | { kind: 'done'; key: number; goal: Goal }

let sheetSeq = 0

/** Latest saved goals, read straight from the store (never a stale render). */
const freshGoals = () => sanitize(useGame.getState().tools[TOOL_ID]).goals

export default function SavingsTool() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const age = useGame((s) => s.profile.age)
  const track = useGame((s) => s.track)
  const [raw, setRaw] = useToolState<SavingsData>(TOOL_ID, INITIAL_SAVINGS)
  const data = useMemo(() => sanitize(raw), [raw])
  const goals = useMemo(() => sortGoals(data.goals), [data])
  const defaults = defaultsFor(age)
  const ideas = isOlder(age) ? IDEAS_OLDER : IDEAS_YOUNGER

  // `sheet` says which sheet is open; `shown` keeps its content around while it animates closed.
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [shown, setShown] = useState<SheetState | null>(null)
  const open = useCallback((s: SheetState) => {
    setShown(s)
    setSheet(s)
  }, [])
  const close = useCallback(() => setSheet(null), [])

  const writeGoals = (fn: (goals: Goal[]) => Goal[]) => setRaw((prev) => ({ ...sanitize(prev), goals: fn(sanitize(prev).goals) }))

  const finishGoal = (goal: Goal) => {
    track(EVENTS.goalCompleted)
    sfx.complete()
    haptic.celebrate()
    celebrate('big')
    open({ kind: 'done', key: ++sheetSeq, goal })
  }

  /** Adds (or with a negative number, removes) money. Celebrates if it crosses the finish line. */
  const adjust = (id: string, delta: number) => {
    const before = freshGoals().find((g) => g.id === id)
    if (!before || !Number.isFinite(delta) || delta === 0) return
    const saved = toCents(Math.min(MAX_AMOUNT, Math.max(0, before.saved + delta)))
    const after: Goal = { ...before, saved, doneDay: isDone({ target: before.target, saved }) ? (before.doneDay ?? dayKey()) : null }
    writeGoals((gs) => gs.map((g) => (g.id === id ? after : g)))
    if (!isDone(before) && isDone(after)) finishGoal(after)
    else if (delta > 0) {
      sfx.coin()
      haptic.tap()
    } else sfx.tap()
  }

  const create = (d: GoalDraft) => {
    const goal: Goal = {
      id: newId(),
      name: d.name,
      emoji: d.emoji,
      color: GOAL_COLORS[freshGoals().length % GOAL_COLORS.length],
      target: toCents(d.target),
      saved: toCents(d.saved),
      weekly: toCents(d.weekly),
      createdDay: dayKey(),
      doneDay: null,
    }
    writeGoals((gs) => [...gs, goal])
    track(EVENTS.goalCreated)
    sfx.match()
    haptic.correct()
    close()
  }

  const saveEdit = (id: string, d: GoalDraft) => {
    const before = freshGoals().find((g) => g.id === id)
    if (!before) return close()
    const target = toCents(d.target)
    const saved = toCents(d.saved)
    const nowDone = isDone({ target, saved })
    const after: Goal = { ...before, name: d.name, emoji: d.emoji, target, saved, weekly: toCents(d.weekly), doneDay: nowDone ? (before.doneDay ?? dayKey()) : null }
    writeGoals((gs) => gs.map((g) => (g.id === id ? after : g)))
    close()
    if (!isDone(before) && nowDone) setTimeout(() => finishGoal(after), 260)
  }

  const remove = (id: string) => {
    writeGoals((gs) => gs.filter((g) => g.id !== id))
    sfx.heartLost()
    haptic.tap()
    close()
  }

  const newDraft = (preset?: Idea): GoalDraft =>
    preset
      ? { name: preset.name, emoji: preset.emoji, target: preset.target, saved: 0, weekly: defaults.weekly }
      : { name: '', emoji: DEFAULT_EMOJI, target: defaults.target, saved: 0, weekly: defaults.weekly }

  const openNew = (preset?: Idea) => open({ kind: 'new', key: ++sheetSeq, preset })

  // Summary numbers
  const active = data.goals.filter((g) => !isDone(g))
  const doneCount = data.goals.length - active.length
  const totalSaved = data.goals.reduce((a, g) => a + g.saved, 0)
  const weeklyTotal = active.reduce((a, g) => a + g.weekly, 0)

  const live = (g: Goal) => data.goals.find((x) => x.id === g.id) ?? g

  return (
    <div className={styles.page}>
      {data.goals.length === 0 ? (
        <section className={styles.empty}>
          <Empty emoji="🐷" title="No goals yet">
            Set a price and a weekly amount to get a finish date.
          </Empty>
          <Button color="orange" icon={<Plus size={20} strokeWidth={3} />} onClick={() => openNew()}>
            New goal
          </Button>
          <p className={styles.groupLabel}>Ideas</p>
          <div className={styles.ideas}>
            {ideas.map((idea) => (
              <button
                key={idea.name}
                type="button"
                className={styles.idea}
                onClick={() => {
                  sfx.tap()
                  haptic.tap()
                  openNew(idea)
                }}
              >
                <span aria-hidden>{idea.emoji}</span>
                <span className={styles.ideaName}>{idea.name}</span>
                <span className={styles.ideaPrice}>{cash(idea.target)}</span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <>
          <div className={styles.hero}>
            <p className={styles.heroValue}>{cash(totalSaved)}</p>
            <p className={styles.heroSub}>
              {active.length
                ? `saved so far. ${plural(active.length, 'goal')} going${doneCount ? `, ${doneCount} done` : ''}${weeklyTotal > 0 ? `, ${cash(weeklyTotal)} a week.` : '.'}`
                : `saved, and ${doneCount === 1 ? 'your goal is' : `all ${plural(doneCount, 'goal')}`} done.`}
            </p>
          </div>

          <Button color="orange" icon={<Plus size={20} strokeWidth={3} />} onClick={() => openNew()}>
            New goal
          </Button>

          <div className={styles.list}>
            <AnimatePresence initial={false} mode="popLayout">
              {goals.map((g) => (
                <motion.div
                  key={g.id}
                  layout={!reduce}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.18 } }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                >
                  <GoalCard
                    goal={g}
                    chips={defaults.chips}
                    onAdd={(n) => adjust(g.id, n)}
                    onCustom={() => open({ kind: 'custom', key: ++sheetSeq, goal: g })}
                    onEdit={() => open({ kind: 'edit', key: ++sheetSeq, goal: g })}
                    onDelete={() => open({ kind: 'delete', key: ++sheetSeq, goal: g })}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      <p className={styles.tip}>
        <strong>Pay yourself first.</strong> Move money into savings on the day you get it, before you spend any.
      </p>

      <Card onClick={() => navigate('/tools/growth')} className={styles.linkCard}>
        <span className={styles.linkText}>
          <span className={styles.linkTitle}>Growth Calculator</span>
          <span className={styles.linkSub}>See how interest grows your savings.</span>
        </span>
        <ChevronRight size={22} strokeWidth={2.5} className={styles.linkChev} aria-hidden />
      </Card>

      {/* ---------- Sheets ---------- */}
      <Sheet open={sheet?.kind === 'new'} onClose={close} title="New goal">
        {shown?.kind === 'new' && (
          <GoalForm key={shown.key} mode="new" initial={newDraft(shown.preset)} ideas={shown.preset ? undefined : ideas} weeklyChips={defaults.chips} onSubmit={create} />
        )}
      </Sheet>

      <Sheet open={sheet?.kind === 'edit'} onClose={close} title="Edit goal">
        {shown?.kind === 'edit' && (
          <GoalForm
            key={shown.key}
            mode="edit"
            initial={{ name: shown.goal.name, emoji: shown.goal.emoji, target: shown.goal.target, saved: shown.goal.saved, weekly: shown.goal.weekly }}
            weeklyChips={defaults.chips}
            onSubmit={(d) => saveEdit(shown.goal.id, d)}
          />
        )}
      </Sheet>

      <Sheet open={sheet?.kind === 'custom'} onClose={close} title={shown?.kind === 'custom' ? live(shown.goal).name : undefined} emoji={shown?.kind === 'custom' ? live(shown.goal).emoji : undefined}>
        {shown?.kind === 'custom' && (
          <CustomAmount
            key={shown.key}
            goal={live(shown.goal)}
            onSubmit={(delta) => {
              close()
              adjust(shown.goal.id, delta)
            }}
          />
        )}
      </Sheet>

      <Sheet open={sheet?.kind === 'delete'} onClose={close} title={shown?.kind === 'delete' ? `Delete ${shown.goal.name}?` : undefined}>
        {shown?.kind === 'delete' && (
          <>
            {shown.goal.saved > 0 && <p className={styles.sheetText}>This removes the goal from the app. It does not change the {cash(shown.goal.saved)} you saved.</p>}
            <Button color="red" onClick={() => remove(shown.goal.id)}>
              Delete
            </Button>
            <Button variant="outline" block onClick={close}>
              Keep it
            </Button>
          </>
        )}
      </Sheet>

      <Sheet open={sheet?.kind === 'done'} onClose={close} title="Goal reached">
        {shown?.kind === 'done' && (
          <>
            <motion.div
              className={styles.partyEmoji}
              aria-hidden
              initial={reduce ? false : { scale: 0.4, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 14 }}
            >
              {shown.goal.emoji}
            </motion.div>
            <p className={styles.partyAmount}>{cash(shown.goal.saved)}</p>
            <p className={styles.sheetText}>
              saved for <strong>{shown.goal.name}</strong>. {tookPhrase(shown.goal)}
            </p>
            <Button
              color="orange"
              onClick={() => {
                close()
                setTimeout(() => openNew(), 260)
              }}
            >
              New goal
            </Button>
            <Button variant="outline" block onClick={close}>
              Back
            </Button>
          </>
        )}
      </Sheet>
    </div>
  )
}

/** "Custom" amount: put money in, or take some out. */
function CustomAmount({ goal, onSubmit }: { goal: Goal; onSubmit: (delta: number) => void }) {
  const [mode, setMode] = useState<'add' | 'take'>('add')
  const [amount, setAmount] = useState(0)
  const coarse = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches
  const value = toCents(Number.isFinite(amount) ? amount : 0)
  const after = toCents(mode === 'add' ? goal.saved + value : goal.saved - value)
  const tooMuch = mode === 'take' && value > goal.saved
  const ready = value > 0 && !tooMuch

  let hint: string
  if (mode === 'take' && goal.saved <= 0) hint = 'Nothing saved yet, so there is nothing to take out.'
  else if (tooMuch) hint = `You only have ${cash(goal.saved)} saved.`
  else if (value > 0) hint = `That makes ${cash(after)} of ${cash(goal.target)}.${mode === 'add' && after >= goal.target ? ' That finishes the goal.' : ''}`
  else hint = mode === 'add' ? 'Small amounts count too.' : 'Take out money you spent or moved.'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!ready) return
    onSubmit(mode === 'add' ? value : -value)
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'add', label: 'Add' },
          { value: 'take', label: 'Take out' },
        ]}
      />
      <MoneyInput value={amount} onChange={setAmount} max={MAX_AMOUNT} ariaLabel={mode === 'add' ? 'Amount to add' : 'Amount to take out'} autoFocus={!coarse} />
      <p className={tooMuch ? styles.problemBad : styles.sheetHint} aria-live="polite">
        {hint}
      </p>
      <Button type="submit" color={mode === 'add' ? 'orange' : 'blue'} disabled={!ready}>
        {mode === 'add' ? (value > 0 ? `Add ${cash(value)}` : 'Add') : value > 0 ? `Take out ${cash(value)}` : 'Take out'}
      </Button>
    </form>
  )
}
