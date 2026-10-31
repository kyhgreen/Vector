/*
  The Budget Builder's saved data, already repaired and filled in with
  age-aware starter values. `update(fn)` always receives complete data.
*/
import { useCallback, useMemo } from 'react'
import { tierForAge } from '../../content'
import type { TierId } from '../../content/types'
import { useToolState } from '../../state/hooks'
import { useGame } from '../../state/store'
import { normalize, type BudgetData } from './model'

/** Module constant so useToolState keeps a stable identity. Nothing saved yet = null. */
const NOTHING_SAVED: unknown = null

export type BudgetUpdate = (fn: (d: BudgetData) => BudgetData) => void

export function useBudget(): { data: BudgetData; update: BudgetUpdate; tier: TierId } {
  const age = useGame((s) => s.profile.age)
  const tier = tierForAge(age)
  const [raw, setRaw] = useToolState<unknown>('budget', NOTHING_SAVED)
  const data = useMemo(() => normalize(raw, tier), [raw, tier])
  const update = useCallback<BudgetUpdate>((fn) => setRaw((prev: unknown) => fn(normalize(prev, tier))), [setRaw, tier])
  return { data, update, tier }
}
