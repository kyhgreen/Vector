/*
  The money math behind the tools. All rates are yearly percentages
  (e.g. 7 means 7% per year) unless the name says otherwise.
*/

/** 50/30/20 split of an amount: needs, wants, savings. */
export function split503020(income: number) {
  return { needs: income * 0.5, wants: income * 0.3, savings: income * 0.2 }
}

export interface GrowthYear {
  year: number
  /** Everything you put in yourself (starting amount + contributions). */
  contributed: number
  /** Interest earned so far. */
  interest: number
  /** contributed + interest. */
  balance: number
}

/**
  Compound growth with monthly deposits, compounded monthly.
  Returns one row per year, starting with year 0 (today).
*/
export function growthByYear(start: number, monthly: number, ratePct: number, years: number): GrowthYear[] {
  const r = ratePct / 100 / 12
  const rows: GrowthYear[] = [{ year: 0, contributed: start, interest: 0, balance: start }]
  let balance = start
  let contributed = start
  for (let m = 1; m <= Math.round(years * 12); m++) {
    balance = balance * (1 + r) + monthly
    contributed += monthly
    if (m % 12 === 0) rows.push({ year: m / 12, contributed, interest: balance - contributed, balance })
  }
  return rows
}

export function futureValue(start: number, monthly: number, ratePct: number, years: number): number {
  const rows = growthByYear(start, monthly, ratePct, years)
  return rows[rows.length - 1].balance
}

/** Rule of 72: roughly how many years it takes money to double at a given rate. */
export function yearsToDouble(ratePct: number): number {
  return ratePct > 0 ? 72 / ratePct : Infinity
}

/**
  How many deposits it takes to reach a goal.
  `perPeriod` is how much you add each period (week or month).
  Returns Infinity if you never get there.
*/
export function periodsToGoal(goal: number, saved: number, perPeriod: number): number {
  const left = goal - saved
  if (left <= 0) return 0
  if (perPeriod <= 0) return Infinity
  return Math.ceil(left / perPeriod)
}

/** Fixed monthly payment for an amortized loan (car loan, student loan). */
export function loanPayment(principal: number, ratePct: number, months: number): number {
  if (months <= 0) return principal
  const r = ratePct / 100 / 12
  if (r === 0) return principal / months
  return (principal * r) / (1 - Math.pow(1 + r, -months))
}

export interface PayoffResult {
  months: number
  totalPaid: number
  totalInterest: number
  /** Balance at the end of each month, starting with the original balance. */
  balances: number[]
  /** True if the payment never covers the interest, so the debt never ends. */
  never: boolean
}

/**
  Paying off a debt (like a credit card) with a fixed monthly payment.
  Gives up after 50 years and marks it `never`.
*/
export function payoff(balance: number, aprPct: number, payment: number): PayoffResult {
  const r = aprPct / 100 / 12
  const balances = [balance]
  let b = balance
  let paid = 0
  let months = 0
  if (payment <= b * r && b > 0) {
    return { months: Infinity, totalPaid: Infinity, totalInterest: Infinity, balances, never: true }
  }
  while (b > 0.005 && months < 600) {
    b = b * (1 + r)
    const pay = Math.min(payment, b)
    b -= pay
    paid += pay
    months++
    balances.push(Math.max(0, b))
  }
  const never = b > 0.005
  return { months: never ? Infinity : months, totalPaid: paid, totalInterest: paid - balance, balances, never }
}

/**
  Credit cards usually set the minimum payment to about 1% of the balance plus
  that month's interest, with a floor (often $25-$35). This simulates paying
  only that minimum every month.
*/
export function minimumPaymentPayoff(balance: number, aprPct: number, floor = 25): PayoffResult {
  const r = aprPct / 100 / 12
  const balances = [balance]
  let b = balance
  let paid = 0
  let months = 0
  while (b > 0.005 && months < 600) {
    const interest = b * r
    const minPay = Math.min(b + interest, Math.max(floor, b * 0.01 + interest))
    b = b + interest - minPay
    paid += minPay
    months++
    balances.push(Math.max(0, b))
  }
  const never = b > 0.005
  return { months: never ? Infinity : months, totalPaid: paid, totalInterest: paid - balance, balances, never }
}

/** Social Security (6.2%) + Medicare (1.45%). Withheld from almost every paycheck. */
export const FICA_RATE = 0.0765

/** A habit's cost over time, and what it would grow to if invested instead. */
export function habitCost(perDay: number, daysPerWeek: number, years: number, ratePct = 7) {
  const perYear = perDay * daysPerWeek * 52
  const spent = perYear * years
  const invested = futureValue(0, perYear / 12, ratePct, years)
  return { perWeek: perDay * daysPerWeek, perMonth: perYear / 12, perYear, spent, invested }
}
