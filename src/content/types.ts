/*
  The shape of all learning content in Vector.

  A Tier holds Units, a Unit holds Lessons plus one Unit Quiz, and a Lesson
  is a list of Exercises. Every exercise has a globally unique `id`, built
  like `t1-u2-l3-e4` (tier 1, unit 2, lesson 3, exercise 4). Quiz exercises
  use `q` in place of the lesson number: `t1-u2-q-e4`.

  Text fields can use a tiny bit of formatting (see components/RichText):
    **bold**              for emphasis
    a line starting "- "  for a bullet point
    a blank line          for a new paragraph
*/

export type TierId = 1 | 2

export type UnitColor = 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'teal' | 'red' | 'yellow'

export interface Tier {
  id: TierId
  name: string
  ages: string // shown to users, e.g. "Ages 11–14"
  minAge: number
  maxAge: number
  tagline: string
}

/* ---------- Documents ---------- */

/**
  A money document drawn on screen as a little paper card: a pay stub, a
  receipt, a bank or card statement, a loan or job offer, or a plain table.
  Values are strings so the writer controls formatting ("$412.50", "22.99%",
  "18 hrs"). Make the numbers add up exactly. Fictional names only.
*/
export interface Doc {
  kind: 'paystub' | 'receipt' | 'statement' | 'offer' | 'table'
  /** e.g. "Juniper Smoothies: pay stub, Oct 1–15" */
  title: string
  /** e.g. "Employee: Maya Reyes · Hourly" */
  subtitle?: string
  /** 2 to 14 rows. `strong` bolds a total line; `indent` nests a detail under the row above. */
  rows: { label: string; value: string; strong?: boolean; indent?: boolean }[]
  /** One line of small print. */
  note?: string
}

/* ---------- Exercises ---------- */

/** A teaching card. Not graded. Used to introduce an idea before questions about it. */
export interface TeachExercise {
  type: 'teach'
  id: string
  title: string
  body: string
  /** Optional worked example shown in a highlighted box under the body. */
  example?: string
  /** Big emoji shown at the top of the card. Keep to one emoji. */
  emoji?: string
  /** Styles the card as a "Fun fact" (the wireframe's Fun Facts pages). */
  funFact?: boolean
  /** Optional money document (pay stub, receipt...) shown with the exercise. */
  doc?: Doc
}

export interface Choice {
  text: string
  correct?: boolean
  /** Shown if the player picks this choice. Explain WHY it's right or wrong. */
  why?: string
}

/** Multiple choice. Exactly one choice must be marked correct. 2 to 4 choices. */
export interface MultipleChoiceExercise {
  type: 'mc'
  id: string
  prompt: string
  choices: Choice[]
  /** Shown after answering, no matter what was picked. */
  explain: string
  /** Optional money document (pay stub, receipt...) shown with the exercise. */
  doc?: Doc
}

/** True/false, presented in the app as "True or false?" */
export interface TrueFalseExercise {
  type: 'tf'
  id: string
  statement: string
  answer: boolean
  explain: string
  /** Optional money document (pay stub, receipt...) shown with the exercise. */
  doc?: Doc
}

/** Tap a term, then tap its match. 3 to 5 pairs. Left and right text must all be unique. */
export interface MatchExercise {
  type: 'match'
  id: string
  prompt: string
  pairs: { left: string; right: string }[]
  explain?: string
}

/** Drop each item into the right bucket. 2 or 3 buckets, 4 to 8 items. */
export interface SortExercise {
  type: 'sort'
  id: string
  prompt: string
  buckets: string[]
  /** `bucket` is the index into `buckets`. */
  items: { text: string; bucket: number }[]
  explain: string
}

/** A real-life situation. Exactly one choice is `best`. Every choice has an outcome. 2 to 4 choices. */
export interface ScenarioExercise {
  type: 'scenario'
  id: string
  /** The story setup. Second person: "You just got..." */
  setup: string
  question: string
  choices: { text: string; outcome: string; best?: boolean }[]
  /** Optional emoji for the person/situation in the story. */
  emoji?: string
  /** Optional money document (pay stub, receipt...) shown with the exercise. */
  doc?: Doc
}

/**
  Fill in the blank(s) by tapping word tiles, Duolingo style.
  `sentence` marks each blank with ___ (three underscores).
  `answers` lists the correct tile for each blank, in order.
  `bank` lists ALL tiles shown (the answers plus 2 to 4 wrong ones), in any order.
*/
export interface FillExercise {
  type: 'fill'
  id: string
  prompt?: string
  sentence: string
  answers: string[]
  bank: string[]
  explain: string
  /** Optional money document (pay stub, receipt...) shown with the exercise. */
  doc?: Doc
}

/** Type a number. Great for quick money math. */
export interface NumberExercise {
  type: 'number'
  id: string
  prompt: string
  answer: number
  /** Accept answers within ± this amount. Default 0. */
  tolerance?: number
  /** Shown before the input, e.g. "$". */
  prefix?: string
  /** Shown after the input, e.g. "%" or "weeks". */
  suffix?: string
  explain: string
  /** Optional money document (pay stub, receipt...) shown with the exercise. */
  doc?: Doc
}

export type QuestionExercise =
  | MultipleChoiceExercise
  | TrueFalseExercise
  | MatchExercise
  | SortExercise
  | ScenarioExercise
  | FillExercise
  | NumberExercise

export type Exercise = TeachExercise | QuestionExercise

export type ExerciseType = Exercise['type']

/* ---------- Lessons & units ---------- */

export interface Lesson {
  id: string // "t1-u2-l3"
  title: string
  /** One short line shown on the lesson's tooltip in the path. */
  description: string
  exercises: Exercise[]
}

export interface UnitQuiz {
  /** Percent correct needed to pass. Default 70. */
  passPercent?: number
  exercises: QuestionExercise[]
}

export interface GuidebookIdea {
  title: string
  body: string
}

export interface Unit {
  id: string // "t1-u2"
  tier: TierId
  /** Position within its tier, starting at 1. */
  order: number
  title: string
  /** A short, funny one-liner under the unit title. */
  tagline: string
  color: UnitColor
  /** One emoji that represents the unit. */
  emoji: string
  guidebook: {
    intro: string
    keyIdeas: GuidebookIdea[]
    funFacts: string[]
    words: { term: string; meaning: string }[]
  }
  lessons: Lesson[]
  quiz: UnitQuiz
}

export const isQuestion = (e: Exercise): e is QuestionExercise => e.type !== 'teach'
