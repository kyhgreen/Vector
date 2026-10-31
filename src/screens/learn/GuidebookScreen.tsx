/*
  A unit's guidebook (/unit/:unitId): the cheat sheet for a unit. Key ideas,
  fun facts, money words, the lesson list, and a button into the next lesson.
*/
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useReducedMotion } from 'motion/react'
import { Check, ChevronRight, Lock, Star, Trophy } from 'lucide-react'
import { getTier, getUnit } from '../../content'
import type { Unit } from '../../content/types'
import { PageHeader } from '../../components/PageHeader'
import { RichText } from '../../components/RichText'
import { Button } from '../../components/Button'
import { Empty, ProgressBar } from '../../components/ui'
import { EVENTS } from '../../state/badges'
import { isTierUnlocked, pathWithStatus, type PathItem } from '../../state/progress'
import { useGame } from '../../state/store'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { colorVars, nodeHref, nodeKicker, nodeTitle, usePathData } from './learnUtils'
import styles from './GuidebookScreen.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

export default function GuidebookScreen() {
  const { unitId = '' } = useParams()
  const unit = getUnit(unitId)
  const data = usePathData()
  const tracked = useRef<string | null>(null)

  // Count the visit once per unit (the ref survives StrictMode's double effect run).
  useEffect(() => {
    if (!unit || tracked.current === unit.id) return
    tracked.current = unit.id
    useGame.getState().track(EVENTS.guidebookOpened)
  }, [unit])

  const items = useMemo(() => (unit ? pathWithStatus(data, unit.tier).filter((i) => i.node.unit.id === unit.id) : []), [data, unit])

  if (!unit) return <MissingUnit />
  return <Guidebook unit={unit} items={items} tierLocked={!isTierUnlocked(data, unit.tier)} />
}

/* ---------------------------------------------------------------------------------- */

