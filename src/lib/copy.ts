/*
  Shared feedback lines used across the app. Rotating a few keeps the same
  words from showing up every time. Keep them short and plain: no jokes,
  no slang, no em dashes, and almost no exclamation marks.
*/
import { pick } from './random'

export const CORRECT_LINES = ['Correct.', "That's right.", 'Nice work.', "That's the one.", 'Good answer.', 'Exactly right.']

export const WRONG_LINES = ['Not quite.', 'Not this time.', "That's not it.", 'Close, but no.']

/** For when you get a question right after missing it earlier in the lesson. */
export const COMEBACK_LINES = ['Got it this time.', 'Right on the second try.', 'Much better.']

export const LESSON_DONE_LINES = ['Lesson complete.', 'Lesson done.', 'Nice work.']

export const PERFECT_LINES = ['Perfect lesson.', 'No mistakes.', 'Every answer right.']

export const QUIT_LINES = [
  "If you leave now, this lesson's progress won't be saved.",
  "Quit now and you'll start this lesson over next time.",
]

export const OUT_OF_HEARTS_LINES = [
  'Hearts come back over time. You can also refill them now or practice to earn one.',
  'Take a short break while your hearts refill, or use one of the options below.',
]

export const randomLine = (lines: readonly string[]) => pick(lines)
