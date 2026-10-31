import { describe, expect, it } from 'vitest'
import {
  categoryProgress,
  cleanAmount,
  CATEGORY_IDEAS,
  fillRatio,
  fmt,
  freshData,
  GROUPS,
  INCOME_PRESETS,
  isOver,
  leftState,
  MAX_AMOUNT,
  MAX_EXPENSES,
  NEEDS_NOTE,
  normalize,
  pctText,
  QUICK_FILLS,
  signature,
  SPLIT_EXAMPLES,
  starterBudget,
  starterForReset,
  totals,
  type Expense,
} from './model'

const expense = (over: Partial<Expense>): Expense => ({
  id: 'e1',
  amount: 5,
  categoryId: 'c1',
  categoryName: 'Snacks',
  group: 'wants',
  note: '',
  day: '2026-10-10',
  at: 1,
  ...over,
})

describe('cleanAmount', () => {
  it('turns junk into 0 and keeps good numbers to the cent', () => {
    expect(cleanAmount(NaN)).toBe(0)
    expect(cleanAmount(Infinity)).toBe(0)
    expect(cleanAmount(-4)).toBe(0)
    expect(cleanAmount('abc')).toBe(0)
    expect(cleanAmount(undefined)).toBe(0)
    expect(cleanAmount(4.567)).toBe(4.57)
    expect(cleanAmount('12.5')).toBe(12.5)
    expect(cleanAmount(9e12)).toBe(MAX_AMOUNT)
  })
})

describe('normalize', () => {
  it('gives fresh, age-aware data when nothing is saved', () => {
    const young = normalize(null, 1)
    const older = normalize(undefined, 2)
    expect(young.split.income).toBeLessThan(older.split.income)
    expect(young.categories.length).toBeGreaterThan(0)
    expect(young.tab).toBe('split')
    expect(young.expenses).toEqual([])
  })

  it('repairs broken saves without crashing', () => {
    const d = normalize(
      {
        tab: 'nope',
        split: { income: 'lots', period: 'year', result: { income: NaN, period: 'month' } },
        income: [{ id: 'a', name: 'Job', amount: '40' }, { name: 'no id' }, null],
        categories: [{ id: 'c', name: 'Snacks', amount: -3, group: 'wants' }, { id: 'd', group: 'bogus' }],
        expenses: [expense({ amount: NaN }), expense({ id: 'ok' }), { id: 'bad-day', day: 'yesterday', group: 'wants', amount: 3 }],
        savedAt: NaN,
      },
      1,
    )
    expect(d.tab).toBe('split')
    expect(d.split.period).toBe('month')
    expect(d.split.result).toBeNull()
    expect(d.income).toEqual([{ id: 'a', name: 'Job', amount: 40 }])
    expect(d.categories).toEqual([{ id: 'c', name: 'Snacks', amount: 0, group: 'wants' }])
    expect(d.expenses.map((e) => e.id)).toEqual(['ok'])
    expect(d.savedAt).toBeNull()
  })

  it('keeps lists the player emptied on purpose', () => {
    const d = normalize({ income: [], categories: [] }, 2)
    expect(d.income).toEqual([])
    expect(d.categories).toEqual([])
  })

  it('caps the number of saved expenses', () => {
    const many = Array.from({ length: MAX_EXPENSES + 20 }, (_, i) => expense({ id: `e${i}` }))
    expect(normalize({ expenses: many }, 1).expenses).toHaveLength(MAX_EXPENSES)
  })
})

describe('totals and leftState', () => {
  it('starter budgets leave a little money for the player to assign', () => {
    for (const tier of [1, 2] as const) {
      const t = totals(starterBudget(tier))
      expect(leftState(t)).toBe('under')
      expect(t.left).toBeGreaterThan(0)
    }
  })

  it('reads zero, under, over, and empty', () => {
    const income = [{ id: 'i', name: 'Allowance', amount: 40 }]
    const cat = (amount: number) => [{ id: 'c', name: 'Jar', amount, group: 'savings' as const }]
    expect(leftState(totals({ income, categories: cat(40) }))).toBe('zero')
    expect(leftState(totals({ income, categories: cat(28) }))).toBe('under')
    expect(leftState(totals({ income, categories: cat(48) }))).toBe('over')
    expect(totals({ income, categories: cat(48) }).left).toBe(-8)
    expect(leftState(totals({ income: [], categories: [] }))).toBe('empty')
  })

  it('does not get fooled by floating point', () => {
    const income = [{ id: 'i', name: 'Job', amount: 0.3 }]
    const categories = [
      { id: 'a', name: 'A', amount: 0.1, group: 'needs' as const },
      { id: 'b', name: 'B', amount: 0.2, group: 'wants' as const },
    ]
    expect(leftState(totals({ income, categories }))).toBe('zero')
  })
})

