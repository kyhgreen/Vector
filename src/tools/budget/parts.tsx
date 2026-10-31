/* Small pieces shared by the three Budget Builder tabs. */
import { useEffect, useState, type ReactNode, type RefObject } from 'react'
import { House, PiggyBank, Sparkles, type LucideProps } from 'lucide-react'
import type { ButtonColor } from '../../components/Button'
import type { TierId } from '../../content/types'
import type { BudgetData, Group, Tab } from './model'
import type { BudgetUpdate } from './useBudget'
import styles from './Budget.module.css'

export interface TabProps {
  data: BudgetData
  update: BudgetUpdate
  tier: TierId
  goTo: (tab: Tab) => void
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/** Sets --t / --td / --ts / --ti (color, edge, tint, readable ink) for a brand color. */
export const TONE: Partial<Record<ButtonColor, string>> = {
  green: styles.toneGreen,
  blue: styles.toneBlue,
  orange: styles.toneOrange,
  red: styles.toneRed,
  yellow: styles.toneYellow,
  teal: styles.toneTeal,
  purple: styles.tonePurple,
  gray: styles.toneGray,
}
export const tone = (c: ButtonColor) => TONE[c] ?? styles.toneGray

const GROUP_ICONS = { needs: House, wants: Sparkles, savings: PiggyBank } as const

export function GroupIcon({ group, ...props }: { group: Group } & LucideProps) {
  const Icon = GROUP_ICONS[group]
  return <Icon size={20} strokeWidth={2.75} aria-hidden {...props} />
}

/** A pill button for presets and pickers. */
export function Chip({
  children,
  onClick,
  selected,
  color = 'gray',
  icon,
  label,
}: {
  children: ReactNode
  onClick: () => void
  selected?: boolean
  color?: ButtonColor
  icon?: ReactNode
  label?: string
}) {
  return (
    <button
      type="button"
      className={cx(styles.chip, tone(color), selected && styles.chipOn)}
      aria-pressed={selected === undefined ? undefined : selected}
      aria-label={label}
      onClick={onClick}
    >
      {icon && <span className={styles.chipIcon}>{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

/** True while the element is on screen. Starts true so nothing flashes on load. */
export function useOnScreen(ref: RefObject<Element | null>): boolean {
  const [on, setOn] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return on
}

/** Replays a little "nope" shake. Bump the counter to shake again. */
export function shakeClass(count: number): string | undefined {
  if (!count) return undefined
  return count % 2 ? styles.shakeA : styles.shakeB
}
