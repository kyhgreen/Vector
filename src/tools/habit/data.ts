/* Preset habits, saved state, and the "that's about X sneakers" price list. */

export interface Habit {
  id: string
  emoji: string
  /** Chip label. */
  name: string
  price: number
  /** "your ___ costs about" in the hero. */
  label: string
  /** "you still get your ___ twice a week" in sentences. */
  what: string
}

export const PRESETS: Habit[] = [
  { id: 'coffee', emoji: '☕', name: 'Coffee', price: 5, label: 'coffee habit', what: 'coffee' },
  { id: 'boba', emoji: '🧋', name: 'Boba', price: 6, label: 'boba habit', what: 'boba' },
  { id: 'fastfood', emoji: '🍟', name: 'Fast food', price: 10, label: 'fast food habit', what: 'fast food' },
  { id: 'skins', emoji: '🎮', name: 'In-game items', price: 10, label: 'in-game item habit', what: 'in-game items' },
  { id: 'soda', emoji: '🥤', name: 'Soda', price: 2, label: 'soda habit', what: 'soda' },
  { id: 'snacks', emoji: '🍿', name: 'Movie snacks', price: 8, label: 'movie snack habit', what: 'movie snacks' },
]

export const CUSTOM_ID = 'custom'
export const NAME_MAX = 24
export const PRICE_MAX = 1000
export const RATE_PCT = 7

export interface HabitState {
  presetId: string
  customName: string
  customPrice: number
  perWeek: number
  years: number
  /** How many a week to skip in the "trim it" card. */
  skip: number
}

export const TEEN_INITIAL: HabitState = { presetId: 'coffee', customName: '', customPrice: 4, perWeek: 5, years: 5, skip: 1 }
export const KID_INITIAL: HabitState = { presetId: 'boba', customName: '', customPrice: 3, perWeek: 2, years: 5, skip: 1 }

const num = (v: unknown, fallback: number, min: number, max: number) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

/** Saved data can be old or odd. This always returns a complete, sane state. */
export function sanitize(raw: unknown, base: HabitState): HabitState {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof HabitState, unknown>>
  const presetId = typeof r.presetId === 'string' && (r.presetId === CUSTOM_ID || PRESETS.some((p) => p.id === r.presetId)) ? r.presetId : base.presetId
  return {
    presetId,
    customName: typeof r.customName === 'string' ? r.customName.slice(0, NAME_MAX) : base.customName,
    customPrice: num(r.customPrice, base.customPrice, 0, PRICE_MAX),
    perWeek: Math.round(num(r.perWeek, base.perWeek, 1, 14)),
    years: Math.round(num(r.years, base.years, 1, 20)),
    skip: Math.round(num(r.skip, base.skip, 1, 14)),
  }
}

/** The habit the player picked, with custom ones filled in. */
export function currentHabit(s: HabitState): Habit {
  const preset = PRESETS.find((p) => p.id === s.presetId)
  if (preset) return preset
  const name = s.customName.trim().replace(/\s+/g, ' ')
  // "Sticker packs" reads better mid-sentence as "sticker packs" (but leave "NBA cards" alone).
  const soft = /^[A-Z][a-z]/.test(name) ? name[0].toLowerCase() + name.slice(1) : name
  return {
    id: CUSTOM_ID,
    emoji: '🛍️',
    name: name || 'Your habit',
    price: s.customPrice,
    label: !soft ? 'habit' : /habit$/i.test(soft) ? soft : `${soft} habit`,
    what: soft || 'treat',
  }
}

export interface Thing {
  emoji: string
  one: string
  many: string
  price: number
}

/** Stuff to compare a year of a habit against. Prices are rough on purpose. */
export const THINGS: Thing[] = [
  { emoji: '🍬', one: 'pack of gum', many: 'packs of gum', price: 2 },
  { emoji: '🎬', one: 'movie ticket', many: 'movie tickets', price: 13 },
  { emoji: '🍕', one: 'large pizza', many: 'large pizzas', price: 15 },
  { emoji: '🎮', one: 'new video game', many: 'new video games', price: 60 },
  { emoji: '🎤', one: 'concert ticket', many: 'concert tickets', price: 85 },
  { emoji: '👟', one: 'pair of sneakers', many: 'pairs of sneakers', price: 90 },
  { emoji: '🎧', one: 'pair of wireless headphones', many: 'pairs of wireless headphones', price: 150 },
  { emoji: '🚲', one: 'new bike', many: 'new bikes', price: 350 },
  { emoji: '🕹️', one: 'game console', many: 'game consoles', price: 450 },
  { emoji: '💻', one: 'laptop', many: 'laptops', price: 700 },
  { emoji: '🚗', one: 'used car', many: 'used cars', price: 8000 },
]
