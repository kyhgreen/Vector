/*
  Vector's avatars: a small set of original money objects, drawn as flat SVG
  in the app palette with the same chunky darker edge as the logo and coins.
  Every color is a CSS variable, so dark mode just works.

    <Avatar id="piggy" size={48} />          // the player's pick
    <Initials name="BudgetBoss" size={40} />  // league rivals (made-up people)

  Profile saves store the id string (see AVATARS in state/constants.ts).
  Unknown ids draw the first avatar instead of crashing.
*/
import type { CSSProperties, ReactNode } from 'react'
import type { ButtonColor } from './Button'
import { hashString } from '../lib/random'
import styles from './Avatar.module.css'

export const AVATAR_IDS = [
  'coin',
  'piggy',
  'wallet',
  'sprout',
  'receipt',
  'calculator',
  'card',
  'chart',
  'bills',
  'bank',
  'safe',
  'goldbar',
] as const

export type AvatarId = (typeof AVATAR_IDS)[number]

export function isAvatarId(x: unknown): x is AvatarId {
  return typeof x === 'string' && (AVATAR_IDS as readonly string[]).includes(x)
}

/* Short names for the palette, to keep the drawings readable. */
const c = (name: string) => `var(--c-${name})`
const WHITE = 'var(--text-on-color)'

interface Art {
  /** The pale disc behind the object, and the avatar's color elsewhere (profile ring). */
  tint: ButtonColor
  draw: ReactNode
}

