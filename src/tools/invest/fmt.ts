/* Formatting helpers for the practice market. Nothing here ever returns NaN. */
import { money, moneyShort } from '../../lib/format'
import { DAYS_PER_YEAR } from './sim'

const ok = (n: number) => Number.isFinite(n)
const MINUS = '−'

/** Share prices: $123.45, $0.4213, $0.00123. */
export function price(p: number): string {
  if (!ok(p) || p <= 0) return '$0.00'
  if (p >= 1) return money(p, { cents: true })
  if (p >= 0.01) return `$${p.toFixed(4)}`
  return `$${p.toPrecision(3)}`
}

/** Short price for chart ticks. */
export function priceShort(p: number): string {
  if (!ok(p)) return '$0'
  if (p >= 1000) return moneyShort(p)
  if (p >= 10) return `$${Math.round(p)}`
  if (p >= 1) return `$${p.toFixed(1)}`
  if (p >= 0.01) return `$${p.toFixed(2)}`
  return `$${p.toPrecision(2)}`
}

const sharesFmt = [
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }),
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }),
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }),
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }),
]

/** 1,204.5 / 12.35 / 0.0412 shares. */
export function shares(n: number): string {
  if (!ok(n) || n <= 0) return '0'
  const f = n >= 1000 ? sharesFmt[0] : n >= 100 ? sharesFmt[1] : n >= 1 ? sharesFmt[2] : sharesFmt[3]
  const text = f.format(n)
  return text === '0' ? '0.0001' : text
}

export function sharesWord(n: number): string {
  return `${shares(n)} ${shares(n) === '1' ? 'share' : 'shares'}`
}

/** +4.1% / −3.2% / 0% */
export function pct(fraction: number, digits = 1): string {
  if (!ok(fraction)) return '0%'
  const v = fraction * 100
  const shown = Math.abs(v) < 0.05 ? 0 : v
  if (shown === 0) return '0%'
  const abs = Math.abs(shown)
  const text = abs >= 1000 ? Math.round(abs).toLocaleString('en-US') : abs.toFixed(abs >= 100 ? 0 : digits)
  return `${shown > 0 ? '+' : MINUS}${text}%`
}

/** Unsigned percent, for "down 12%" style sentences. */
export function pctPlain(fraction: number, digits = 0): string {
  if (!ok(fraction)) return '0%'
  return `${Math.abs(fraction * 100).toFixed(digits)}%`
}

/** +$412 / −$38. Anything that rounds to zero is plain $0 (never +$0 or −$0). */
export function moneySigned(n: number, cents = false): string {
  if (!ok(n) || Math.abs(n) < (cents ? 0.005 : 0.5)) return '$0'
  return `${n > 0 ? '+' : MINUS}${money(Math.abs(n), { cents })}`
}

/** 'up' | 'down' | 'flat' for coloring. */
export function tone(fraction: number): 'up' | 'down' | 'flat' {
  if (!ok(fraction) || Math.abs(fraction) < 0.0005) return 'flat'
  return fraction > 0 ? 'up' : 'down'
}

/** How long you've been playing: "12 days", "4 months", "2 years, 3 months". */
export function elapsed(days: number): string {
  const d = ok(days) ? Math.max(0, Math.floor(days)) : 0
  if (d < 60) return `${d} ${d === 1 ? 'day' : 'days'}`
  let y = Math.floor(d / DAYS_PER_YEAR)
  let m = Math.round((d - y * DAYS_PER_YEAR) / 30.4)
  if (m >= 12) {
    y += 1
    m = 0
  }
  const ys = y ? `${y} ${y === 1 ? 'year' : 'years'}` : ''
  const ms = m ? `${m} ${m === 1 ? 'month' : 'months'}` : ''
  return [ys, ms].filter(Boolean).join(', ') || '0 days'
}

