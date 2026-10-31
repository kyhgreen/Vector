import { describe, expect, it } from 'vitest'
import { DIVISIONS, DEMOTE_COUNT, PROMOTE_COUNT, rivalsFor, standings } from '../../state/league'
import {
  ALL_COPY_POOLS,
  clampDivision,
  divisionFact,
  divisionGlyph,
  divisionQuip,
  divisionShape,
  ladderStatus,
  lessonsFor,
  msUntilReset,
  ordinal,
  resultCopy,
  rivalBio,
  rivalReport,
  rivalStatus,
  rivalStyle,
  rulesLine,
  timeLeft,
  xpText,
  youMessage,
} from './leagueCopy'

const EM_DASH = String.fromCharCode(0x2014)
const BAD = /NaN|undefined|null|Infinity/

/** Every visible string must be dash-free and never leak a broken number. */
function expectClean(s: string) {
  expect(s).not.toContain(EM_DASH)
  expect(s).not.toMatch(BAD)
  expect(s.trim().length).toBeGreaterThan(0)
}

// The raw source of every file in this folder, to catch dashes typed straight into JSX.
const SOURCES = import.meta.glob<string>('./*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })

/** A fake leaderboard: you at `youRank` out of `total`, XP falling by 10 per place. */
function board(total: number, youRank: number) {
  return Array.from({ length: total }, (_, i) => ({
    name: i + 1 === youRank ? 'You' : `Rival ${i + 1}`,
    xp: (total - i) * 10,
    isYou: i + 1 === youRank,
    rank: i + 1,
  }))
}

describe('league copy', () => {
  it('has no em dashes anywhere in this folder', () => {
    const files = Object.entries(SOURCES).filter(([path]) => !path.endsWith('.test.ts'))
    expect(files.length).toBeGreaterThan(3)
    for (const [path, src] of files) expect(src.includes(EM_DASH), `${path} contains an em dash`).toBe(false)
    for (const pool of ALL_COPY_POOLS) for (const line of pool) expectClean(line)
  })

  it('describes every division without gaps', () => {
    expect(DIVISIONS.length).toBeGreaterThan(1)
    DIVISIONS.forEach((_, d) => {
      expectClean(divisionQuip(d))
      expectClean(divisionFact(d))
      expectClean(divisionGlyph(d))
      expectClean(rulesLine(d))
      for (let cur = 0; cur < DIVISIONS.length; cur++) expectClean(ladderStatus(d, cur))
    })
    expect(divisionShape(0)).toBe('coin')
    expect(divisionShape(DIVISIONS.length - 1)).toBe('bill')
    expect(rulesLine(0)).toContain('No one moves down')
    expect(rulesLine(DIVISIONS.length - 1)).not.toContain('move up')
  })

  it('clamps junk division numbers', () => {
    expect(clampDivision(-3)).toBe(0)
    expect(clampDivision(99)).toBe(DIVISIONS.length - 1)
    expect(clampDivision(Number.NaN)).toBe(0)
    expect(clampDivision(undefined)).toBe(0)
  })

  it('formats ordinals, XP, and lesson counts', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '101st'])
    expect(ordinal(Number.NaN)).toBe('0th')
    expect(xpText(1234.4)).toBe('1,234 XP')
    expect(xpText(Number.NaN)).toBe('0 XP')
    expect(xpText(-5)).toBe('0 XP')
    expect(lessonsFor(5)).toBe('about one lesson')
    expect(lessonsFor(25)).toBe('about 3 lessons')
    expect(lessonsFor(Number.NaN)).toBe('about one lesson')
  })

  it('counts down to Monday', () => {
    expect(timeLeft(3 * 86_400_000 + 4 * 3_600_000 + 59_000).short).toBe('3d 4h')
    expect(timeLeft(5 * 3_600_000 + 12 * 60_000).short).toBe('5h 12m')
    expect(timeLeft(12 * 60_000).short).toBe('12m')
    expect(timeLeft(10_000).short).toBe('under 1m')
    expect(timeLeft(Number.NaN).short).toBe('under 1m')
    expectClean(timeLeft(86_400_000).long)

    // Wednesday 2026-10-14 at noon: 4.5 days to Monday 2026-10-19 00:00.
    const wed = new Date(2026, 9, 14, 12, 0, 0)
    expect(msUntilReset(wed)).toBe(4.5 * 86_400_000)
    // Sunday 23:59 is one minute out.
    expect(msUntilReset(new Date(2026, 9, 18, 23, 59, 0))).toBe(60_000)
    // Monday 00:00 is a full week out.
    expect(msUntilReset(new Date(2026, 9, 19, 0, 0, 0))).toBe(7 * 86_400_000)
  })

  it('tells you where you stand from every spot on the board', () => {
    const total = 15
    for (let d = 0; d < DIVISIONS.length; d++) {
      for (let rank = 1; rank <= total; rank++) {
        const m = youMessage(board(total, rank), d)
        expect(m).not.toBeNull()
        expectClean(m!.title)
        expectClean(m!.body)
        if (m!.goal) {
          expect(Number.isFinite(m!.goal.current)).toBe(true)
          expect(Number.isFinite(m!.goal.target)).toBe(true)
          expectClean(m!.goal.label)
        }
      }
    }
  })

  it('puts you in the right zone', () => {
    const mid = 2
    expect(youMessage(board(15, 1), mid)!.tone).toBe('promote')
    expect(youMessage(board(15, PROMOTE_COUNT), mid)!.tone).toBe('promote')
    expect(youMessage(board(15, PROMOTE_COUNT + 1), mid)!.tone).toBe('safe')
    expect(youMessage(board(15, 15), mid)!.tone).toBe('demote')
    expect(youMessage(board(15, 15 - DEMOTE_COUNT + 1), mid)!.tone).toBe('demote')
    // Nobody falls out of Penny.
    expect(youMessage(board(15, 15), 0)!.tone).toBe('safe')
    // The danger-zone goal points at the last safe spot.
    const danger = youMessage(board(15, 14), mid)!
    expect(danger.goal).toEqual({ current: 20, target: 40, label: 'Progress out of the demotion zone' })
    expect(youMessage([], mid)).toBeNull()
  })

  it('writes last week results for every outcome', () => {
    for (let to = 0; to < DIVISIONS.length; to++) {
      for (const rank of [1, 3, 8, 15]) {
        for (const outcome of ['promoted', 'stayed', 'demoted'] as const) {
          const from = outcome === 'promoted' ? Math.max(0, to - 1) : outcome === 'demoted' ? Math.min(DIVISIONS.length - 1, to + 1) : to
          const c = resultCopy({ outcome, rank, from, to, weekKey: '2026-10-12' })
          expectClean(c.title)
          expectClean(c.body)
          expectClean(c.button)
        }
      }
    }
    expect(resultCopy({ outcome: 'promoted', rank: 2, from: 1, to: 2, weekKey: 'w' }).title).toBe('Promoted to Dime League!')
    expect(resultCopy({ outcome: 'stayed', rank: 7, from: 2, to: 2, weekKey: 'w' }).title).toBe('Still in Dime League')
    // Nothing is above the top league, so don't tell people to aim for the top 3 there.
    const top = DIVISIONS.length - 1
    expect(resultCopy({ outcome: 'stayed', rank: 8, from: top, to: top, weekKey: 'w' }).body).not.toContain('top')
  })

  it('gives every rival clean gossip', () => {
    const week = '2026-10-12'
    for (let d = 0; d < DIVISIONS.length; d++) {
      for (const r of rivalsFor(week, d)) {
        expectClean(rivalBio(r.name))
        expectClean(rivalStyle(r.curve).label)
        for (const gain of [0, 5, 40]) for (let day = 0; day < 7; day++) expectClean(rivalStatus(r.id, week, day, gain))
      }
    }
    expectClean(rivalReport({ everyoneZero: true, hotGain: 0, seed: 'a' }))
    expectClean(rivalReport({ everyoneZero: false, hotName: 'BudgetBoss', hotGain: 30, seed: 'b' }))
    expectClean(rivalReport({ everyoneZero: false, hotGain: 0, seed: 'c' }))
  })

  it('builds standings the screen can render', () => {
    const rows = standings({ weekKey: '2026-10-12', division: 3, progress: 0.5, youXp: 40, youName: 'You', youAvatar: 'coin' })
    expect(rows.filter((r) => r.isYou)).toHaveLength(1)
    rows.forEach((r, i) => {
      expect(r.rank).toBe(i + 1)
      expect(Number.isFinite(r.xp)).toBe(true)
    })
  })
})
