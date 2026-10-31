/* One savings goal: progress, ETA, quick "add money" chips, and a little coin pop. */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '../../components/Button'
import { ProgressBar } from '../../components/ui'
import { cash, doneOnPhrase, eta, isDone, percentLabel, progressOf, tookPhrase, type Goal } from './logic'
import styles from './Savings.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

interface Pop {
  id: number
  label: string
}

export function GoalCard({
  goal,
  chips,
  onAdd,
  onCustom,
  onEdit,
  onDelete,
}: {
  goal: Goal
  chips: number[]
  /** Positive adds money, negative takes it back out (used by Undo). */
  onAdd: (amount: number) => void
  onCustom: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const reduce = useReducedMotion()
  const done = isDone(goal)
  const [pops, setPops] = useState<Pop[]>([])
  const [bump, setBump] = useState(0)
  const [undo, setUndo] = useState<{ amount: number; key: number } | null>(null)
  const popSeq = useRef(0)

  useEffect(() => {
    if (!undo) return
    const t = setTimeout(() => setUndo(null), 5000)
    return () => clearTimeout(t)
  }, [undo])

  const add = (amount: number) => {
    const id = ++popSeq.current
    setPops((p) => [...p, { id, label: `+${cash(amount)}` }])
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 900)
    setBump((b) => b + 1)
    setUndo({ amount, key: id })
    onAdd(amount)
  }

  const info = eta(goal.target, goal.saved, goal.weekly)
  const extra = goal.saved - goal.target
  const vars = {
    ['--gc' as string]: `var(--c-${done ? 'green' : goal.color})`,
    ['--gcd' as string]: `var(--c-${done ? 'green' : goal.color}-dark)`,
    ['--gcs' as string]: `var(--c-${done ? 'green' : goal.color}-soft)`,
  } as CSSProperties

  return (
    <article className={cx(styles.goal, done && styles.goalDone)} style={vars} aria-label={`${goal.name}: ${cash(goal.saved)} of ${cash(goal.target)} saved`}>
      <div className={styles.goalTop}>
        <div className={styles.tileWrap}>
          <motion.span
            key={bump}
            className={styles.tile}
            aria-hidden
            animate={bump && !reduce ? { scale: [1, 1.18, 0.96, 1] } : undefined}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {goal.emoji}
          </motion.span>
          <AnimatePresence>
            {pops.map((p) => (
              <motion.span
                key={p.id}
                className={styles.pop}
                aria-hidden
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: reduce ? 0 : -30 }}
                exit={{ opacity: 0, y: reduce ? 0 : -42 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {p.label}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <div className={styles.goalText}>
          <h3 className={styles.goalName}>{goal.name}</h3>
          <p className={styles.goalAmounts}>
            <strong>{cash(goal.saved)}</strong> of {cash(goal.target)}
          </p>
        </div>

        <div className={styles.goalActions}>
          <IconButton label={`Edit ${goal.name}`} onClick={onEdit}>
            <Pencil size={18} strokeWidth={2.25} />
          </IconButton>
          <IconButton label={`Delete ${goal.name}`} onClick={onDelete}>
            <Trash2 size={18} strokeWidth={2.25} />
          </IconButton>
        </div>
      </div>

      <div className={styles.progressRow}>
        <ProgressBar value={progressOf(goal)} color={done ? 'green' : goal.color} height={16} label={`${goal.name} progress`} />
        <span className={styles.pct}>{percentLabel(goal)}</span>
      </div>

      {done ? (
        <p className={styles.doneText}>
          {doneOnPhrase(goal)} {tookPhrase(goal)}
          {extra >= 0.01 && ` Plus ${cash(extra)} extra.`}
        </p>
      ) : (
        <>
          <p className={styles.eta}>{info.text}</p>

          <div className={styles.chips} role="group" aria-label={`Add money to ${goal.name}`}>
            {chips.map((n) => (
              <button key={n} type="button" className={styles.chip} onClick={() => add(n)}>
                +{cash(n)}
              </button>
            ))}
            <button type="button" className={cx(styles.chip, styles.chipCustom)} onClick={onCustom}>
              Other
            </button>
          </div>
        </>
      )}

      <AnimatePresence initial={false}>
        {undo && !done && (
          <motion.div
            key={undo.key}
            className={styles.undo}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className={styles.undoInner}>
              <span role="status">Added {cash(undo.amount)}.</span>
              <button
                type="button"
                className={styles.undoBtn}
                onClick={() => {
                  onAdd(-undo.amount)
                  setUndo(null)
                }}
              >
                Undo
              </button>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}