function Guidebook({ unit, items, tierLocked }: { unit: Unit; items: PathItem[]; tierLocked: boolean }) {
  const reduce = useReducedMotion()
  const book = unit.guidebook ?? { intro: '', keyIdeas: [], funFacts: [], words: [] }
  const ideas = (book.keyIdeas ?? []).filter((i) => i && i.title)
  const facts = (book.funFacts ?? []).filter((f) => f && f.trim())
  const words = (book.words ?? []).filter((w) => w && w.term)
  const tier = getTier(unit.tier)
  const doneCount = items.filter((i) => i.status === 'done').length
  const pct = items.length ? doneCount / items.length : 0

  const sections = [
    ideas.length > 0 && { id: 'ideas', label: 'Ideas' },
    facts.length > 0 && { id: 'facts', label: 'Facts' },
    words.length > 0 && { id: 'words', label: 'Words' },
    items.length > 0 && { id: 'inside', label: 'Lessons' },
  ].filter(Boolean) as { id: string; label: string }[]

  const jumpTo = (id: string) => {
    sfx.tap()
    haptic.tap()
    document.getElementById(`gb-${id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className={styles.screen} style={colorVars(unit.color)}>
      <PageHeader title="Guidebook" back="/learn" />

      <section className={styles.hero} aria-labelledby="gb-title">
        <div className={styles.heroTop}>
          <span className={styles.heroEmoji} aria-hidden>
            {unit.emoji}
          </span>
          <div className={styles.heroText}>
            <p className={styles.heroKicker}>
              Unit {unit.order}
              {tier ? `, ${tier.name}` : ''}
            </p>
            <h2 id="gb-title" className={styles.heroTitle}>
              {unit.title}
            </h2>
          </div>
        </div>
        {unit.tagline && <p className={styles.heroTagline}>{unit.tagline}</p>}
        {book.intro && <RichText text={book.intro} className={styles.heroIntro} />}
        {items.length > 0 && (
          <div className={styles.heroProgress}>
            <ProgressBar value={pct} color={unit.color} height={10} label={`${unit.title} progress`} />
            <span className={styles.heroCount}>
              {doneCount}/{items.length}
            </span>
          </div>
        )}
      </section>

      {sections.length > 1 && (
        <nav className={styles.jumps} aria-label="Jump to a section">
          {sections.map((s) => (
            <button key={s.id} type="button" className={styles.jump} onClick={() => jumpTo(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>
      )}

      {ideas.length === 0 && facts.length === 0 && words.length === 0 && (
        <Empty emoji="✍️" title="Still being written">
          The notes for this unit aren't ready yet. You can still play the lessons.
        </Empty>
      )}

      {ideas.length > 0 && (
        <section id="gb-ideas" className={styles.section} aria-labelledby="gb-ideas-title">
          <h3 id="gb-ideas-title" className={styles.sectionTitle}>
            Key ideas
          </h3>
          <ol className={styles.ideas}>
            {ideas.map((idea, i) => (
              <li key={`${i}-${idea.title}`} className={styles.idea}>
                <span className={styles.ideaNum} aria-hidden>
                  {i + 1}
                </span>
                <div className={styles.ideaText}>
                  <h4 className={styles.ideaTitle}>{idea.title}</h4>
                  {idea.body && <RichText text={idea.body} className={styles.ideaBody} />}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {facts.length > 0 && (
        <section id="gb-facts" className={styles.section} aria-labelledby="gb-facts-title">
          <h3 id="gb-facts-title" className={styles.sectionTitle}>
            Fun facts
          </h3>
          <ul className={styles.facts}>
            {facts.map((fact, i) => (
              <li key={`${i}-${fact.slice(0, 16)}`} className={styles.fact}>
                {fact}
              </li>
            ))}
          </ul>
        </section>
      )}

      {words.length > 0 && (
        <section id="gb-words" className={styles.section} aria-labelledby="gb-words-title">
          <h3 id="gb-words-title" className={styles.sectionTitle}>
            Words to know
          </h3>
          <dl className={styles.words}>
            {words.map((w, i) => (
              <div key={`${i}-${w.term}`} className={styles.word}>
                <dt className={styles.term}>{w.term}</dt>
                <dd className={styles.meaning}>{w.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {items.length > 0 && (
        <section id="gb-inside" className={styles.section} aria-labelledby="gb-inside-title">
          <h3 id="gb-inside-title" className={styles.sectionTitle}>
            Lessons
          </h3>
          <ul className={styles.inside}>
            {items.map((item) => (
              <InsideRow key={item.node.id} item={item} />
            ))}
          </ul>
        </section>
      )}

      <NextUp unit={unit} items={items} tierLocked={tierLocked} />
    </div>
  )
}

/* ---------------------------------------------------------------------------------- */

function InsideRow({ item }: { item: PathItem }) {
  const navigate = useNavigate()
  const { node, status } = item
  const locked = status === 'locked'
  const isQuiz = node.kind === 'quiz'
  const Icon = status === 'done' ? Check : locked ? Lock : isQuiz ? Trophy : Star
  const statusText = status === 'done' ? 'Done' : status === 'current' ? 'Up next' : locked ? 'Locked' : 'Open'
  const title = nodeTitle(node)

  const content = (
    <>
      <span className={cx(styles.insideIcon, styles[`is_${status}`])} aria-hidden>
        <Icon size={18} strokeWidth={status === 'done' ? 4 : 3} fill={Icon === Star ? 'currentColor' : 'none'} />
      </span>
      <span className={styles.insideText}>
        <span className={styles.insideTitle}>{title}</span>
        <span className={styles.insideKicker}>{status === 'current' ? 'Up next' : nodeKicker(node)}</span>
      </span>
      {!locked && <ChevronRight className={styles.insideChev} size={20} strokeWidth={3} aria-hidden />}
    </>
  )

  return (
    <li>
      {locked ? (
        <div className={cx(styles.insideRow, styles.insideLocked)} aria-label={`${nodeKicker(node)}: ${title}. Locked.`}>
          {content}
        </div>
      ) : (
        <button
          type="button"
          className={cx(styles.insideRow, status === 'current' && styles.insideCurrent)}
          onClick={() => {
            sfx.tap()
            haptic.tap()
            navigate(nodeHref(node))
          }}
          aria-label={`${nodeKicker(node)}: ${title}. ${statusText}. ${status === 'done' ? 'Play again' : 'Start'}.`}
        >
          {content}
        </button>
      )}
    </li>
  )
}

/* ---------------------------------------------------------------------------------- */

function NextUp({ unit, items, tierLocked }: { unit: Unit; items: PathItem[]; tierLocked: boolean }) {
  const navigate = useNavigate()
  const nextLesson = items.find((i) => i.node.kind === 'lesson' && i.status !== 'done')
  const quiz = items.find((i) => i.node.kind === 'quiz')
  const quizReady = !!quiz && quiz.status !== 'done' && quiz.status !== 'locked' && unit.quiz.exercises.length > 0

  let line: string
  let label: string
  let to: string

  if (nextLesson && nextLesson.status !== 'locked') {
    line = `Next: ${nodeTitle(nextLesson.node)}`
    label = 'Start lesson'
    to = nodeHref(nextLesson.node)
  } else if (nextLesson) {
    // A whole locked tier (Real-World Money before Money Basics is done) has no "earlier units" in it.
    line = tierLocked ? `Finish ${getTier(1).name} first.` : 'Finish the earlier units first.'
    label = 'Back to path'
    to = '/learn'
  } else if (quizReady && quiz) {
    line = 'Lessons done. The unit quiz is next.'
    label = 'Take the quiz'
    to = nodeHref(quiz.node)
  } else if (items.length > 0 && items.every((i) => i.status === 'done')) {
    line = 'You finished this unit.'
    label = 'Back to path'
    to = '/learn'
  } else {
    line = 'Go back to the path to keep going.'
    label = 'Back to path'
    to = '/learn'
  }

  return (
    <div className={styles.next}>
      <p className={styles.nextLine}>{line}</p>
      <Button color={unit.color} onClick={() => navigate(to)}>
        {label}
      </Button>
    </div>
  )
}

/* ---------------------------------------------------------------------------------- */

function MissingUnit() {
  const navigate = useNavigate()
  return (
    <div className={styles.screen}>
      <PageHeader title="Guidebook" back="/learn" />
      <Empty emoji="🗺️" title="Guidebook not found">
        We couldn't find that unit.
      </Empty>
      <div className={styles.next}>
        <Button onClick={() => navigate('/learn')}>Back to path</Button>
      </div>
    </div>
  )
}
