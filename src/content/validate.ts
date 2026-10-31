/*
  Checks that content follows the rules in types.ts. Run by `npm test`
  (see content.test.ts), so a typo in a lesson file fails loudly instead of
  breaking a lesson on someone's phone.
*/
import type { Doc, Exercise, Unit } from './types'

export function validateUnit(unit: Unit): string[] {
  const errors: string[] = []
  const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`)
  const ids = new Set<string>()

  if (!/^t[12]-u\d+$/.test(unit.id)) err(unit.id, 'unit id must look like t1-u3')
  if (!unit.id.startsWith(`t${unit.tier}-`)) err(unit.id, 'unit id tier does not match `tier`')
  if (unit.id !== `t${unit.tier}-u${unit.order}`) err(unit.id, 'unit id must equal t{tier}-u{order}')
  if (unit.lessons.length < 3) err(unit.id, 'needs at least 3 lessons')
  if (unit.guidebook.keyIdeas.length < 3) err(unit.id, 'guidebook needs at least 3 key ideas')
  if (unit.guidebook.funFacts.length < 3) err(unit.id, 'guidebook needs at least 3 fun facts')
  if (unit.guidebook.words.length < 4) err(unit.id, 'guidebook needs at least 4 words')

  unit.lessons.forEach((lesson, li) => {
    const expected = `${unit.id}-l${li + 1}`
    if (lesson.id !== expected) err(lesson.id, `lesson id should be ${expected}`)
    const questions = lesson.exercises.filter((e) => e.type !== 'teach')
    if (questions.length < 5) err(lesson.id, `needs at least 5 graded exercises (has ${questions.length})`)
    if (lesson.exercises[0]?.type !== 'teach') err(lesson.id, 'should open with a teach card')
    lesson.exercises.forEach((ex, ei) => {
      const expectedEx = `${lesson.id}-e${ei + 1}`
      if (ex.id !== expectedEx) err(ex.id, `exercise id should be ${expectedEx}`)
      checkExercise(ex, err, ids)
    })
  })

  if (unit.quiz.exercises.length < 6) err(`${unit.id} quiz`, 'needs at least 6 questions')
  unit.quiz.exercises.forEach((ex, ei) => {
    const expectedEx = `${unit.id}-q-e${ei + 1}`
    if (ex.id !== expectedEx) err(ex.id, `quiz exercise id should be ${expectedEx}`)
    if ((ex.type as string) === 'teach') err(ex.id, 'quizzes cannot contain teach cards')
    checkExercise(ex, err, ids)
  })

  return errors
}

const EM_DASH = /—/

function docText(doc: Doc | undefined): string[] {
  if (!doc) return []
  return [doc.title, doc.subtitle ?? '', doc.note ?? '', ...(Array.isArray(doc.rows) ? doc.rows : []).flatMap((r) => [r?.label ?? '', r?.value ?? ''])]
}

function textOf(ex: Exercise): string[] {
  return [...ownText(ex), ...('doc' in ex ? docText(ex.doc) : [])]
}

function ownText(ex: Exercise): string[] {
  switch (ex.type) {
    case 'teach':
      return [ex.title, ex.body, ex.example ?? '']
    case 'mc':
      return [ex.prompt, ex.explain, ...ex.choices.flatMap((c) => [c.text, c.why ?? ''])]
    case 'tf':
      return [ex.statement, ex.explain]
    case 'match':
      return [ex.prompt, ex.explain ?? '', ...ex.pairs.flatMap((p) => [p.left, p.right])]
    case 'sort':
      return [ex.prompt, ex.explain, ...ex.buckets, ...ex.items.map((i) => i.text)]
    case 'scenario':
      return [ex.setup, ex.question, ...ex.choices.flatMap((c) => [c.text, c.outcome])]
    case 'fill':
      return [ex.prompt ?? '', ex.sentence, ex.explain, ...ex.bank]
    case 'number':
      return [ex.prompt, ex.explain]
  }
}

function checkExercise(ex: Exercise, err: (w: string, m: string) => void, ids: Set<string>) {
  if (ids.has(ex.id)) err(ex.id, 'duplicate id')
  ids.add(ex.id)

  for (const t of textOf(ex)) {
    if (EM_DASH.test(t)) err(ex.id, `contains an em dash (use a comma, period, or parentheses): "${t.slice(0, 60)}..."`)
  }

  if ('doc' in ex && ex.doc) checkDoc(ex.doc, (m) => err(ex.id, m))

  switch (ex.type) {
    case 'teach':
      if (!ex.body.trim()) err(ex.id, 'teach card needs a body')
      break
    case 'mc': {
      const correct = ex.choices.filter((c) => c.correct).length
      if (correct !== 1) err(ex.id, `needs exactly 1 correct choice (has ${correct})`)
      if (ex.choices.length < 2 || ex.choices.length > 4) err(ex.id, 'needs 2 to 4 choices')
      if (new Set(ex.choices.map((c) => c.text)).size !== ex.choices.length) err(ex.id, 'duplicate choice text')
      break
    }
    case 'tf':
      if (typeof (ex.answer as unknown) !== 'boolean') err(ex.id, 'answer must be true or false')
      break
    case 'match': {
      if (ex.pairs.length < 3 || ex.pairs.length > 5) err(ex.id, 'needs 3 to 5 pairs')
      const lefts = new Set(ex.pairs.map((p) => p.left))
      const rights = new Set(ex.pairs.map((p) => p.right))
      if (lefts.size !== ex.pairs.length || rights.size !== ex.pairs.length) err(ex.id, 'pair text must be unique')
      break
    }
    case 'sort':
      if (ex.buckets.length < 2 || ex.buckets.length > 3) err(ex.id, 'needs 2 or 3 buckets')
      if (ex.items.length < 4 || ex.items.length > 8) err(ex.id, 'needs 4 to 8 items')
      for (const item of ex.items) {
        if (item.bucket < 0 || item.bucket >= ex.buckets.length) err(ex.id, `item "${item.text}" has a bad bucket index`)
      }
      ex.buckets.forEach((_, b) => {
        if (!ex.items.some((i) => i.bucket === b)) err(ex.id, `bucket ${b} has no items`)
      })
      break
    case 'scenario': {
      const best = ex.choices.filter((c) => c.best).length
      if (best !== 1) err(ex.id, `needs exactly 1 best choice (has ${best})`)
      if (ex.choices.length < 2 || ex.choices.length > 4) err(ex.id, 'needs 2 to 4 choices')
      for (const c of ex.choices) if (!c.outcome?.trim()) err(ex.id, 'every choice needs an outcome')
      break
    }
    case 'fill': {
      const blanks = ex.sentence.split('___').length - 1
      if (blanks < 1) err(ex.id, 'sentence needs at least one ___ blank')
      if (blanks !== ex.answers.length) err(ex.id, `has ${blanks} blanks but ${ex.answers.length} answers`)
      for (const a of ex.answers) if (!ex.bank.includes(a)) err(ex.id, `answer "${a}" is missing from the bank`)
      if (ex.bank.length < ex.answers.length + 2) err(ex.id, 'bank needs at least 2 wrong tiles')
      break
    }
    case 'number':
      if (!Number.isFinite(ex.answer)) err(ex.id, 'answer must be a number')
      break
  }
}

function checkDoc(doc: Doc, err: (m: string) => void) {
  const kinds: Doc['kind'][] = ['paystub', 'receipt', 'statement', 'offer', 'table']
  if (!kinds.includes(doc.kind)) err(`doc kind must be one of ${kinds.join(', ')}`)
  if (typeof doc.title !== 'string' || !doc.title.trim()) err('doc needs a title')
  const rows = Array.isArray(doc.rows) ? doc.rows : []
  if (rows.length < 2 || rows.length > 14) err(`doc needs 2 to 14 rows (has ${rows.length})`)
  rows.forEach((r, i) => {
    if (typeof r?.label !== 'string' || !r.label.trim()) err(`doc row ${i + 1} needs a label`)
    if (typeof r?.value !== 'string' || !r.value.trim()) err(`doc row ${i + 1} needs a value`)
  })
}