describe('signature', () => {
  it('changes when the plan changes', () => {
    const a = freshData(1)
    const b = { ...a, categories: a.categories.map((c, i) => (i === 0 ? { ...c, amount: c.amount + 1 } : c)) }
    expect(signature(a)).toBe(signature(freshData(1)))
    expect(signature(a)).not.toBe(signature(b))
  })
})

describe('starterForReset', () => {
  it('keeps example ids only when the spending under them still belongs to the example line', () => {
    const ex = starterBudget(1)
    const [lunch, , snacks, games] = ex.categories
    const d = {
      // Games was renamed to Robux; Snacks was deleted after logging under its own name.
      categories: [lunch, { ...games, name: 'Robux' }],
      expenses: [
        expense({ id: 'a', categoryId: snacks.id, categoryName: 'Snacks' }),
        expense({ id: 'b', categoryId: games.id, categoryName: 'Robux' }),
      ],
    }
    const out = starterForReset(d, 1)
    expect(out.categories.map((c) => c.name)).toEqual(ex.categories.map((c) => c.name))
    const idOf = (name: string) => out.categories.find((c) => c.name === name)!.id
    expect(idOf('School lunch')).toBe(lunch.id)
    expect(idOf('Snacks')).toBe(snacks.id)
    expect(idOf('Games')).not.toBe(games.id)
    // So Robux spending stays Robux instead of turning into Games.
    const rows = categoryProgress(out.categories, d.expenses)
    expect(rows.find((r) => r.name === 'Games')!.spent).toBe(0)
    expect(rows.find((r) => r.name === 'Robux')).toMatchObject({ orphan: true, spent: 5 })
  })
})

describe('categoryProgress', () => {
  it('adds up spending per category and keeps deleted ones visible', () => {
    const categories = [{ id: 'c1', name: 'Snacks', amount: 10, group: 'wants' as const }]
    const rows = categoryProgress(categories, [
      expense({ id: 'a', amount: 4 }),
      expense({ id: 'b', amount: 3.5 }),
      expense({ id: 'c', amount: 2, categoryId: 'gone', categoryName: 'Bus fare', group: 'needs' }),
      expense({ id: 'd', amount: 1, categoryId: 'gone-too', categoryName: 'bus fare', group: 'needs' }),
    ])
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ name: 'Snacks', planned: 10, spent: 7.5, orphan: false })
    expect(rows[1]).toMatchObject({ name: 'Bus fare', planned: 0, spent: 3, orphan: true })
  })
})

describe('little helpers', () => {
  it('never shows NaN', () => {
    expect(fmt(NaN)).toBe('$0')
    expect(fmt(12)).toBe('$12')
    expect(fmt(4.5)).toBe('$4.50')
    expect(pctText(NaN)).toBe('0%')
    expect(pctText(0.5)).toBe('50%')
  })

  it('fills bars safely', () => {
    expect(fillRatio(5, 10)).toBe(0.5)
    expect(fillRatio(15, 10)).toBe(1)
    expect(fillRatio(0, 0)).toBe(0)
    expect(fillRatio(3, 0)).toBe(1)
    expect(isOver(10, 10)).toBe(false)
    expect(isOver(10.01, 10)).toBe(true)
  })
})

describe('copy', () => {
  it('has no em dashes anywhere', () => {
    const strings = JSON.stringify([GROUPS, SPLIT_EXAMPLES, NEEDS_NOTE, QUICK_FILLS, INCOME_PRESETS, CATEGORY_IDEAS])
    expect(strings).not.toContain(String.fromCharCode(0x2014))
  })

  it('has no em dashes in any Budget Builder screen either', () => {
    const sources = import.meta.glob<string>('./*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })
    const files = Object.keys(sources)
    expect(files.length).toBeGreaterThan(5)
    for (const file of files) expect(sources[file], file).not.toContain(String.fromCharCode(0x2014))
  })
})
