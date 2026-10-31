/*
  Short onboarding lists, kept in one spot so they're easy to edit.
  House rule: no em dashes.
*/

/** Money facts the splash screen's dollar bill shows when you tap it. Keep each one short and the math exact. */
export const BILL_LINES = [
  'A dollar is 100 cents.',
  'Saving $1 a day adds up to $365 in a year.',
  'Saving $5 a week adds up to $260 in a year.',
  'A $3 drink five days a week costs $780 a year.',
  '$100 earning 5% a year makes $5 in the first year.',
] as const

/** Random nickname ideas for the dice button. All 20 characters or less. */
export const NICKNAME_IDEAS = [
  'Penny Saver',
  'Coin Collector',
  'Blue Falcon',
  'Quiet Otter',
  'North Star',
  'River Fox',
  'Swift Heron',
  'Silver Maple',
  'Bright Comet',
  'Calm Tiger',
  'Red Kite',
  'Night Owl',
  'Golden Lynx',
  'Cedar Wolf',
  'Iron Sparrow',
  'Sea Turtle',
  'Desert Hawk',
  'Snow Leopard',
  'Green Harbor',
  'Steady Planner',
] as const

export const NAME_MAX = 20

/** Rough minutes per day for each daily goal (keyed by XP). */
const GOAL_MINUTES: Record<number, number> = { 10: 5, 20: 10, 30: 15, 50: 25 }

export function goalMinutes(xp: number) {
  return GOAL_MINUTES[xp] ?? Math.max(5, Math.round(xp / 2))
}
