/* The "New goal" / "Edit goal" form that lives inside a Sheet. */
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '../../components/Button'
import { Field, MoneyInput, TextInput } from '../../components/ui'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { cash, draftProblem, eta, GOAL_EMOJIS, MAX_AMOUNT, MAX_NAME, speedUpTip, type GoalDraft, type Idea } from './logic'
import styles from './Savings.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

const COLS = 6

export function GoalForm({
  mode,
  initial,
  ideas,
  weeklyChips,
  onSubmit,
}: {
  mode: 'new' | 'edit'
  initial: GoalDraft
  ideas?: Idea[]
  weeklyChips: number[]
  onSubmit: (d: GoalDraft) => void
}) {
  const [d, setD] = useState<GoalDraft>(initial)
  const set = (patch: Partial<GoalDraft>) => setD((prev) => ({ ...prev, ...patch }))
  const problem = draftProblem(d, mode)
  const preview = eta(d.target, d.saved, d.weekly)
  const tip = speedUpTip(d.target, d.saved, d.weekly)
  const emojiRefs = useRef<(HTMLButtonElement | null)[]>([])
  const emojiLabelId = useId()
  const coarse = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (problem) {
      sfx.wrong()
      haptic.wrong()
      return
    }
    onSubmit({ ...d, name: d.name.trim().slice(0, MAX_NAME) })
  }

  const pickEmoji = (i: number, focus = false) => {
    const opt = GOAL_EMOJIS[(i + GOAL_EMOJIS.length) % GOAL_EMOJIS.length]
    set({ emoji: opt.emoji })
    sfx.tap()
    haptic.tap()
    if (focus) emojiRefs.current[GOAL_EMOJIS.indexOf(opt)]?.focus()
  }

  const onEmojiKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = Math.max(0, GOAL_EMOJIS.findIndex((o) => o.emoji === d.emoji))
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLS, ArrowUp: -COLS }
    if (e.key in moves) {
      e.preventDefault()
      pickEmoji(cur + moves[e.key], true)
    }
  }

  const selectedIndex = GOAL_EMOJIS.findIndex((o) => o.emoji === d.emoji)

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {ideas && ideas.length > 0 && (
        <div className={styles.formGroup}>
          <span className={styles.groupLabel}>Ideas</span>
          <div className={styles.ideas}>
            {ideas.map((idea) => {
              const active = d.name === idea.name && d.target === idea.target
              return (
                <button
                  key={idea.name}
                  type="button"
                  className={cx(styles.idea, active && styles.ideaActive)}
                  aria-pressed={active}
                  onClick={() => {
                    sfx.tap()
                    haptic.tap()
                    set({ name: idea.name, emoji: idea.emoji, target: idea.target })
                  }}
                >
                  <span aria-hidden>{idea.emoji}</span>
                  <span className={styles.ideaName}>{idea.name}</span>
                  <span className={styles.ideaPrice}>{cash(idea.target)}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <Field label="Saving for">
        <TextInput
          value={d.name}
          maxLength={MAX_NAME}
          placeholder="A guitar, new sneakers..."
          autoFocus={mode === 'new' && !coarse}
          enterKeyHint="next"
          onChange={(e) => set({ name: e.target.value })}
        />
      </Field>

      <div className={styles.formGroup}>
        <span className={styles.groupLabel} id={emojiLabelId}>
          Emoji
        </span>
        <div className={styles.emojiGrid} role="radiogroup" aria-labelledby={emojiLabelId} onKeyDown={onEmojiKey}>
          {GOAL_EMOJIS.map((o, i) => {
            const on = o.emoji === d.emoji
            return (
              <button
                key={o.emoji}
                ref={(el) => {
                  emojiRefs.current[i] = el
                }}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={o.label}
                title={o.label}
                tabIndex={on || (selectedIndex === -1 && i === 0) ? 0 : -1}
                className={cx(styles.emojiBtn, on && styles.emojiOn)}
                onClick={() => pickEmoji(i)}
              >
                <span aria-hidden>{o.emoji}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.twoCol}>
        <Field label="Price">
          <MoneyInput value={d.target} max={MAX_AMOUNT} ariaLabel="Price" onChange={(n) => set({ target: n })} />
        </Field>
        <Field label="Saved so far">
          <MoneyInput value={d.saved} max={MAX_AMOUNT} ariaLabel="Saved so far" onChange={(n) => set({ saved: n })} />
        </Field>
      </div>

      <div className={styles.formGroup}>
        <Field label="Each week">
          <MoneyInput value={d.weekly} max={MAX_AMOUNT} ariaLabel="Each week" suffix="/wk" onChange={(n) => set({ weekly: n })} />
        </Field>
        <div className={styles.weeklyChips}>
          {weeklyChips.map((n) => (
            <button
              key={n}
              type="button"
              className={cx(styles.miniChip, d.weekly === n && styles.miniChipOn)}
              aria-pressed={d.weekly === n}
              onClick={() => {
                sfx.tap()
                haptic.tap()
                set({ weekly: n })
              }}
            >
              {cash(n)}/wk
            </button>
          ))}
        </div>
      </div>

      <div className={cx(styles.preview, preview.tone === 'ok' && styles.previewOk)} aria-live="polite">
        <p className={styles.previewText}>{preview.text}</p>
        {tip && <p className={styles.previewTip}>{tip}</p>}
      </div>

      {problem && <p className={styles.problem}>{problem}</p>}

      <Button type="submit" color="orange" disabled={!!problem}>
        {mode === 'new' ? 'Create goal' : 'Save'}
      </Button>
    </form>
  )
}
