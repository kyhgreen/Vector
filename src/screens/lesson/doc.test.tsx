// @vitest-environment jsdom
/*
  Document cards (pay stubs, receipts...) render through the real exercise
  components: every row shows, the structure is screen-reader friendly, and
  nothing ugly (NaN, undefined) reaches the screen.
*/
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import type { Doc, Exercise } from '../../content/types'
import { validateUnit } from '../../content/validate'
import { UNITS } from '../../content'
import { ExerciseView } from './exercises/ExerciseView'

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
  if (!window.matchMedia) {
    window.matchMedia = ((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
})
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false
})
afterEach(() => cleanup())

const PAYSTUB: Doc = {
  kind: 'paystub',
  title: 'Juniper Smoothies: pay stub, Oct 1–15',
  subtitle: 'Employee: Maya Reyes · Hourly',
  rows: [
    { label: 'Hours worked', value: '30 hrs' },
    { label: 'Pay rate', value: '$15.00/hr' },
    { label: 'Gross pay', value: '$450.00', strong: true },
    { label: 'Social Security (6.2%)', value: '-$27.90', indent: true },
    { label: 'Medicare (1.45%)', value: '-$6.53', indent: true },
    { label: 'Federal income tax', value: '-$18.00', indent: true },
    { label: 'Net pay', value: '$397.57', strong: true },
  ],
  note: 'Direct deposit to checking ending 0412.',
}

const RECEIPT: Doc = {
  kind: 'receipt',
  title: 'Pine Street Market',
  subtitle: 'Oct 12, 4:31 PM · Register 3',
  rows: [
    { label: 'Granola bars', value: '$4.49' },
    { label: 'Apples (3 lb)', value: '$5.97' },
    { label: 'Subtotal', value: '$10.46' },
    { label: 'Sales tax (6%)', value: '$0.63' },
    { label: 'Total', value: '$11.09', strong: true },
  ],
  note: 'Returns within 30 days with receipt.',
}

const EM_DASH = String.fromCharCode(0x2014)

const run = (ex: Exercise) =>
  render(<ExerciseView ex={ex} checked={false} keysActive={false} onAnswer={vi.fn()} />)

function expectDocShown(doc: Doc, container: HTMLElement) {
  const fig = screen.getByRole('figure', { name: doc.title })
  const f = within(fig)
  if (doc.subtitle) expect(f.getByText(doc.subtitle)).toBeTruthy()
  if (doc.note) expect(f.getByText(doc.note)).toBeTruthy()
  const terms = fig.querySelectorAll('dl dt')
  const values = fig.querySelectorAll('dl dd')
  expect(terms).toHaveLength(doc.rows.length)
  expect(values).toHaveLength(doc.rows.length)
  doc.rows.forEach((r, i) => {
    expect(terms[i].textContent).toBe(r.label)
    expect(values[i].textContent).toBe(r.value)
  })
  const text = container.textContent ?? ''
  expect(text).not.toMatch(/NaN|undefined/)
}

describe('document cards', () => {
  it('shows a pay stub in a multiple choice question, above the prompt', () => {
    const { container } = run({
      type: 'mc',
      id: 'x-mc',
      prompt: 'How much does Maya actually take home?',
      choices: [{ text: '$397.57', correct: true }, { text: '$450.00' }, { text: '$15.00' }],
      explain: 'Net pay is what lands in the bank.',
      doc: PAYSTUB,
    })
    expectDocShown(PAYSTUB, container)
    const fig = screen.getByRole('figure')
    const prompt = screen.getByRole('heading', { name: /take home/ })
    expect(fig.compareDocumentPosition(prompt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('shows a receipt in a true or false question', () => {
    const { container } = run({
      type: 'tf',
      id: 'x-tf',
      statement: 'The sales tax on this receipt was **$0.63**.',
      answer: true,
      explain: '6% of $10.46 is about $0.63.',
      doc: RECEIPT,
    })
    expectDocShown(RECEIPT, container)
  })

  it('works in every exercise type that accepts a doc', () => {
    const exercises: Exercise[] = [
      { type: 'teach', id: 'x-t', title: 'Read your stub', body: 'Gross pay comes first.', doc: PAYSTUB },
      {
        type: 'scenario',
        id: 'x-s',
        setup: 'You just bought snacks.',
        question: 'What do you do with the receipt?',
        choices: [
          { text: 'Keep it for a week', outcome: 'Handy if something is wrong.', best: true },
          { text: 'Toss it', outcome: 'No proof if you need a refund.' },
        ],
        doc: RECEIPT,
      },
      { type: 'number', id: 'x-n', prompt: 'What was the total?', answer: 11.09, prefix: '$', explain: 'Bottom line.', doc: RECEIPT },
      {
        type: 'fill',
        id: 'x-f',
        sentence: 'Take-home pay is called ___ pay.',
        answers: ['net'],
        bank: ['net', 'gross', 'base'],
        explain: 'Net is after taxes.',
        doc: PAYSTUB,
      },
    ]
    for (const ex of exercises) {
      const { container } = run(ex)
      expectDocShown(('doc' in ex ? ex.doc : undefined) as Doc, container)
      cleanup()
    }
  })

  it('validation catches a broken doc and em dashes inside it', () => {
    const source = UNITS.find((u) => u.lessons.some((l) => l.exercises.some((e) => e.type === 'mc')))
    if (!source) throw new Error('expected at least one multiple choice exercise')
    const unit = structuredClone(source)
    const ex = unit.lessons.flatMap((l) => l.exercises).find((e) => e.type === 'mc')
    if (!ex || ex.type !== 'mc') throw new Error('expected a multiple choice exercise')
    ex.doc = { kind: 'table', title: ' ', rows: [{ label: 'Only row', value: '' }], note: `Fine print ${EM_DASH} here` }
    const errors = validateUnit(unit).filter((e) => e.startsWith(ex.id))
    expect(errors.some((e) => /title/.test(e))).toBe(true)
    expect(errors.some((e) => /2 to 14 rows/.test(e))).toBe(true)
    expect(errors.some((e) => /row 1 needs a value/.test(e))).toBe(true)
    expect(errors.some((e) => /em dash/.test(e))).toBe(true)
  })
})