/** "Day 95 · Year 1" */
export function dayTitle(day: number): string {
  const d = ok(day) ? Math.max(0, Math.floor(day)) : 0
  return `Day ${(d + 1).toLocaleString('en-US')} · Year ${Math.floor(d / DAYS_PER_YEAR) + 1}`
}

/** Short x-axis label for a day, scaled to how long the chart covers. */
export function axisLabel(d: number, span: number): string {
  if (d === 0) return 'Start'
  if (span < 120) return `Day ${d + 1}`
  if (span < 3 * DAYS_PER_YEAR) return `Mo ${Math.max(1, Math.round(d / 30.4))}`
  const y = d / DAYS_PER_YEAR
  return `Yr ${y >= 10 ? Math.round(y) : y.toFixed(1).replace(/\.0$/, '')}`
}

/** Short news timestamp. */
export function newsDay(day: number, today: number): string {
  if (day === today) return 'Today'
  if (day === today - 1) return 'Yesterday'
  return `Day ${(day + 1).toLocaleString('en-US')}`
}

/** What to call the last jump in the market list. */
export function jumpWord(days: number): string {
  if (days === 1) return 'today'
  if (days === 7) return 'this week'
  if (days === 30) return 'this month'
  if (days === 365) return 'this year'
  return `in ${elapsed(days)}`
}

/**
  The shared LineChart always starts its y-axis at 0, which makes a $10,000
  portfolio that wiggles by $300 look like a flat line. This picks a tight
  window [base, base + range] where the range is 1x or 2x a power of ten (so
  the chart's own "nice" rounding keeps it), and ticks land on round numbers.
  Plot `value - base` and format ticks with `n + base`.
*/
export function chartWindow(values: number[]): { base: number; range: number } {
  const vals = values.filter(ok)
  if (!vals.length) return { base: 0, range: 1 }
  const lo = Math.min(...vals)
  const hi = Math.max(...vals)
  // A dead-flat line (all cash) would get a zero-height window and five identical tick labels.
  // Plot it from $0 instead, so it reads as a flat line at its real value.
  if (hi - lo <= Math.abs(hi) * 1e-9) return { base: 0, range: hi > 0 ? hi : 1 }
  const span = Math.max(hi - lo, Math.abs(hi) * 0.04, 1e-6)
  let k = Math.floor(Math.log10(span)) - 1
  for (let guard = 0; guard < 40; guard++, k++) {
    for (const m of [1, 2]) {
      const range = m * Math.pow(10, k)
      const step = range / 4
      const base = Math.max(0, Math.floor(lo / step) * step)
      if (base + range >= hi && range >= span) return { base, range }
    }
  }
  return { base: 0, range: hi > 0 ? hi : 1 }
}

/** "share"/"shares", or "coin"/"coins" for the meme coin. */
export function unitName(ticker: string, n: number): string {
  const one = shares(n) === '1'
  if (ticker === 'DMOON') return one ? 'coin' : 'coins'
  return one ? 'share' : 'shares'
}

/** "12.35 shares", "1,204 coins". */
export function units(ticker: string, n: number): string {
  return `${shares(n)} ${unitName(ticker, n)}`
}

/**
  Axis ticks that stay readable in a tight window: "$9,850", "$10.25K",
  "$1.2M", "$0.4125". Uses the fewest decimals that still show the value.
*/
export function moneyTick(n: number): string {
  if (!ok(n)) return '$0'
  const a = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  const unit = a >= 1e6 ? 1e6 : a >= 1e4 ? 1e3 : 1
  const suffix = unit === 1e6 ? 'M' : unit === 1e3 ? 'K' : ''
  const x = a / unit
  const maxD = unit === 1 && a < 1 ? 4 : 2
  let d = 0
  while (d < maxD && Math.abs(Math.round(x * 10 ** d) / 10 ** d - x) * unit > Math.max(0.0001, a * 1e-5)) d++
  const text = (Math.round(x * 10 ** d) / 10 ** d).toLocaleString('en-US', { maximumFractionDigits: d })
  return `${sign}$${text}${suffix}`
}
