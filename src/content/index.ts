/*
  Content registry. Every file in ./units/ that default-exports a Unit is
  picked up automatically, so adding a unit means adding one file. Nothing
  else to wire up.
*/
import type { Exercise, Lesson, Tier, TierId, Unit } from './types'

export const TIERS: Tier[] = [
  {
    id: 1,
    name: 'Money Basics',
    ages: 'Ages 11–14',
    minAge: 11,
    maxAge: 14,
    tagline: 'Budgeting, saving, banks, smart shopping, scams, and a first look at investing.',
  },
  {
    id: 2,
    name: 'Real-World Money',
    ages: 'Ages 15–18',
    minAge: 15,
    maxAge: 18,
    tagline: 'Paychecks, credit, loans, investing, college costs, and protecting your money.',
  },
]

const modules = import.meta.glob<{ default: Unit }>('./units/*.ts', { eager: true })

export const UNITS: Unit[] = Object.values(modules)
  .map((m) => m.default)
  .filter(Boolean)
  .sort((a, b) => a.tier - b.tier || a.order - b.order)

const unitById = new Map(UNITS.map((u) => [u.id, u]))
const lessonById = new Map<string, { lesson: Lesson; unit: Unit; index: number }>()
const exerciseById = new Map<string, Exercise>()

for (const unit of UNITS) {
  unit.lessons.forEach((lesson, index) => {
    lessonById.set(lesson.id, { lesson, unit, index })
    for (const ex of lesson.exercises) exerciseById.set(ex.id, ex)
  })
  for (const ex of unit.quiz.exercises) exerciseById.set(ex.id, ex)
}

export const getTier = (id: TierId) => TIERS.find((t) => t.id === id)!
export const tierForAge = (age: number): TierId => (age >= 15 ? 2 : 1)
export const unitsInTier = (tier: TierId) => UNITS.filter((u) => u.tier === tier)
export const getUnit = (id: string) => unitById.get(id)
export const getLessonInfo = (id: string) => lessonById.get(id)
export const getExercise = (id: string) => exerciseById.get(id)

/** Every node on the learning path for a tier, in order: each unit's lessons, then its quiz. */
export type PathNode =
  | { kind: 'lesson'; id: string; unit: Unit; lesson: Lesson; indexInUnit: number }
  | { kind: 'quiz'; id: string; unit: Unit }

export const quizNodeId = (unitId: string) => `${unitId}-quiz`

export function pathForTier(tier: TierId): PathNode[] {
  const nodes: PathNode[] = []
  for (const unit of unitsInTier(tier)) {
    unit.lessons.forEach((lesson, i) =>
      nodes.push({ kind: 'lesson', id: lesson.id, unit, lesson, indexInUnit: i }),
    )
    nodes.push({ kind: 'quiz', id: quizNodeId(unit.id), unit })
  }
  return nodes
}
