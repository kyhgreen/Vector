/*
  Achievement badges. Each badge has a `check` that looks at the saved game
  data and says whether it's earned. The store re-checks after anything
  changes, so earning one is automatic.

  Tools and screens earn badges by bumping an event counter:
    useGame.getState().track(EVENTS.budgetSaved)
*/
import type { UnitColor } from '../content/types'
import type { GameData } from './types'

/** Event names for `track()`. Use these constants, not raw strings. */
export const EVENTS = {
  budgetSaved: 'budget_saved',
  quickSplitUsed: 'quick_split_used',
  expenseLogged: 'expense_logged',
  goalCreated: 'goal_created',
  goalCompleted: 'goal_completed',
  growthCalcUsed: 'growth_calc_used',
  investTrade: 'invest_trade',
  investDiversified: 'invest_diversified',
  investHeldDip: 'invest_held_dip',
  creditSimUsed: 'credit_sim_used',
  debtCalcUsed: 'debt_calc_used',
  loanCalcUsed: 'loan_calc_used',
  paycheckCalcUsed: 'paycheck_calc_used',
  habitCalcUsed: 'habit_calc_used',
  guidebookOpened: 'guidebook_opened',
  leaguePromoted: 'league_promoted',
  vaultDeposit: 'vault_deposit',
  earlyLesson: 'lesson_early',
  lateLesson: 'lesson_late',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

export interface Badge {
  id: string
  name: string
  /** How to earn it, written for the player. */
  description: string
  emoji: string
  color: UnitColor
  /** [current, goal] for a progress bar on locked badges. */
  progress: (s: GameData) => [number, number]
}

const ev = (s: GameData, name: EventName) => s.stats.events[name] ?? 0
const count = (n: number, goal: number): [number, number] => [Math.min(n, goal), goal]

export const BADGES: Badge[] = [
  { id: 'first-lesson', name: 'First Lesson', emoji: '👣', color: 'green', description: 'Finish your first lesson.', progress: (s) => count(s.stats.lessonsCompleted, 1) },
  { id: 'lessons-10', name: 'Steady Learner', emoji: '📚', color: 'blue', description: 'Finish 10 different lessons.', progress: (s) => count(Object.keys(s.lessons).length, 10) },
  { id: 'lessons-30', name: 'Dedicated Learner', emoji: '🧠', color: 'purple', description: 'Finish 30 different lessons.', progress: (s) => count(Object.keys(s.lessons).length, 30) },
  { id: 'perfect-1', name: 'Flawless', emoji: '💎', color: 'teal', description: 'Finish a lesson with zero mistakes.', progress: (s) => count(s.stats.perfectLessons, 1) },
  { id: 'perfect-10', name: 'Perfectionist', emoji: '🎯', color: 'red', description: 'Finish 10 lessons with zero mistakes.', progress: (s) => count(s.stats.perfectLessons, 10) },
  { id: 'streak-3', name: '3-Day Streak', emoji: '🔥', color: 'orange', description: 'Keep a 3-day streak.', progress: (s) => count(s.streak.longest, 3) },
  { id: 'streak-7', name: '7-Day Streak', emoji: '🌶️', color: 'red', description: 'Keep a 7-day streak.', progress: (s) => count(s.streak.longest, 7) },
  { id: 'streak-30', name: '30-Day Streak', emoji: '🚀', color: 'purple', description: 'Keep a 30-day streak.', progress: (s) => count(s.streak.longest, 30) },
  { id: 'quiz-1', name: 'First Quiz', emoji: '📝', color: 'blue', description: 'Pass a unit quiz.', progress: (s) => count(s.stats.quizzesPassed, 1) },
  { id: 'quiz-perfect', name: 'Perfect Quiz', emoji: '🅰️', color: 'green', description: 'Get 100% on a unit quiz.', progress: (s) => count(s.stats.perfectQuizzes, 1) },
  { id: 'xp-500', name: '500 XP', emoji: '⚡', color: 'yellow', description: 'Earn 500 XP total.', progress: (s) => count(s.xpTotal, 500) },
  { id: 'coins-500', name: '500 Coins', emoji: '🪙', color: 'yellow', description: 'Earn 500 coins total.', progress: (s) => count(s.stats.coinsEarned, 500) },
  { id: 'practice-1', name: 'First Practice', emoji: '🏋️', color: 'teal', description: 'Finish a practice session.', progress: (s) => count(s.stats.practiceDone, 1) },
  { id: 'guidebook', name: 'Guidebook Reader', emoji: '📖', color: 'blue', description: 'Open a unit guidebook.', progress: (s) => count(ev(s, EVENTS.guidebookOpened), 1) },
  { id: 'vault', name: 'First Deposit', emoji: '🏦', color: 'green', description: 'Put coins in the Coin Vault.', progress: (s) => count(ev(s, EVENTS.vaultDeposit), 1) },
  { id: 'vault-interest', name: 'Interest Earned', emoji: '🌱', color: 'green', description: 'Earn 50 coins of interest in the Coin Vault.', progress: (s) => count(Math.floor(s.vault.totalInterest), 50) },
  { id: 'shop', name: 'First Purchase', emoji: '🛍️', color: 'pink', description: 'Buy something in the shop.', progress: (s) => count(s.stats.purchases, 1) },
  { id: 'budget', name: 'First Budget', emoji: '📊', color: 'green', description: 'Build and save a budget.', progress: (s) => count(ev(s, EVENTS.budgetSaved), 1) },
  { id: 'goal', name: 'Goal Set', emoji: '🎯', color: 'orange', description: 'Create a savings goal.', progress: (s) => count(ev(s, EVENTS.goalCreated), 1) },
  { id: 'goal-done', name: 'Goal Reached', emoji: '🏁', color: 'purple', description: 'Hit a savings goal.', progress: (s) => count(ev(s, EVENTS.goalCompleted), 1) },
  { id: 'trade', name: 'First Trade', emoji: '📈', color: 'blue', description: 'Make your first practice trade.', progress: (s) => count(ev(s, EVENTS.investTrade), 1) },
  { id: 'diversify', name: 'Diversified', emoji: '🧺', color: 'yellow', description: 'Own 4 different investments at once.', progress: (s) => count(ev(s, EVENTS.investDiversified), 1) },
  { id: 'diamond-hands', name: 'Steady Hands', emoji: '🧘', color: 'teal', description: 'Hold through a big dip without selling.', progress: (s) => count(ev(s, EVENTS.investHeldDip), 1) },
  { id: 'credit', name: 'Score Explorer', emoji: '🧪', color: 'purple', description: 'Try the credit score simulator.', progress: (s) => count(ev(s, EVENTS.creditSimUsed), 1) },
  { id: 'debt', name: 'Payoff Planner', emoji: '🔍', color: 'red', description: 'Find out how long a debt takes to pay off.', progress: (s) => count(ev(s, EVENTS.debtCalcUsed), 1) },
  { id: 'paycheck', name: 'Payday', emoji: '💵', color: 'green', description: 'Work out your take-home pay.', progress: (s) => count(ev(s, EVENTS.paycheckCalcUsed), 1) },
  { id: 'habit', name: 'Habit Check', emoji: '🧋', color: 'pink', description: 'Find out what a habit costs over time.', progress: (s) => count(ev(s, EVENTS.habitCalcUsed), 1) },
  { id: 'league-up', name: 'Promoted', emoji: '🏆', color: 'yellow', description: 'Get promoted in the weekly league.', progress: (s) => count(ev(s, EVENTS.leaguePromoted), 1) },
  { id: 'early-bird', name: 'Early Bird', emoji: '🌅', color: 'orange', description: 'Finish a lesson before 8 AM.', progress: (s) => count(ev(s, EVENTS.earlyLesson), 1) },
  { id: 'night-shift', name: 'Night Shift', emoji: '🌙', color: 'purple', description: 'Finish a lesson after 9 PM.', progress: (s) => count(ev(s, EVENTS.lateLesson), 1) },
]

export const getBadge = (id: string) => BADGES.find((b) => b.id === id)

export function isEarned(b: Badge, s: GameData) {
  const [cur, goal] = b.progress(s)
  return cur >= goal
}

/** Badge ids that are earned now but not yet recorded. */
export function newlyEarned(s: GameData): string[] {
  return BADGES.filter((b) => !s.badges[b.id] && isEarned(b, s)).map((b) => b.id)
}
