/*
  The chunky, press-down "3D" button that gives Vector its feel.

  <Button>Continue</Button>                         green, full width
  <Button color="blue" size="md" block={false}>     other colors / sizes
  <Button variant="outline">Skip</Button>            white with a gray edge
  <Button variant="ghost">Maybe later</Button>       text only
*/
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { sfx } from '../lib/sound'
import { haptic } from '../lib/haptics'
import type { UnitColor } from '../content/types'
import styles from './Button.module.css'

export type ButtonColor = UnitColor | 'gray'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost'
  color?: ButtonColor
  size?: 'sm' | 'md' | 'lg'
  /** Full width. Default true for solid buttons. */
  block?: boolean
  icon?: ReactNode
  /** Play the tap sound + haptic. Default true. */
  feedback?: boolean
}

export function Button({
  variant = 'solid',
  color = 'green',
  size = 'lg',
  block,
  icon,
  feedback = true,
  className,
  children,
  onClick,
  style,
  ...rest
}: Props) {
  const full = block ?? variant === 'solid'
  return (
    <button
      type="button"
      className={[styles.btn, styles[variant], styles[size], full && styles.block, className].filter(Boolean).join(' ')}
      style={{ ...(variant !== 'outline' && { ['--b' as string]: `var(--c-${color})`, ['--bd' as string]: `var(--c-${color}-dark)` }), ...style }}
      onClick={(e) => {
        if (feedback) {
          sfx.tap()
          haptic.tap()
        }
        onClick?.(e)
      }}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  )
}

/** Small round icon-only button (close, back, info). */
export function IconButton({ label, children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className={[styles.iconBtn, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  )
}
