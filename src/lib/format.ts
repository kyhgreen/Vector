/* Number formatting helpers. Use these everywhere so money always looks the same. */

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const int = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** $1,234 (no cents). Pass `cents: true` for $1,234.56. */
export function money(n: number, opts: { cents?: boolean } = {}): string {
  if (!Number.isFinite(n)) return '$0'
  return opts.cents ? usd2.format(n) : usd0.format(Math.round(n))
}

/** $1.2K, $3.4M. For tight spaces like chart labels. */
export function moneyShort(n: number): string {
  const a = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (a >= 1_000_000) return `${sign}$${(a / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1)}M`
  if (a >= 1_000) return `${sign}$${(a / 1_000).toFixed(a >= 10_000 ? 0 : 1)}K`
  return `${sign}$${Math.round(a)}`
}

export function number(n: number): string {
  return int.format(n)
}

export function percent(n: number, digits = 0): string {
  return `${n.toFixed(digits)}%`
}

/** "1 month", "2 years 3 months", etc. */
export function duration(months: number): string {
  if (!Number.isFinite(months)) return 'forever (seriously)'
  const m = Math.ceil(months)
  const y = Math.floor(m / 12)
  const r = m % 12
  const parts: string[] = []
  if (y) parts.push(`${y} year${y === 1 ? '' : 's'}`)
  if (r || !y) parts.push(`${r} month${r === 1 ? '' : 's'}`)
  return parts.join(' ')
}

export function plural(n: number, word: string, pluralWord = `${word}s`): string {
  return `${number(n)} ${n === 1 ? word : pluralWord}`
}

/** Parses user-typed money like "1,200.50" or "$40". Returns 0 for junk. */
export function parseMoney(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : 0
}
