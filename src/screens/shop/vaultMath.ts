/*
  Pure math + formatting for the shop and the Coin Vault. No React here, so
  it's easy to test (see vaultMath.test.ts). The projection uses the exact
  same rule as the store's accrueVault(): each day, the part of the balance
  under the cap grows by VAULT.dailyRatePct percent.
*/
import { VAULT } from '../../state/constants'

const RATE = VAULT.dailyRatePct / 100

/** Safe number: anything weird (NaN, Infinity, undefined) becomes 0. */
export const safe = (n: number | undefined | null): number => (typeof n === 'number' && Number.isFinite(n) ? n : 0)

/** One day of vault interest on `balance`, respecting the cap. */
export function dailyInterest(balance: number): number {
  const b = Math.max(0, safe(balance))
  return Math.min(b, VAULT.interestCap) * RATE
}

/** Balance for day 0..days if you never touch it (compound interest). */
export function projectCompound(balance: number, days: number): number[] {
  let b = Math.max(0, safe(balance))
  const out = [b]
  for (let i = 0; i < days; i++) {
    b += dailyInterest(b)
    out.push(b)
  }
  return out
}

/** Same deposit, but interest is only ever paid on the starting amount (simple interest). */
export function projectSimple(balance: number, days: number): number[] {
  const b = Math.max(0, safe(balance))
  const perDay = dailyInterest(b)
  return Array.from({ length: days + 1 }, (_, d) => b + perDay * d)
}

/** Balance after `days` days, compounding. */
export function balanceAfter(balance: number, days: number): number {
  const p = projectCompound(balance, days)
  return p[p.length - 1]
}

/**
  How many coins `price` coins would turn into if they went into the vault
  instead (on top of what's already there) and sat for `days` days.
  Uses the difference of two projections, so the cap is handled exactly.
*/
export function opportunityValue(price: number, vaultBalance: number, days = 30): number {
  const base = Math.max(0, safe(vaultBalance))
  const extra = Math.max(0, safe(price))
  return extra + (balanceAfter(base + extra, days) - extra - balanceAfter(base, days))
}

/** Rule of 72: roughly how many periods to double at `ratePct` per period. */
export const ruleOf72 = (ratePct: number) => (ratePct > 0 ? Math.round(72 / ratePct) : 0)

const two = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** 1,234.56 (always two decimals, never NaN). */
export function coins2(n: number): string {
  return two.format(safe(n))
}

/** 1,234 (rounded down, so we never promise a coin you don't have). */
export function coins0(n: number): string {
  return whole.format(Math.floor(safe(n)))
}

/** "12:34" for under an hour, "1:02:03" above. */
export function clock(ms: number): string {
  const s = Math.max(0, Math.ceil(safe(ms) / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (x: number) => String(x).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

/** Milliseconds until the next local midnight (when the vault pays out). */
export function msToMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return Math.max(0, next.getTime() - now.getTime())
}

/** "5h 12m", "12m", or "under a minute". */
export function roughTime(ms: number): string {
  const totalMin = Math.floor(safe(ms) / 60_000)
  if (totalMin < 1) return 'under a minute'
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  return m ? `${h}h ${m}m` : `${h}h`
}
