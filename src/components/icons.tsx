/* Tiny custom icons that lucide doesn't have. */

/** A gold coin with a "V". Vector's currency. */
export function CoinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12.8" r="10" fill="var(--c-yellow-dark)" />
      <circle cx="12" cy="11.2" r="10" fill="var(--c-yellow)" />
      <circle cx="12" cy="11.2" r="7" fill="none" stroke="var(--c-yellow-dark)" strokeWidth="1.5" opacity="0.5" />
      <path d="M8.6 8.4 L12 14.4 L15.4 8.4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** XP lightning bolt in a rounded badge. */
export function XpIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M13.5 2 4 13.5h7L9.5 22 20 9.5h-7L13.5 2Z" fill="var(--c-yellow)" stroke="var(--c-yellow-dark)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

/** The Vector logo mark. */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden>
      <rect width="512" height="512" rx="112" fill="var(--c-green)" />
      <path d="M128 156 L256 384 L384 156" fill="none" stroke="var(--c-green-dark)" strokeWidth="76" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 16)" />
      <path d="M128 156 L256 384 L384 156" fill="none" stroke="#fff" strokeWidth="76" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="384" cy="156" r="30" fill="var(--c-yellow)" />
    </svg>
  )
}
