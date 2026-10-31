/*
  Settings (/profile/settings): name and age, how you learn, sound and looks,
  installing, and the reset button at the very bottom.
  Everything saves the moment you change it, so there is no save button.
*/
import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, CircleCheck, Download, Laptop, RotateCcw, Smartphone } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Button, type ButtonColor } from '../../components/Button'
import { Field, Segmented, TextInput, Toggle } from '../../components/ui'
import { Sheet } from '../../components/Sheet'
import { XpIcon } from '../../components/icons'
import { Avatar } from '../../components/Avatar'
import { useGame } from '../../state/store'
import { useStreak } from '../../state/hooks'
import { DAILY_GOALS, XP } from '../../state/constants'
import type { Settings } from '../../state/types'
import { getTier, tierForAge } from '../../content'
import { number, plural } from '../../lib/format'
import { setSoundEnabled, sfx } from '../../lib/sound'
import { haptic, setHapticsEnabled } from '../../lib/haptics'
import { celebrate } from '../../lib/confetti'
import { detectPlatform, useInstall, type Platform } from './installPrompt'
import { avatarColor, DEFAULT_AVATAR, DEFAULT_NAME, displayName, earnedCount, NAME_MAX, safeNum } from './profileUtils'
import styles from './SettingsScreen.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')
const colorVars = (color: ButtonColor): CSSProperties =>
  ({ ['--c' as string]: `var(--c-${color})`, ['--cd' as string]: `var(--c-${color}-dark)`, ['--cs' as string]: `var(--c-${color}-soft)` }) as CSSProperties

const AGES = [11, 12, 13, 14, 15, 16, 17, 18]

const tap = () => {
  sfx.tap()
  haptic.tap()
}

/** Arrow keys, Home, and End move through a radio group (and pick as they go). */
function radioKeys(e: KeyboardEvent, i: number, n: number, pickIndex: (j: number) => void, refs: { current: (HTMLButtonElement | null)[] }) {
  const moves: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: n - 1 }
  if (!(e.key in moves)) return
  e.preventDefault()
  const j = (moves[e.key] + n) % n
  pickIndex(j)
  refs.current[j]?.focus()
}

export default function SettingsScreen() {
  const settings = useGame((s) => s.settings)
  const updateSettings = useGame((s) => s.updateSettings)

  const set = (patch: Partial<Settings>) => updateSettings(patch)

  return (
    <div className={styles.page}>
      <PageHeader title="Settings" back="/profile" subtitle="Changes save automatically." />

      <div className={styles.stack}>
        <ProfileSection />

        {/* ---------- Learning ---------- */}
        <Section id="set-learning" title="Learning">
          <GoalPicker value={safeNum(settings.dailyGoal)} onChange={(xp) => set({ dailyGoal: xp })} />

          <div className={cx(styles.rows, styles.rowsTop)}>
            <Toggle
              checked={settings.heartsOn}
              onChange={(on) => {
                tap()
                set({ heartsOn: on })
              }}
              label="Hearts"
              hint={settings.heartsOn ? 'Each wrong answer costs a heart. Hearts refill over time.' : "Off. Wrong answers don't cost hearts."}
            />
            <Toggle
              checked={settings.unlockAll}
              onChange={(on) => {
                set({ unlockAll: on })
                if (on) {
                  sfx.unlock()
                  haptic.celebrate()
                } else tap()
              }}
              label="Demo mode"
              hint="Unlocks every lesson. Useful for teachers and judges."
            />
          </div>
        </Section>

        {/* ---------- App ---------- */}
        <AppSection />

        {/* ---------- Install ---------- */}
        <InstallSection />

        {/* ---------- Reset ---------- */}
        <DangerSection />
      </div>
    </div>
  )
}

/* ================================================================== */

function Section({ id, title, className, children }: { id: string; title: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cx(styles.section, className)} aria-labelledby={id}>
      <h2 id={id} className={styles.sectionTitle}>
        {title}
      </h2>
      {children}
    </section>
  )
}

/* ---------- Profile: nickname, avatar, age ---------- */

