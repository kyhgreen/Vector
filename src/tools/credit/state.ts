/*
  What the Credit Score Simulator saves on the device, plus a sanitizer so a
  broken or old save can never crash the page or show NaN.
*/
import { ACTIONS, FACTORS, START, type Account, type ActionId, type FactorScores, type Profile } from './model'

export interface LogEntry {
  /** Increasing number, used as a React key. */
  n: number
  action: ActionId
  before: number
  after: number
  /** Simulated month after the move. */
  month: number
  title: string
  body: string
  factorDelta: FactorScores
  /** The report right before this move, so "Undo" can rewind. */
  prev: Profile
}

export interface CreditState {
  profile: Profile
  /** Newest first. */
  log: LogEntry[]
}

export const LOG_MAX = 30

export const INITIAL_CREDIT: CreditState = { profile: START, log: [] }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown, fallback: number, lo = -Infinity, hi = Infinity) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback)
const nums = (v: unknown, lo = 0, hi = 10_000) => (Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number' && Number.isFinite(x)).map((x) => Math.min(hi, Math.max(lo, x))) : [])

function sanitizeAccount(v: unknown, i: number): Account | null {
  if (!isObj(v)) return null
  const kind = v.kind === 'loan' ? 'loan' : v.kind === 'card' ? 'card' : null
  if (!kind) return null
  const closedFor = v.closedFor === null || v.closedFor === undefined ? null : num(v.closedFor, 0, 0, 10_000)
  return {
    id: num(v.id, 1000 + i, 0),
    kind,
    name: typeof v.name === 'string' && v.name.trim() ? v.name.slice(0, 40) : kind === 'card' ? 'Credit card' : 'Car loan',
    ageMonths: num(v.ageMonths, 0, 0, 10_000),
    limit: num(v.limit, 500, 1, 1_000_000),
    termMonths: v.termMonths === undefined ? undefined : num(v.termMonths, 60, 1, 600),
    closedFor,
    closedReason: closedFor === null ? undefined : v.closedReason === 'paid' ? 'paid' : 'closed',
  }
}

export function sanitizeProfile(v: unknown): Profile {
  if (!isObj(v)) return START
  const accounts = Array.isArray(v.accounts) ? v.accounts.map(sanitizeAccount).filter((a): a is Account => !!a).slice(0, 40) : []
  if (!accounts.length) return START
  const maxId = Math.max(...accounts.map((a) => a.id))
  return {
    month: num(v.month, 0, 0, 100_000),
    onTime: num(v.onTime, 0, 0, 100_000),
    missed: nums(v.missed).slice(0, 50),
    balance: num(v.balance, 0, 0, 1_000_000),
    inquiries: nums(v.inquiries).slice(0, 50),
    accounts,
    nextId: Math.max(num(v.nextId, maxId + 1, 0), maxId + 1),
  }
}

const ACTION_IDS = new Set<string>(ACTIONS.map((a) => a.id))

function sanitizeDelta(v: unknown): FactorScores {
  const o = isObj(v) ? v : {}
  return Object.fromEntries(FACTORS.map((f) => [f.id, num(o[f.id], 0, -100, 100)])) as FactorScores
}

function sanitizeEntry(v: unknown, i: number): LogEntry | null {
  if (!isObj(v) || typeof v.action !== 'string' || !ACTION_IDS.has(v.action)) return null
  return {
    n: num(v.n, i, 0),
    action: v.action as ActionId,
    before: num(v.before, 300, 300, 850),
    after: num(v.after, 300, 300, 850),
    month: num(v.month, 0, 0, 100_000),
    title: typeof v.title === 'string' ? v.title : '',
    body: typeof v.body === 'string' ? v.body : '',
    factorDelta: sanitizeDelta(v.factorDelta),
    prev: sanitizeProfile(v.prev),
  }
}

export function sanitizeCredit(v: unknown): CreditState {
  if (!isObj(v)) return INITIAL_CREDIT
  const log = Array.isArray(v.log) ? v.log.map(sanitizeEntry).filter((e): e is LogEntry => !!e).slice(0, LOG_MAX) : []
  return { profile: sanitizeProfile(v.profile), log }
}
