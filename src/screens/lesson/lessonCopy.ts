/*
  Every line the lesson player says. Plain and short. No slang, no em dashes,
  and an exclamation mark only for a real celebration (finishing a unit).
*/
import type { Mode } from './session'

export const CORRECT_LINES = ['Correct.', "That's right.", 'Nice work.', 'Exactly right.']

export const WRONG_LINES = ['Not quite.', "That's not it.", 'Not this time.']

export const COMEBACK_LINES = ['Got it this time.', 'Right this time.', 'Correct this time.']

export const COMBO_TAILS = ['Keep going.', 'Nice work.', 'Keep it up.']

export const RETRY_LABEL = 'Missed earlier'

export const QUIT_TITLES: Record<Mode, string> = {
  lesson: 'Quit this lesson?',
  quiz: 'Quit the quiz?',
  practice: 'Quit practice?',
}

export const LESSON_QUIT_LINES = ["You'll lose your progress on this lesson.", "If you leave now, you'll start over next time."]

export const QUIZ_QUIT_LINES = ["Your answers so far won't count.", "You won't get a score or coins for this try."]

export const PRACTICE_QUIT_LINES = ["You'll miss the bonus heart.", 'Your saved mistakes will still be here next time.']

export const MATCH_MESSY_LINES = ['Matched after a few tries.', 'Done, with a few wrong taps.']
export const MATCH_MESSY_NOTE = 'No hearts lost. This one will come back in Practice.'
/** Quizzes score honestly: 2+ wrong taps means this one doesn't count as right. */
export const MATCH_MESSY_NOTE_QUIZ = "You had a few wrong taps, so this one doesn't count toward your score."

export const LESSON_DONE_LINES = ['Lesson complete', 'Lesson done']
export const LESSON_SUBS = ['Nice work.', 'Your progress is saved.']

export const PERFECT_LINES = ['Perfect lesson', 'No mistakes']
export const PERFECT_SUBS = ['You got every question right.', 'Every answer was correct.']

export const QUIZ_PASS_LINES = ['Unit complete!']
export const QUIZ_PASS_SUB = 'You passed the quiz and finished this unit.'
export const QUIZ_PERFECT_SUB = 'You got every question right.'
export const QUIZ_FAIL_TITLE = 'Not passed yet'
export const QUIZ_FAIL_CLOSE = (short: number) => `You were ${short} ${short === 1 ? 'answer' : 'answers'} short of passing.`
export const QUIZ_FAIL_FAR = 'Review the guidebook, then try again.'

export const PRACTICE_DONE_LINES = ['Practice complete', 'Practice done']
export const PRACTICE_SUBS = ['Nice work.', 'Going over past mistakes helps you remember.']

export const STREAK_SUBS = ['Come back tomorrow to keep it going.', 'See you tomorrow.']
export const STREAK_FIRST_SUB = 'Come back tomorrow to make it 2 days.'

export const EMPTY_PRACTICE = {
  title: 'Nothing to practice yet.',
  body: 'Questions you miss in lessons and quizzes show up here, so you can try them again.',
}
