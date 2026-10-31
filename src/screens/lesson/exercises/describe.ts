/*
  Plain-text summaries of exercises: the question, the right answer, and the
  explanation. Used by the feedback panel and the "Review your misses" list.
*/
import type { Exercise, NumberExercise } from '../../../content/types'

export const TF_TITLE = 'True or false?'
export const TRUE_LABEL = 'True'
export const FALSE_LABEL = 'False'

const stripBold = (s: string) => s.replace(/\*\*/g, '')

/** Shows a number the way the question asked for it: "$1,200", "25%", "6 weeks". */
export function formatNumberAnswer(ex: Pick<NumberExercise, 'answer' | 'prefix' | 'suffix'>): string {
  const n = Number.isFinite(ex.answer) ? ex.answer : 0
  // Dollars with cents always get two digits: "$15.30", never "$15.3".
  const cents = ex.prefix === '$' && !Number.isInteger(n)
  const body = n.toLocaleString('en-US', cents ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 2 })
  const prefix = ex.prefix ?? ''
  const suffix = ex.suffix ? (/^[A-Za-z]/.test(ex.suffix) ? ` ${ex.suffix}` : ex.suffix) : ''
  return `${prefix}${body}${suffix}`
}

/** Fills each ___ in a sentence with the given words. */
export function fillSentence(sentence: string, words: string[]): string {
  let i = 0
  return sentence.replace(/_{3,}/g, () => words[i++] ?? '___')
}

export function promptOf(ex: Exercise): string {
  switch (ex.type) {
    case 'teach':
      return ex.title
    case 'mc':
    case 'match':
    case 'sort':
    case 'number':
      return stripBold(ex.prompt)
    case 'tf':
      return `${TF_TITLE} ${stripBold(ex.statement)}`
    case 'scenario':
      return stripBold(ex.question)
    case 'fill':
      return stripBold(ex.sentence)
  }
}

export function answerOf(ex: Exercise): string {
  switch (ex.type) {
    case 'teach':
      return ''
    case 'mc':
      return ex.choices.find((c) => c.correct)?.text ?? ''
    case 'tf':
      return ex.answer ? TRUE_LABEL : FALSE_LABEL
    case 'match':
      return ex.pairs.map((p) => `${p.left} = ${p.right}`).join(' · ')
    case 'sort':
      return ex.buckets
        .map((b, bi) => {
          const items = ex.items.filter((it) => it.bucket === bi).map((it) => it.text)
          return items.length ? `${b}: ${items.join(', ')}` : ''
        })
        .filter(Boolean)
        .join(' · ')
    case 'scenario':
      return ex.choices.find((c) => c.best)?.text ?? ''
    case 'fill':
      return fillSentence(ex.sentence, ex.answers)
    case 'number':
      return formatNumberAnswer(ex)
  }
}

export function explainOf(ex: Exercise): string {
  switch (ex.type) {
    case 'teach':
      return ''
    case 'scenario':
      return ''
    case 'match':
      return ex.explain ?? ''
    default:
      return ex.explain
  }
}
