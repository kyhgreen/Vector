/* Every game number in one place, so balancing the game means editing one file. */
import type { AvatarId } from '../components/Avatar'

export const MAX_HEARTS = 5
/** One heart comes back every 30 minutes. */
export const HEART_REFILL_MS = 30 * 60 * 1000

export const XP = {
  lesson: 10,
  lessonPerfectBonus: 5,
  quizPass: 20,
  quizPerfectBonus: 10,
  quizFail: 5,
  practice: 8,
} as const

export const COINS = {
  lessonFirstTime: 6,
  lessonRepeat: 2,
  lessonPerfectBonus: 4,
  quizPass: 15,
  quizPerfectBonus: 10,
  practice: 3,
  dailyGoal: 10,
  badge: 20,
  startingBalance: 25,
} as const

export const DAILY_GOALS = [
  { xp: 10, label: 'Casual', blurb: '1 lesson a day. Good for busy weeks.' },
  { xp: 20, label: 'Regular', blurb: '2 lessons a day. A steady pace.' },
  { xp: 30, label: 'Serious', blurb: '3 lessons a day. Moves through units quickly.' },
  { xp: 50, label: 'Intense', blurb: '5 lessons a day. For days with extra time.' },
] as const

export interface ShopItem {
  id: 'streak-freeze' | 'heart-refill' | 'double-xp'
  name: string
  description: string
  price: number
  emoji: string
  /** Max you can own at once (for stackable items). */
  maxOwned?: number
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'streak-freeze',
    name: 'Streak Freeze',
    description: 'Keeps your streak going if you miss a day. You can hold up to 2.',
    price: 40,
    emoji: '🧊',
    maxOwned: 2,
  },
  {
    id: 'heart-refill',
    name: 'Heart Refill',
    description: 'Refills all your hearts right away.',
    price: 30,
    emoji: '❤️',
  },
  {
    id: 'double-xp',
    name: 'Double XP (15 min)',
    description: 'Earn twice the XP on everything for 15 minutes.',
    price: 50,
    emoji: '⚡',
  },
]

export const DOUBLE_XP_MS = 15 * 60 * 1000

export interface AvatarItem {
  /** Which drawing to show (see components/Avatar.tsx). Saved in profile.avatar. */
  id: AvatarId
  name: string
  price: number
}

/** Profile pictures: original money objects. The free ones are available from the start. */
export const AVATARS: AvatarItem[] = [
  { id: 'coin', name: 'Coin', price: 0 },
  { id: 'piggy', name: 'Piggy bank', price: 0 },
  { id: 'wallet', name: 'Wallet', price: 0 },
  { id: 'sprout', name: 'Money sprout', price: 30 },
  { id: 'receipt', name: 'Receipt', price: 30 },
  { id: 'calculator', name: 'Calculator', price: 40 },
  { id: 'card', name: 'Credit card', price: 50 },
  { id: 'chart', name: 'Rising chart', price: 75 },
  { id: 'bills', name: 'Stack of cash', price: 75 },
  { id: 'bank', name: 'Bank', price: 100 },
  { id: 'safe', name: 'Safe', price: 150 },
  { id: 'goldbar', name: 'Gold bars', price: 250 },
]

/** Everyone starts as the coin. */
export const DEFAULT_AVATAR: AvatarId = 'coin'

/**
  Coin Vault: stash coins and watch them earn interest. It teaches compound
  interest with something the player actually cares about. The rate is
  wildly generous on purpose (real banks pay a few percent per YEAR), and
  the app says so.
*/
export const VAULT = {
  dailyRatePct: 2,
  /** Only this much of the balance earns interest, so the economy doesn't explode. */
  interestCap: 1000,
} as const
