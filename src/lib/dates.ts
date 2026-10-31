/*
  Day math for streaks, daily goals, and weekly leagues. Everything uses the
  device's LOCAL date as a "day key" string like "2026-10-18", so a streak
  ticks over at the user's midnight, not some server's.
*/

export type DayKey = string

const pad = (n: number) => String(n).padStart(2, '0')

export function dayKey(d: Date = new Date()): DayKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseDay(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: DayKey, days: number): DayKey {
  const d = parseDay(key)
  d.setDate(d.getDate() + days)
  return dayKey(d)
}

/** Whole days from a to b (b - a). Same day = 0, yesterday→today = 1. */
export function daysBetween(a: DayKey, b: DayKey): number {
  return Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86_400_000)
}

/** The Monday that starts the week containing `key`. Used as the league week id. */
export function weekStart(key: DayKey): DayKey {
  const d = parseDay(key)
  const dow = (d.getDay() + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - dow)
  return dayKey(d)
}

/** 0 at Monday 00:00, 1 at the next Monday 00:00. */
export function weekProgress(now: Date = new Date()): number {
  const start = parseDay(weekStart(dayKey(now))).getTime()
  return Math.min(1, Math.max(0, (now.getTime() - start) / (7 * 86_400_000)))
}

/** Last `n` day keys ending today, oldest first. */
export function lastNDays(n: number, today: DayKey = dayKey()): DayKey[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)))
}

export function shortWeekday(key: DayKey): string {
  return parseDay(key).toLocaleDateString(undefined, { weekday: 'narrow' })
}
