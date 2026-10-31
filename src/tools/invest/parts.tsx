/* Little shared pieces for the practice market. */
import type { CSSProperties, ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { ButtonColor } from '../../components/Button'
import { RISK_LABELS, type Asset } from './assets'
import { pct, tone } from './fmt'
import styles from './Invest.module.css'

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

/** CSS variables for one brand color, so styles can use var(--ac) etc. Tokens only, no hex. */
export const colorVars = (color: ButtonColor): CSSProperties =>
  ({ ['--ac' as string]: `var(--c-${color})`, ['--acd' as string]: `var(--c-${color}-dark)`, ['--acs' as string]: `var(--c-${color}-soft)` }) as CSSProperties

/** Just the emoji. No colored box around it. */
export function AssetIcon({ asset }: { asset: Pick<Asset, 'emoji'> }) {
  return (
    <span className={styles.assetIcon} aria-hidden>
      {asset.emoji}
    </span>
  )
}

/** Green-up / red-down change with an arrow. `value` is a fraction (0.05 = +5%). */
export function Change({ value, children, className }: { value: number; children?: ReactNode; className?: string }) {
  const t = tone(value)
  const Icon = t === 'up' ? ArrowUpRight : t === 'down' ? ArrowDownRight : Minus
  return (
    <span className={cx(styles.change, styles[t], className)}>
      <Icon size={15} strokeWidth={3} aria-hidden />
      {children ?? pct(value)}
    </span>
  )
}

/** "TMIX · Medium risk", as plain text. */
export const tagLine = (a: Asset, ...extra: string[]) => [...extra, a.ticker, RISK_LABELS[a.risk]].join(' · ')

export function CardHead({ title, right, id }: { title: ReactNode; right?: ReactNode; id?: string }) {
  return (
    <div className={styles.cardHead}>
      <h2 className={styles.cardTitle} id={id}>
        {title}
      </h2>
      {right}
    </div>
  )
}
