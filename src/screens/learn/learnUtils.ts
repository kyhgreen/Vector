/*
  Small helpers shared by the Learn path and the Guidebook.
*/
import { useMemo, type CSSProperties } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { PathNode } from '../../content'
import type { TierId } from '../../content/types'
import type { ButtonColor } from '../../components/Button'
import { isTierUnlocked, homeTier, nextNode } from '../../state/progress'
import { useGame } from '../../state/store'
import type { GameData } from '../../state/types'

/**
  The save data that decides what's done, open, or locked. Only re-renders
  when lessons, quizzes, settings, or the profile change (not on every toast).
*/
export function usePathData(): GameData {
  const slice = useGame(
    useShallow((s) => ({ lessons: s.lessons, quizzes: s.quizzes, settings: s.settings, profile: s.profile })),
  )
  return useMemo(() => ({ ...useGame.getState(), ...slice }), [slice])
}

/** CSS variables for a brand color: --c (main), --cd (3D edge), --cs (soft tint). */
export function colorVars(color: ButtonColor): CSSProperties {
  return {
    ['--c' as string]: `var(--c-${color})`,
    ['--cd' as string]: `var(--c-${color}-dark)`,
    ['--cs' as string]: `var(--c-${color}-soft)`,
  } as CSSProperties
}

/** 0..1 to a whole percent. Never NaN. */
export function toPct(v: number | undefined): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return 0
  return Math.round(Math.max(0, Math.min(1, v)) * 100)
}

/** Where tapping "Start" on a node goes. */
export function nodeHref(node: PathNode): string {
  return node.kind === 'lesson' ? `/lesson/${node.lesson.id}` : `/quiz/${node.unit.id}`
}

/** "Lesson 2 of 4" or "Unit quiz". */
export function nodeKicker(node: PathNode): string {
  if (node.kind === 'quiz') return 'Unit quiz'
  return `Lesson ${node.indexInUnit + 1} of ${node.unit.lessons.length}`
}

/** Short name for lists: the lesson title, or "<Unit> quiz" for the unit quiz. */
export function nodeTitle(node: PathNode): string {
  return node.kind === 'lesson' ? node.lesson.title : `${node.unit.title} quiz`
}

/** Which tier the Learn tab should open on: the one holding your next lesson. */
export function defaultTier(data: GameData): TierId {
  const home = homeTier(data)
  const order: TierId[] = home === 1 ? [1, 2] : [2, 1]
  for (const t of order) if (isTierUnlocked(data, t) && nextNode(data, t)) return t
  return home
}

/** Remembers the tier you picked while the app stays open (resets on reload, on purpose). */
let rememberedTier: TierId | null = null
export const getRememberedTier = () => rememberedTier
export const rememberTier = (t: TierId | null) => {
  rememberedTier = t
}

export const TIER_LOOK: Record<TierId, { emoji: string; color: ButtonColor }> = {
  1: { emoji: '🌱', color: 'green' },
  2: { emoji: '🚀', color: 'purple' },
}
