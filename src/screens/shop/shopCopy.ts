/*
  Shop copy lives here so it is easy to edit in one place.
  Keep it plain and short: no slang, no em dashes.
*/
import type { ShopItem } from '../../state/constants'

/** Shop-card descriptions (shorter than the ones in constants). */
export const ITEM_DESC: Record<ShopItem['id'], string> = {
  'streak-freeze': 'Miss a day and keep your streak.',
  'heart-refill': 'Get all your hearts back now.',
  'double-xp': 'Earn twice the XP for 15 minutes.',
}

/** Shown in the confirm sheet. One is picked at random each time it opens. */
export const ITEM_LINES: Record<ShopItem['id'], string[]> = {
  'streak-freeze': [
    'This works like insurance. You pay a small amount now so one missed day does not cost you your streak.',
    'Insurance means paying a little ahead of time to protect against a bigger loss later.',
    'People pay for insurance and hope they never need it. A Streak Freeze works the same way.',
  ],
  'heart-refill': [
    "Paying extra so you don't have to wait is paying for convenience. Sometimes it's worth it.",
    'Hearts come back for free if you wait. This only saves you time.',
    'This is a want, not a need. Your hearts refill on their own.',
  ],
  'double-xp': [
    'If you only have time for one lesson, it may not be worth the coins.',
    'It is only worth the coins if you use all 15 minutes.',
    'Buy it right before you start a few lessons, not before a break.',
  ],
}

export const AVATAR_LINES = [
  'This is a want, not a need. A budget can include some wants.',
  'Check how many coins you will have left before you buy.',
  'Before you buy, ask yourself if you will still like it next week.',
  'Avatars only change how you look in the app.',
]

/** Each power-up's accent color. */
export const ITEM_COLOR: Record<ShopItem['id'], 'blue' | 'red' | 'orange'> = {
  'streak-freeze': 'blue',
  'heart-refill': 'red',
  'double-xp': 'orange',
}

export const REASON_TITLE = {
  coins: 'Not enough coins.',
  maxed: 'You already have the most you can hold.',
  full: 'Your hearts are already full.',
  owned: 'You already own that.',
} as const

/** Toast after a successful buy. `freezes` is how many you own after buying. */
export function boughtToast(id: ShopItem['id'], freezes: number, max: number): { title: string; body: string } {
  switch (id) {
    case 'streak-freeze':
      return { title: 'Streak Freeze added', body: `You now have ${freezes} of ${max}.` }
    case 'heart-refill':
      return { title: 'Hearts refilled', body: 'All your hearts are back.' }
    case 'double-xp':
      return { title: 'Double XP is on', body: 'It lasts 15 minutes, starting now.' }
  }
}

/** Shown under the vault balance when the vault is empty. */
export const VAULT_EMPTY_LINE = 'Deposit coins to start earning interest.'
