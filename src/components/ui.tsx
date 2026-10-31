/*
  Small shared building blocks. Import what you need:
    import { Card, ProgressBar, Pill, Segmented, Toggle, Field, MoneyInput, Stat, Empty } from '../components/ui'
*/
import { useId, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react'
import type { ButtonColor } from './Button'
import { sfx } from '../lib/sound'
import styles from './ui.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')
const colorVars = (color: ButtonColor): CSSProperties =>
  ({ ['--c' as string]: `var(--c-${color})`, ['--cd' as string]: `var(--c-${color}-dark)`, ['--cs' as string]: `var(--c-${color}-soft)` }) as CSSProperties

/** A rounded box with a soft edge. `color` tints it; `onClick` makes it pressable. */
export function Card({
  children,
  className,
  color,
  onClick,
  padded = true,
  style,
}: {
  children: ReactNode
  className?: string
  color?: ButtonColor
  onClick?: () => void
  padded?: boolean
  style?: CSSProperties
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={cx(styles.card, color && styles.cardTinted, onClick && styles.cardPress, padded && styles.cardPadded, className)}
      style={{ ...(color && colorVars(color)), ...style }}
      onClick={onClick}
    >
      {children}
    </Tag>
  )
}

/** Horizontal progress bar. `value` is 0..1. */
export function ProgressBar({ value, color = 'green', height = 16, className, label }: { value: number; color?: ButtonColor; height?: number; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className={cx(styles.bar, className)} style={{ height, ...colorVars(color) }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={styles.barFill} style={{ width: `${pct}%` }}>
        {pct > 6 && <span className={styles.barShine} />}
      </div>
    </div>
  )
}

/** A circular progress ring (daily goal, etc). `value` is 0..1. */
export function Ring({ value, size = 56, stroke = 7, color = 'yellow', children }: { value: number; size?: number; stroke?: number; color?: ButtonColor; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className={styles.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`var(--c-${color})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s var(--ease-out)' }}
        />
      </svg>
      <div className={styles.ringInner}>{children}</div>
    </div>
  )
}

/** A small colored label: <Pill color="blue">New</Pill> */
export function Pill({ children, color = 'gray', className }: { children: ReactNode; color?: ButtonColor; className?: string }) {
  return (
    <span className={cx(styles.pill, className)} style={colorVars(color)}>
      {children}
    </span>
  )
}

/** Tab-like switcher. <Segmented value={tab} onChange={setTab} options={[{value:'a', label:'A'}]} /> */
export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string }) {
  return (
    <div className={cx(styles.seg, className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          className={cx(styles.segBtn, o.value === value && styles.segActive)}
          onClick={() => {
            sfx.tap()
            onChange(o.value)
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** On/off switch with a label. */
export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode }) {
  const id = useId()
  return (
    <label className={styles.toggleRow} htmlFor={id}>
      <span className={styles.toggleText}>
        <span className={styles.toggleLabel}>{label}</span>
        {hint && <span className={styles.toggleHint}>{hint}</span>}
      </span>
      <input id={id} type="checkbox" className={styles.toggleInput} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.toggleTrack} aria-hidden>
        <span className={styles.toggleThumb} />
      </span>
    </label>
  )
}

/** Label + input wrapper for forms. */
export function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
      {hint && <span className={styles.fieldHint}>{hint}</span>}
    </label>
  )
}

/** A styled text input. Use with <Field>. */
export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(styles.input, props.className)} />
}

/**
  Number input with an optional "$" in front (or any prefix/suffix).
  Value is a number; empty input reports 0.
*/
export function MoneyInput({
  value,
  onChange,
  prefix = '$',
  suffix,
  min = 0,
  max,
  step = 'any',
  placeholder = '0',
  ariaLabel,
  autoFocus,
}: {
  value: number
  onChange: (n: number) => void
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  step?: number | 'any'
  placeholder?: string
  ariaLabel?: string
  autoFocus?: boolean
}) {
  // Keep what the person actually typed ("0.", "0.05") instead of re-deriving
  // it from the number, which would wipe a leading zero mid-typing. Only
  // resync when the number changes from outside (a preset chip, a reset).
  const shown = (n: number) => (Number.isFinite(n) && n !== 0 ? String(n) : '')
  const [text, setText] = useState(() => shown(value))
  const typed = parseFloat(text)
  const matches = (Number.isFinite(typed) ? typed : 0) === (Number.isFinite(value) ? value : 0)
  if (!matches) {
    // Render-time sync (React's recommended pattern for derived state).
    setText(shown(value))
  }
  return (
    <div className={styles.money}>
      {prefix && <span className={styles.moneyAffix}>{prefix}</span>}
      <input
        className={styles.moneyInput}
        type="number"
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        onChange={(e) => {
          const raw = e.target.value
          const n = parseFloat(raw)
          const next = Number.isFinite(n) ? (max !== undefined ? Math.min(max, n) : n) : 0
          setText(next === n || !Number.isFinite(n) ? raw : String(next))
          onChange(next)
        }}
      />

      {suffix && <span className={styles.moneyAffix}>{suffix}</span>}
    </div>
  )
}

/** Labeled range slider. */
export function Slider({ value, onChange, min, max, step = 1, label, display, color = 'blue' }: { value: number; onChange: (n: number) => void; min: number; max: number; step?: number; label: ReactNode; display?: ReactNode; color?: ButtonColor }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className={styles.slider} style={colorVars(color)}>
      <span className={styles.sliderTop}>
        <span className={styles.fieldLabel}>{label}</span>
        <span className={styles.sliderValue}>{display ?? value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={styles.sliderInput}
        style={{ ['--pct' as string]: `${pct}%` }}
      />
    </label>
  )
}

/** Big number with a small label: <Stat label="Total interest" value="$1,234" color="red" /> */
export function Stat({ label, value, color, sub }: { label: ReactNode; value: ReactNode; color?: ButtonColor; sub?: ReactNode }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue} style={color ? { color: `var(--c-${color})` } : undefined}>
        {value}
      </span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  )
}

/** Friendly empty state. */
export function Empty({ emoji, title, children }: { emoji: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyEmoji}>{emoji}</div>
      <h3>{title}</h3>
      {children && <div className={styles.emptyBody}>{children}</div>}
    </div>
  )
}

/** A colored callout box for tips: <Callout emoji="💡" color="blue">...</Callout> */
export function Callout({ emoji, color = 'blue', title, children }: { emoji?: string; color?: ButtonColor; title?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.callout} style={colorVars(color)}>
      {emoji && <span className={styles.calloutEmoji}>{emoji}</span>}
      <div>
        {title && <div className={styles.calloutTitle}>{title}</div>}
        <div className={styles.calloutBody}>{children}</div>
      </div>
    </div>
  )
}