const ART: Record<AvatarId, Art> = {
  coin: {
    tint: 'teal',
    draw: (
      <>
        <circle cx="32" cy="35" r="17" fill={c('yellow-dark')} />
        <circle cx="32" cy="31" r="17" fill={c('yellow')} />
        <circle cx="32" cy="31" r="11.5" fill="none" stroke={c('yellow-dark')} strokeWidth="2.5" opacity="0.55" />
        <path d="M26.5 25.5 L32 35.5 L37.5 25.5" fill="none" stroke={WHITE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.5 25 A13.5 13.5 0 0 1 25 18.5" fill="none" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      </>
    ),
  },

  piggy: {
    tint: 'pink',
    draw: (
      <>
        <circle cx="29" cy="13.5" r="5" fill={c('yellow')} stroke={c('yellow-dark')} strokeWidth="2" />
        <rect x="19" y="40" width="6.5" height="10" rx="2.5" fill={c('pink-dark')} />
        <rect x="35" y="40" width="6.5" height="10" rx="2.5" fill={c('pink-dark')} />
        <path d="M14.5 33 C10.5 32 10 28 13.5 27.5" fill="none" stroke={c('pink-dark')} strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="31" cy="36" rx="17" ry="13" fill={c('pink-dark')} />
        <ellipse cx="31" cy="33" rx="17" ry="13" fill={c('pink')} />
        <path d="M37 22.5 L40.5 15.5 L45.5 23 Z" fill={c('pink-dark')} stroke={c('pink-dark')} strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="48" cy="34" rx="4.5" ry="5.5" fill={c('pink-dark')} />
        <circle cx="41" cy="28.5" r="2" fill={c('pink-dark')} />
        <rect x="24" y="21.5" width="10" height="3" rx="1.5" fill={c('pink-dark')} />
        <path d="M19.5 30 Q21.5 26 25.5 25" fill="none" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </>
    ),
  },

  wallet: {
    tint: 'orange',
    draw: (
      <>
        <rect x="17" y="13" width="27" height="15" rx="2.5" fill={c('green')} stroke={c('green-dark')} strokeWidth="2" transform="rotate(-8 30 20)" />
        <rect x="12" y="24" width="40" height="27" rx="6" fill={c('orange-dark')} />
        <rect x="12" y="21" width="40" height="27" rx="6" fill={c('orange')} />
        <rect x="36" y="28" width="18" height="13" rx="4.5" fill={c('orange-dark')} />
        <circle cx="43" cy="34.5" r="3" fill={c('yellow')} />
        <path d="M17.5 26.5 H28" fill="none" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </>
    ),
  },

  sprout: {
    tint: 'green',
    draw: (
      <>
        <path d="M32 37 V23" fill="none" stroke={c('green-dark')} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M32 29 C24 29 18 25 16.5 17 C24.5 17 31 21 32 29 Z" fill={c('green')} stroke={c('green-dark')} strokeWidth="2" strokeLinejoin="round" />
        <path d="M32 24.5 C39 24.5 45.5 20 47 11.5 C39 11.5 33 16.5 32 24.5 Z" fill={c('green')} stroke={c('green-dark')} strokeWidth="2" strokeLinejoin="round" />
        <path d="M21 43 H43 L40 54 H24 Z" fill={c('orange-dark')} stroke={c('orange-dark')} strokeWidth="2" strokeLinejoin="round" />
        <path d="M21 40 H43 L40 51 H24 Z" fill={c('orange')} stroke={c('orange')} strokeWidth="2" strokeLinejoin="round" />
        <rect x="18" y="37.5" width="28" height="6" rx="3" fill={c('orange-dark')} />
        <rect x="18" y="35" width="28" height="6" rx="3" fill={c('orange')} />
        <path d="M22 38 H28" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </>
    ),
  },

  receipt: {
    tint: 'red',
    draw: (
      <g transform="rotate(-6 32 32)">
        <path
          d="M19 13 Q19 11 21 11 H43 Q45 11 45 13 V51 L41.75 48 L38.5 51 L35.25 48 L32 51 L28.75 48 L25.5 51 L22.25 48 L19 51 Z"
          fill={WHITE}
          stroke={c('gray-dark')}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M24 19 H40 M24 26 H35 M24 33 H38" fill="none" stroke={c('gray')} strokeWidth="3" strokeLinecap="round" />
        <path d="M24 41.5 H40" fill="none" stroke={c('green')} strokeWidth="3.5" strokeLinecap="round" />
      </g>
    ),
  },

  calculator: {
    tint: 'yellow',
    draw: (
      <>
        <rect x="17" y="14" width="30" height="39" rx="6" fill={c('purple-dark')} />
        <rect x="17" y="11" width="30" height="39" rx="6" fill={c('purple')} />
        <rect x="21" y="15" width="22" height="9" rx="2.5" fill={WHITE} />
        <rect x="31" y="18" width="9" height="3" rx="1.5" fill={c('purple-dark')} />
        <g fill={WHITE} opacity="0.9">
          <rect x="21" y="28" width="5.5" height="5" rx="1.5" />
          <rect x="29.25" y="28" width="5.5" height="5" rx="1.5" />
          <rect x="37.5" y="28" width="5.5" height="5" rx="1.5" />
          <rect x="21" y="35" width="5.5" height="5" rx="1.5" />
          <rect x="29.25" y="35" width="5.5" height="5" rx="1.5" />
          <rect x="37.5" y="35" width="5.5" height="5" rx="1.5" />
          <rect x="21" y="42" width="5.5" height="5" rx="1.5" />
          <rect x="29.25" y="42" width="5.5" height="5" rx="1.5" />
        </g>
        <rect x="37.5" y="42" width="5.5" height="5" rx="1.5" fill={c('orange')} />
      </>
    ),
  },

  card: {
    tint: 'blue',
    draw: (
      <g transform="rotate(-10 32 32)">
        <rect x="10" y="21" width="44" height="28" rx="5" fill={c('blue-dark')} />
        <rect x="10" y="18" width="44" height="28" rx="5" fill={c('blue')} />
        <rect x="16" y="25" width="9" height="7" rx="1.5" fill={c('yellow')} stroke={c('yellow-dark')} strokeWidth="1.5" />
        <path d="M16 38.5 H30 M34 38.5 H40" fill="none" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
        <path d="M42 24 Q45 27.5 42 31 M46 22 Q50.5 27.5 46 33" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </g>
    ),
  },

  chart: {
    tint: 'purple',
    draw: (
      <>
        <rect x="14" y="41" width="9" height="12" rx="2" fill={c('green-dark')} />
        <rect x="14" y="38" width="9" height="12" rx="2" fill={c('green')} />
        <rect x="27.5" y="35" width="9" height="18" rx="2" fill={c('green-dark')} />
        <rect x="27.5" y="32" width="9" height="18" rx="2" fill={c('green')} />
        <rect x="41" y="28" width="9" height="25" rx="2" fill={c('green-dark')} />
        <rect x="41" y="25" width="9" height="25" rx="2" fill={c('green')} />
        <path d="M13 32.5 L24 24 L31 28 L46 14.5 M39 13.5 H47 V21.5" fill="none" stroke={c('orange-dark')} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 2.5)" />
        <path d="M13 32.5 L24 24 L31 28 L46 14.5 M39 13.5 H47 V21.5" fill="none" stroke={c('orange')} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },

  bills: {
    tint: 'pink',
    draw: (
      <>
        <rect x="14" y="15" width="38" height="22" rx="3" fill={c('green-dark')} transform="rotate(-12 33 26)" />
        <rect x="13" y="20" width="38" height="22" rx="3" fill={c('green')} stroke={c('green-dark')} strokeWidth="2" transform="rotate(-5 32 31)" />
        <rect x="12" y="30" width="40" height="22" rx="3" fill={c('green-dark')} />
        <rect x="12" y="27" width="40" height="22" rx="3" fill={c('green')} />
        <rect x="16" y="31" width="32" height="14" rx="2" fill="none" stroke={WHITE} strokeWidth="2" opacity="0.55" />
        <circle cx="41" cy="38" r="4.5" fill={WHITE} opacity="0.9" />
        <rect x="23" y="27" width="8" height="22" fill={c('yellow')} />
        <rect x="23" y="49" width="8" height="3" fill={c('yellow-dark')} />
      </>
    ),
  },

  bank: {
    tint: 'orange',
    draw: (
      <>
        <rect x="15" y="22" width="34" height="23" fill={c('blue-dark')} />
        <g fill={WHITE}>
          <rect x="18.5" y="25" width="4.5" height="19" rx="1" />
          <rect x="26.5" y="25" width="4.5" height="19" rx="1" />
          <rect x="33" y="25" width="4.5" height="19" rx="1" />
          <rect x="41" y="25" width="4.5" height="19" rx="1" />
        </g>
        <path d="M32 13 L52 24 H12 Z" fill={c('blue-dark')} stroke={c('blue-dark')} strokeWidth="3" strokeLinejoin="round" />
        <path d="M32 10 L52 21 H12 Z" fill={c('blue')} stroke={c('blue')} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="32" cy="17" r="2.75" fill={c('yellow')} />
        <rect x="11" y="47" width="42" height="6" rx="2" fill={c('blue-dark')} />
        <rect x="11" y="44" width="42" height="6" rx="2" fill={c('blue')} />
      </>
    ),
  },

  safe: {
    tint: 'blue',
    draw: (
      <>
        <rect x="16" y="46" width="7" height="7" rx="2" fill={c('red-dark')} />
        <rect x="41" y="46" width="7" height="7" rx="2" fill={c('red-dark')} />
        <rect x="13" y="15" width="38" height="35" rx="6" fill={c('red-dark')} />
        <rect x="13" y="12" width="38" height="35" rx="6" fill={c('red')} />
        <rect x="17.5" y="16.5" width="29" height="26" rx="4" fill="none" stroke={c('red-dark')} strokeWidth="2.5" />
        <circle cx="32" cy="29.5" r="8" fill={c('yellow')} stroke={c('yellow-dark')} strokeWidth="2.5" />
        <path d="M32 29.5 V23.5" fill="none" stroke={c('yellow-dark')} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="29.5" r="2.25" fill={c('yellow-dark')} />
        <path d="M17.5 21 Q18.5 17.5 22 16.5" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </>
    ),
  },

  goldbar: {
    tint: 'purple',
    draw: (
      <>
        <path d="M13 39 H27.5 L30.5 50 H10 Z" fill={c('yellow-dark')} stroke={c('yellow-dark')} strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 36 H27.5 L30.5 47 H10 Z" fill={c('yellow')} stroke={c('yellow')} strokeWidth="2" strokeLinejoin="round" />
        <path d="M36.5 39 H51 L54 50 H33.5 Z" fill={c('yellow-dark')} stroke={c('yellow-dark')} strokeWidth="2" strokeLinejoin="round" />
        <path d="M36.5 36 H51 L54 47 H33.5 Z" fill={c('yellow')} stroke={c('yellow')} strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 27 H40 L43 38 H21 Z" fill={c('yellow-dark')} stroke={c('yellow-dark')} strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 24 H40 L43 35 H21 Z" fill={c('yellow')} stroke={c('yellow')} strokeWidth="2" strokeLinejoin="round" />
        <path d="M15 39.5 H20 M38.5 39.5 H43.5 M26 27.5 H31" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" opacity="0.75" />
        <path d="M48 11 L49.8 15.2 L54 17 L49.8 18.8 L48 23 L46.2 18.8 L42 17 L46.2 15.2 Z" fill={c('yellow')} stroke={c('yellow-dark')} strokeWidth="1.25" strokeLinejoin="round" />
      </>
    ),
  },
}

function artFor(id: string | undefined | null): Art {
  return ART[isAvatarId(id) ? id : AVATAR_IDS[0]]
}

/** The avatar's color, for tinting things around it (profile ring, etc.). */
export function avatarTint(id: string | undefined | null): ButtonColor {
  return artFor(id).tint
}

interface AvatarProps {
  id: string | undefined | null
  /** Width and height: px, or a CSS length like "100%" to fill a sized box. */
  size?: number | string
  /** Draw the pale tinted disc behind the object (on by default). */
  disc?: boolean
  /** Give it an accessible name. Without one it's decorative (aria-hidden). */
  label?: string
  className?: string
}

export function Avatar({ id, size = 48, disc = true, label, className }: AvatarProps) {
  const art = artFor(id)
  return (
    <svg
      className={[styles.avatar, className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {disc && <circle cx="32" cy="32" r="32" fill={c(`${art.tint}-soft`)} />}
      {art.draw}
    </svg>
  )
}

/* ---------- Initials, for made-up league rivals ---------- */

const INITIAL_COLORS: ButtonColor[] = ['purple', 'blue', 'green', 'orange', 'pink', 'teal', 'red']

/** "PennyPincher" -> "PP", "Sir Saves-a-Lot" -> "SL", "Allowance Al" -> "AA", "You" -> "Y". */
export function initialsFor(name: string | undefined | null): string {
  const words = (name ?? '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
  if (words.length === 0) return '?'
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function initialsColor(name: string | undefined | null): ButtonColor {
  return INITIAL_COLORS[hashString(name || '?') % INITIAL_COLORS.length]
}

interface InitialsProps {
  name: string
  /** px (font scales with it), or a CSS length like "100%" (set font-size in CSS). */
  size?: number | string
  className?: string
}

export function Initials({ name, size = 40, className }: InitialsProps) {
  const color = initialsColor(name)
  const style = {
    width: size,
    height: size,
    fontSize: typeof size === 'number' ? Math.round(size * 0.38) : undefined,
    ['--i' as string]: `var(--c-${color})`,
    ['--i-dark' as string]: `var(--c-${color}-dark)`,
    ['--i-soft' as string]: `var(--c-${color}-soft)`,
  } as CSSProperties
  return (
    <span className={[styles.initials, className].filter(Boolean).join(' ')} style={style} aria-hidden>
      {initialsFor(name)}
    </span>
  )
}
