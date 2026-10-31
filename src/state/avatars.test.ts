import { describe, expect, it, vi } from 'vitest'
import { AVATAR_IDS, avatarTint, initialsColor, initialsFor, isAvatarId } from '../components/Avatar'
import { AVATARS, DEFAULT_AVATAR } from './constants'
import { initialData, migrateAvatars, useGame } from './store'
import type { GameData } from './types'

// Node has no localStorage. Give zustand's persist one before the store loads.
const mem = vi.hoisted(() => {
  const m = new Map<string, string>()
  ;(globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  }
  return m
})

const FREE = ['coin', 'piggy', 'wallet']

describe('avatar catalog', () => {
  it('every shop avatar has a drawing, ids are unique, and three are free', () => {
    const ids = AVATARS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort()).toEqual([...AVATAR_IDS].sort())
    expect(AVATARS.filter((a) => a.price === 0).map((a) => a.id)).toEqual(FREE)
    expect(isAvatarId(DEFAULT_AVATAR)).toBe(true)
    expect(AVATARS.find((a) => a.id === DEFAULT_AVATAR)?.price).toBe(0)
  })

  it('new players start with a free avatar and own all the free ones', () => {
    const d = initialData()
    expect(d.profile.avatar).toBe(DEFAULT_AVATAR)
    expect(d.ownedAvatars).toEqual(FREE)
  })

  it('unknown ids still get a color instead of crashing', () => {
    expect(avatarTint('nope')).toBe(avatarTint(AVATAR_IDS[0]))
  })
})

describe('old emoji saves', () => {
  it('map to the new drawings and keep every purchase', () => {
    const r = migrateAvatars('🦊', ['😎', '🙂', '🤓', '🦊', '👑'])
    expect(r.avatar).toBe('sprout')
    expect(r.ownedAvatars).toEqual(['coin', 'piggy', 'wallet', 'sprout', 'goldbar'])
  })

  it('fall back to the default for unknown or unowned avatars', () => {
    expect(migrateAvatars('🐧', ['😎']).avatar).toBe(DEFAULT_AVATAR)
    expect(migrateAvatars('👑', ['😎']).avatar).toBe(DEFAULT_AVATAR)
    expect(migrateAvatars(undefined, undefined)).toEqual({ avatar: DEFAULT_AVATAR, ownedAvatars: FREE })
    expect(migrateAvatars(42, 'junk').ownedAvatars).toEqual(FREE)
    expect(migrateAvatars('🙂', ['🙂', '🐧', null]).ownedAvatars).toEqual(FREE)
  })

  it('leave new-style saves alone', () => {
    expect(migrateAvatars('bank', ['coin', 'piggy', 'wallet', 'bank'])).toEqual({
      avatar: 'bank',
      ownedAvatars: ['coin', 'piggy', 'wallet', 'bank'],
    })
  })

  it('are migrated when the save loads', async () => {
    const base = initialData()
    const old: GameData = { ...base, coins: 12, profile: { ...base.profile, name: 'Sam', avatar: '🐉' }, ownedAvatars: ['😎', '🙂', '🤓', '🐉'] }
    mem.set('vector-save', JSON.stringify({ state: old, version: 1 }))
    await useGame.persist.rehydrate()
    const s = useGame.getState()
    expect(s.profile.avatar).toBe('safe')
    expect(s.profile.name).toBe('Sam')
    expect(s.ownedAvatars).toEqual(['coin', 'piggy', 'wallet', 'safe'])
    expect(s.coins).toBe(12)
  })
})

describe('rival initials', () => {
  it('turns names into one or two letters', () => {
    expect(initialsFor('PennyPincher')).toBe('PP')
    expect(initialsFor('Sir Saves-a-Lot')).toBe('SL')
    expect(initialsFor('Ms. Moneybags')).toBe('MM')
    expect(initialsFor('APR Avery')).toBe('AA')
    expect(initialsFor('You')).toBe('Y')
    expect(initialsFor('')).toBe('?')
  })

  it('picks the same color for the same name', () => {
    expect(initialsColor('BudgetBoss')).toBe(initialsColor('BudgetBoss'))
  })
})