function ProfileSection() {
  const navigate = useNavigate()
  const profile = useGame((s) => s.profile)
  const unlockAll = useGame((s) => s.settings.unlockAll)
  const updateProfile = useGame((s) => s.updateProfile)
  const [draft, setDraft] = useState(() => (profile?.name ?? '').slice(0, NAME_MAX))

  const avatar = profile?.avatar || DEFAULT_AVATAR
  const age = safeNum(profile?.age)
  const tierId = tierForAge(age || 11)
  const tier = getTier(tierId)
  const tierColor: ButtonColor = tierId === 1 ? 'green' : 'blue'

  const saveName = (v: string) => {
    const clean = v.slice(0, NAME_MAX)
    setDraft(clean)
    updateProfile({ name: clean })
  }
  const tidyName = () => {
    const clean = draft.replace(/\s+/g, ' ').trim()
    if (clean !== draft) setDraft(clean)
    if (clean !== profile?.name) updateProfile({ name: clean })
  }

  const ageRefs = useRef<(HTMLButtonElement | null)[]>([])
  const pickAge = (a: number) => {
    if (a === age) return
    tap()
    updateProfile({ age: a })
  }
  const ageIdx = AGES.indexOf(age)

  return (
    <Section id="set-profile" title="Profile">
      <div className={styles.avatarRow}>
        <span className={styles.miniAvatar} style={colorVars(avatarColor(avatar))} aria-hidden>
          <Avatar id={avatar} size="100%" disc={false} />
        </span>
        <p className={styles.avatarName}>{displayName(draft)}</p>
        <Button size="sm" variant="outline" block={false} onClick={() => navigate('/shop')} aria-label="Change your avatar in the shop">
          Change
        </Button>
      </div>

      <div className={styles.fields}>
        <Field
          label={
            <span className={styles.labelRow}>
              <span>Nickname</span>
              <span className={cx(styles.counter, draft.length >= NAME_MAX && styles.counterFull)} aria-hidden>
                {draft.length}/{NAME_MAX}
              </span>
            </span>
          }
          hint={`Leave it blank to show as "${DEFAULT_NAME}". It stays on this device.`}
        >
          <TextInput
            value={draft}
            onChange={(e) => saveName(e.target.value)}
            onBlur={tidyName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
            maxLength={NAME_MAX}
            placeholder={DEFAULT_NAME}
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            enterKeyHint="done"
          />
        </Field>

        <div className={styles.group}>
          <span id="set-age-label" className={styles.label}>
            Age
          </span>
          <div className={styles.ageGrid} role="radiogroup" aria-labelledby="set-age-label" style={colorVars(tierColor)}>
            {AGES.map((a, idx) => {
              const on = a === age
              return (
                <button
                  key={a}
                  ref={(el) => {
                    ageRefs.current[idx] = el
                  }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`${a} years old`}
                  tabIndex={on || (ageIdx === -1 && idx === 0) ? 0 : -1}
                  className={cx(styles.age, on && styles.ageOn)}
                  onClick={() => pickAge(a)}
                  onKeyDown={(e) => radioKeys(e, idx, AGES.length, (j) => pickAge(AGES[j]), ageRefs)}
                >
                  {a}
                </button>
              )
            })}
          </div>
          <p className={styles.hint} aria-live="polite">
            You start on {tier.name}. Changing this never erases progress.
            {unlockAll && ' Demo mode keeps every lesson open.'}
          </p>
        </div>
      </div>
    </Section>
  )
}

/* ---------- Daily goal ---------- */

/** "About 2 lessons a day." Written here so the goal hints stay plain. */
function goalBlurb(xp: number): string {
  const n = Math.max(1, Math.round(xp / Math.max(1, XP.lesson)))
  return `About ${plural(n, 'lesson')} a day.`
}

function GoalPicker({ value, onChange }: { value: number; onChange: (xp: number) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const idx = DAILY_GOALS.findIndex((g) => g.xp === value)
  const current = DAILY_GOALS[idx]
  const pickIndex = (j: number) => {
    const g = DAILY_GOALS[j]
    if (!g || g.xp === value) return
    tap()
    onChange(g.xp)
  }

  return (
    <div className={styles.group}>
      <span id="set-goal-label" className={styles.label}>
        Daily goal
      </span>
      <div className={styles.goalGrid} role="radiogroup" aria-labelledby="set-goal-label">
        {DAILY_GOALS.map((g, j) => {
          const on = j === idx
          return (
            <button
              key={g.xp}
              ref={(el) => {
                refs.current[j] = el
              }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${g.label}, ${g.xp} XP a day`}
              tabIndex={on || (idx === -1 && j === 0) ? 0 : -1}
              className={cx(styles.goal, on && styles.goalOn)}
              onClick={() => pickIndex(j)}
              onKeyDown={(e) => radioKeys(e, j, DAILY_GOALS.length, pickIndex, refs)}
            >
              <span className={styles.goalName}>{g.label}</span>
              <span className={styles.goalXp}>
                <XpIcon size={15} /> {g.xp} XP
              </span>
              {on && (
                <span className={styles.goalCheck} aria-hidden>
                  <Check size={13} strokeWidth={3.5} />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <p className={styles.hint} aria-live="polite">
        {current ? goalBlurb(current.xp) : value > 0 ? `Custom: ${number(value)} XP a day.` : 'Pick a daily goal.'}
      </p>
    </div>
  )
}

/* ---------- App: sound, vibration, theme ---------- */

function AppSection() {
  const sound = useGame((s) => s.settings.sound)
  const haptics = useGame((s) => s.settings.haptics)
  const theme = useGame((s) => s.settings.theme)
  const updateSettings = useGame((s) => s.updateSettings)
  const canBuzz = typeof navigator !== 'undefined' && 'vibrate' in navigator

  return (
    <Section id="set-app" title="Sound and looks">
      <div className={styles.rows}>
        <Toggle
          checked={sound}
          onChange={(on) => {
            if (on) {
              setSoundEnabled(true) // so the preview ding plays right now
              sfx.correct()
            } else sfx.tap()
            haptic.tap()
            updateSettings({ sound: on })
          }}
          label="Sound effects"
          hint={sound ? undefined : 'All sounds are off.'}
        />
        <Toggle
          checked={haptics}
          onChange={(on) => {
            if (on) {
              setHapticsEnabled(true) // so the preview buzz happens right now
              haptic.correct()
            }
            sfx.tap()
            updateSettings({ haptics: on })
          }}
          label="Vibration"
          hint={canBuzz ? 'Android only.' : "Android only. This device doesn't support vibration."}
        />
      </div>

      <div className={cx(styles.group, styles.groupTop)}>
        <span className={styles.label} id="set-theme-label">
          Theme
        </span>
        <div aria-labelledby="set-theme-label" role="group">
          <Segmented
            value={theme}
            onChange={(t) => {
              haptic.tap()
              updateSettings({ theme: t })
            }}
            options={[
              { value: 'system', label: 'Auto' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </div>
      </div>
    </Section>
  )
}

/* ---------- Install ---------- */

const PLATFORMS: { id: Platform; name: string; icon: ReactNode; how: ReactNode }[] = [
  {
    id: 'ios',
    name: 'iPhone or iPad',
    icon: <Smartphone size={20} strokeWidth={2.25} />,
    how: (
      <>
        In Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>.
      </>
    ),
  },
  {
    id: 'android',
    name: 'Android',
    icon: <Smartphone size={20} strokeWidth={2.25} />,
    how: (
      <>
        In Chrome, tap the menu (<b>⋮</b>), then <b>Install app</b>.
      </>
    ),
  },
  {
    id: 'desktop',
    name: 'Computer (Windows, Mac, Chromebook, Linux)',
    icon: <Laptop size={20} strokeWidth={2.25} />,
    how: (
      <>
        In Chrome or Edge, click the <b>install icon</b> in the address bar. In Safari on a Mac, choose <b>File</b>, then <b>Add to Dock</b>.
      </>
    ),
  },
]

function Step({ p, mine }: { p: (typeof PLATFORMS)[number]; mine?: boolean }) {
  return (
    <li className={styles.step}>
      <span className={styles.stepIcon} aria-hidden>
        {p.icon}
      </span>
      <div className={styles.stepText}>
        <p className={styles.stepName}>
          {p.name}
          {mine && <span className={styles.mine}> (this one)</span>}
        </p>
        <p className={styles.stepHow}>{p.how}</p>
      </div>
    </li>
  )
}

function InstallSection() {
  const { installed, canPrompt, prompt } = useInstall()
  const platform = useMemo(detectPlatform, [])
  const [busy, setBusy] = useState(false)
  const mine = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[2]
  const others = PLATFORMS.filter((p) => p !== mine)

  const install = async () => {
    setBusy(true)
    const ok = await prompt()
    setBusy(false)
    if (ok) {
      sfx.complete()
      haptic.celebrate()
      celebrate('small')
    }
  }

  return (
    <Section id="set-install" title="Install">
      {installed ? (
        <p className={styles.installed}>
          <CircleCheck size={22} strokeWidth={2.5} aria-hidden /> Vector is installed on this device.
        </p>
      ) : (
        <>
          <p className={styles.text}>Add Vector to your home screen or desktop. Once installed, it also works offline.</p>
          {canPrompt && (
            <div className={styles.installBtn}>
              <Button color="teal" icon={<Download size={20} strokeWidth={3} />} onClick={install} disabled={busy}>
                Install
              </Button>
            </div>
          )}
          <ul className={styles.steps}>
            <Step p={mine} mine />
          </ul>
          <details className={styles.more}>
            <summary className={styles.moreSummary}>Other devices</summary>
            <ul className={styles.steps}>
              {others.map((p) => (
                <Step key={p.id} p={p} />
              ))}
            </ul>
          </details>
        </>
      )}
    </Section>
  )
}

/* ---------- Reset ---------- */

function DangerSection() {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  return (
    <Section id="set-danger" title="Start over" className={styles.danger}>
      <p className={styles.text}>Deletes all progress on this device, including XP, coins, streak, and badges.</p>
      <div className={styles.dangerBtn}>
        <Button color="red" icon={<RotateCcw size={20} strokeWidth={3} />} onClick={() => setStep(1)}>
          Reset progress
        </Button>
      </div>
      <ResetSheet step={step} setStep={setStep} />
    </Section>
  )
}

/** "a, b, and c" */
function joinAnd(items: string[]): string {
  if (items.length <= 1) return items.join('')
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function ResetSheet({ step, setStep }: { step: 0 | 1 | 2; setStep: (s: 0 | 1 | 2) => void }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const xp = Math.floor(safeNum(useGame((s) => s.xpTotal)))
  const coins = Math.floor(safeNum(useGame((s) => s.coins)))
  const lessons = useGame((s) => Object.keys(s.lessons ?? {}).length)
  const badges = useGame((s) => earnedCount(s))
  const streak = useStreak().count
  const resetAll = useGame((s) => s.resetAll)
  // Keep the last step on screen while the sheet slides away.
  const [shown, setShown] = useState<1 | 2>(1)
  if (step !== 0 && step !== shown) setShown(step)
  const view = step === 0 ? shown : step

  const close = () => setStep(0)
  const wipe = () => {
    haptic.wrong()
    sfx.wrong()
    resetAll()
    navigate('/welcome', { replace: true })
  }

  const losses = [
    { n: xp, text: `${number(xp)} XP` },
    { n: streak, text: `a ${number(streak)}-day streak` },
    { n: badges, text: plural(badges, 'badge') },
    { n: lessons, text: plural(lessons, 'lesson') },
    { n: coins, text: plural(coins, 'coin') },
  ]
    .filter((l) => l.n > 0)
    .map((l) => l.text)

  return (
    <Sheet open={step !== 0} onClose={close} emoji="⚠️" title={view === 1 ? 'Reset everything?' : 'Are you sure?'}>
      <AnimatePresence mode="wait" initial={false}>
        {view === 1 ? (
          <motion.div
            key="one"
            className={styles.sheet}
            initial={reduce ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            <p className={styles.sheetText}>
              {losses.length > 0 ? `You'd lose ${joinAnd(losses)}.` : "There isn't much progress yet, but a reset can't be undone."}
            </p>
            <div className={styles.sheetBtns}>
              <Button color="green" onClick={close} autoFocus>
                Keep my progress
              </Button>
              <Button variant="ghost" color="red" block onClick={() => setStep(2)}>
                Reset anyway
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="two"
            className={styles.sheet}
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: 16 }}
            transition={{ duration: 0.18 }}
          >
            <p className={styles.sheetText}>This can't be undone. All progress on this device will be deleted.</p>
            <div className={styles.sheetBtns}>
              <Button color="red" onClick={wipe}>
                Yes, reset everything
              </Button>
              <Button variant="outline" onClick={close} autoFocus>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  )
}
