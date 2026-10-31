/*
  The lesson path for one tier: a flat banner per unit, then round nodes that
  zig-zag down the screen. Tapping a node opens a small popover with a Start button.
*/
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { ArrowDown, ArrowUp, BookOpen, Check, Lock, Star, Trophy } from 'lucide-react'
import { isQuestion, type Unit } from '../../content/types'
import { Button } from '../../components/Button'
import { XP } from '../../state/constants'
import { useHearts, useNow } from '../../state/hooks'
import type { NodeStatus, PathItem } from '../../state/progress'
import { useGame } from '../../state/store'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { colorVars, nodeHref, nodeKicker, toPct } from './learnUtils'
import styles from './Path.module.css'

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

interface UnitGroup {
  unit: Unit
  items: PathItem[]
}

function groupByUnit(items: PathItem[]): UnitGroup[] {
  const groups: UnitGroup[] = []
  for (const item of items) {
    const last = groups[groups.length - 1]
    if (last && last.unit.id === item.node.unit.id) last.items.push(item)
    else groups.push({ unit: item.node.unit, items: [item] })
  }
  return groups
}

const STATUS_TEXT: Record<NodeStatus, string> = {
  done: 'Done',
  current: 'Up next',
  open: 'Open',
  locked: 'Locked',
}

/* ---------------------------------------------------------------------------------- */

export function TierPath({ items, lockedHint }: { items: PathItem[]; lockedHint?: string }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [jump, setJump] = useState<'up' | 'down' | null>(null)
  const [armed, setArmed] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const groups = useMemo(() => groupByUnit(items), [items])
  const current = items.find((i) => i.status === 'current')
  const currentId = current?.node.id ?? null

  // Tap anywhere outside the open node (or press Escape) to close its popover.
  useEffect(() => {
    if (!openId) return
    const onDown = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null
      const host = target?.closest('[data-node]')
      if (!host || host.getAttribute('data-node') !== openId) setOpenId(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const btn = rootRef.current?.querySelector<HTMLButtonElement>(`[data-node="${openId}"] [data-node-button]`)
      setOpenId(null)
      btn?.focus({ preventScroll: true })
    }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [openId])

  // On arrival, glide the current node into the middle of the screen (unless it's already comfortably visible).
  // The short delay lets the app shell finish its own scroll-to-top first.
  useEffect(() => {
    if (!currentId) return
    const t = setTimeout(() => {
      const row = rootRef.current?.querySelector<HTMLElement>(`[data-row="${currentId}"]`)
      if (!row) return
      const r = row.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      if (r.top >= 150 && r.bottom <= vh - 120) return
      row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    }, 320)
    return () => clearTimeout(t)
    // Only on mount: the Learn screen remounts this component when you switch tiers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The "jump back to your lesson" button waits a beat so it doesn't flash during the first auto-scroll.
  useEffect(() => {
    const t = setTimeout(() => setArmed(true), 1200)
    return () => clearTimeout(t)
  }, [])

  // Watch the current node; when it's off screen, offer a button that jumps back to it.
  useEffect(() => {
    if (!currentId || typeof IntersectionObserver === 'undefined') return
    const el = rootRef.current?.querySelector(`[data-row="${currentId}"]`)
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setJump(null)
        else setJump(entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0) ? 'up' : 'down')
      },
      { rootMargin: '-130px 0px -90px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [currentId])

  const scrollToCurrent = () => {
    if (!currentId) return
    const row = rootRef.current?.querySelector<HTMLElement>(`[data-row="${currentId}"]`)
    row?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    row?.querySelector<HTMLButtonElement>('[data-node-button]')?.focus({ preventScroll: true })
  }

  const showJump = armed && !!currentId && jump !== null

  return (
    <div ref={rootRef} className={styles.path}>
      {groups.map((g, gi) => (
        <UnitSection
          key={g.unit.id}
          group={g}
          flip={gi % 2 === 1}
          openId={openId}
          onToggle={(id) => setOpenId((cur) => (cur === id ? null : id))}
          lockedHint={lockedHint}
        />
      ))}

      <div className={styles.jumpDock}>
        <AnimatePresence>
          {showJump && current && (
            <motion.div
              key="jump"
              className={styles.jumpWrap}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            >
              <button
                type="button"
                className={styles.jump}
                style={colorVars(current.node.unit.color)}
                onClick={() => {
                  sfx.tap()
                  haptic.tap()
                  scrollToCurrent()
                }}
                aria-label="Jump to your next lesson"
                title="Jump to your next lesson"
              >
                {jump === 'up' ? <ArrowUp size={26} strokeWidth={3} /> : <ArrowDown size={26} strokeWidth={3} />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------------- */

function UnitSection({
  group,
  flip,
  openId,
  onToggle,
  lockedHint,
}: {
  group: UnitGroup
  flip: boolean
  openId: string | null
  onToggle: (id: string) => void
  lockedHint?: string
}) {
  const navigate = useNavigate()
  const { unit, items } = group
  const done = items.length > 0 && items.every((i) => i.status === 'done')
  const allLocked = items.every((i) => i.status === 'locked')
  const dir = flip ? -1 : 1
  const n = items.length
  const titleId = `unit-title-${unit.id}`

  return (
    <section className={styles.unit} style={colorVars(unit.color)} aria-labelledby={titleId}>
      <header className={styles.banner}>
        <div className={styles.bannerText}>
          <div className={styles.kicker}>
            Unit {unit.order}
            {done && (
              <>
                <Check size={14} strokeWidth={4} aria-hidden />
                <span className={styles.srOnly}>, done</span>
              </>
            )}
          </div>
          <h2 id={titleId} className={styles.bannerTitle}>
            {unit.title}
          </h2>
        </div>
        <button
          type="button"
          className={styles.guideBtn}
          onClick={() => {
            sfx.tap()
            haptic.tap()
            navigate(`/unit/${unit.id}`)
          }}
          aria-label={`Open the ${unit.title} guidebook`}
          title="Guidebook"
        >
          <BookOpen size={20} strokeWidth={2.5} aria-hidden />
          <span className={styles.guideLabel}>Guidebook</span>
        </button>
      </header>

      <div className={styles.track} style={{ ['--dir' as string]: dir } as CSSProperties}>
        <div className={cx(styles.deco, allLocked && styles.decoLocked)} aria-hidden>
          <span className={styles.decoEmoji}>{unit.emoji}</span>
        </div>
        {items.map((item, i) => {
          const off = n <= 1 ? 0 : Math.round(dir * Math.sin((Math.PI * i) / (n - 1)) * 1000) / 1000
          return (
            <PathRow
              key={item.node.id}
              item={item}
              off={off}
              open={openId === item.node.id}
              onToggle={() => onToggle(item.node.id)}
              lockedHint={lockedHint}
            />
          )
        })}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------------- */

function PathRow({ item, off, open, onToggle, lockedHint }: { item: PathItem; off: number; open: boolean; onToggle: () => void; lockedHint?: string }) {
  const { node, status } = item
  const isQuiz = node.kind === 'quiz'
  const size = isQuiz ? 86 : 72
  const reduce = useReducedMotion()
  const [scope, animate] = useAnimate<HTMLDivElement>()

  const title = node.kind === 'lesson' ? node.lesson.title : `${node.unit.title} quiz`
  const Icon = isQuiz ? Trophy : status === 'done' ? Check : status === 'locked' ? Lock : Star
  const iconSize = isQuiz ? 38 : 32

  const handleClick = () => {
    sfx.tap()
    if (status === 'locked') {
      haptic.wrong()
      if (!reduce && scope.current) void animate(scope.current, { x: [0, -8, 8, -6, 6, -3, 0] }, { duration: 0.42 })
    } else {
      haptic.tap()
    }
    onToggle()
  }

  return (
    <div
      className={cx(styles.row, status === 'current' && styles.rowCurrent, open && styles.rowOpen)}
      style={{ ['--off' as string]: off, ['--size' as string]: `${size}px` } as CSSProperties}
      data-node={node.id}
      data-row={node.id}
      data-current={status === 'current' ? 'true' : undefined}
    >
      <div className={styles.slot}>
        <motion.div
          className={styles.popIn}
          initial={reduce ? false : { scale: 0.4, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -24px 0px' }}
          transition={{ type: 'spring', stiffness: 520, damping: 22 }}
        >
          <div ref={scope} className={styles.shakeLayer}>
            {status === 'current' && (
              <>
                <span className={styles.halo} aria-hidden />
                <span className={styles.bubble} aria-hidden>
                  <span className={styles.bubbleInner}>{isQuiz ? 'Quiz' : 'Start'}</span>
                </span>
              </>
            )}
            <button
              type="button"
              data-node-button
              className={cx(
                styles.node,
                styles[status],
                isQuiz && styles.quiz,
                isQuiz && status === 'done' && styles.quizDone,
                open && styles.nodeOpen,
              )}
              aria-label={`${nodeKicker(node)}: ${title}. ${STATUS_TEXT[status]}.`}
              aria-expanded={open}
              onClick={handleClick}
            >
              <Icon size={iconSize} strokeWidth={status === 'done' && !isQuiz ? 4 : 2.5} fill={Icon === Star || Icon === Trophy ? 'currentColor' : 'none'} aria-hidden />
              {isQuiz && status === 'locked' && (
                <span className={styles.miniLock} aria-hidden>
                  <Lock size={13} strokeWidth={3} />
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <div className={styles.popWrap}>
        <AnimatePresence>{open && <NodePopover key="pop" item={item} lockedHint={lockedHint} />}</AnimatePresence>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------------- */

function NodePopover({ item, lockedHint }: { item: PathItem; lockedHint?: string }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const lessons = useGame((s) => s.lessons)
  const quizzes = useGame((s) => s.quizzes)
  const doubleUntil = useGame((s) => s.doubleXpUntil)
  const now = useNow(15_000)
  const { hearts, unlimited } = useHearts()

  const { node, status } = item
  const unit = node.unit
  const isQuiz = node.kind === 'quiz'
  const locked = status === 'locked'
  const doubled = doubleUntil > now.getTime()
  const mult = doubled ? 2 : 1

  // Move focus into the popover (for keyboards and screen readers), and make sure it's on screen.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const btn = el.querySelector<HTMLButtonElement>('button:not(:disabled)')
    ;(btn ?? el).focus({ preventScroll: true })
    const t = setTimeout(() => el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }), 140)
    return () => clearTimeout(t)
  }, [reduce])

  let title: string
  let desc: string
  const meta: string[] = []
  let action: string | null = null

  if (node.kind === 'lesson') {
    const rec = lessons[node.lesson.id]
    title = node.lesson.title
    desc = node.lesson.description
    if (status === 'done' && rec) {
      const times = Number.isFinite(rec.completions) ? Math.max(1, rec.completions) : 1
      meta.push(`Best ${toPct(rec.bestAccuracy)}%`, times === 1 ? 'played once' : times === 2 ? 'played twice' : `played ${times} times`)
      action = 'Practice again'
    } else if (!locked) {
      const questions = node.lesson.exercises.filter(isQuestion).length
      if (questions > 0) meta.push(questions === 1 ? '1 question' : `${questions} questions`)
      meta.push(`+${XP.lessonPerfectBonus * mult} XP if perfect`)
      action = `Start +${XP.lesson * mult} XP`
    }
  } else {
    const rec = quizzes[unit.id]
    const count = unit.quiz.exercises.length
    const pass = unit.quiz.passPercent ?? 70
    title = `${unit.title} quiz`
    desc = count > 0 ? `${count} questions. Score ${pass}% or higher to pass and earn the trophy.` : 'This quiz is not ready yet. Check back soon.'
    if (rec?.passed) {
      meta.push(`Best ${toPct(rec.bestScore)}%`)
      action = 'Retake quiz'
    } else {
      meta.push(`Worth ${XP.quizPass * mult} XP`)
      if (rec && rec.attempts > 0) meta.push(`best so far ${toPct(rec.bestScore)}%`)
      if (!locked) action = 'Take the quiz'
    }
    if (count === 0) action = null
  }
  if (doubled && !locked) meta.unshift('Double XP is on')

  const lockedText = lockedHint ?? (isQuiz ? "Finish this unit's lessons first." : 'Finish the lessons above first.')
  const showHeartsNote = node.kind === 'lesson' && !locked && !unlimited && hearts <= 0

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={`${nodeKicker(node)}: ${title}`}
      tabIndex={-1}
      className={cx(styles.pop, locked && styles.popLocked)}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.92, transition: { duration: 0.12 } }}
      transition={{ type: 'spring', stiffness: 620, damping: 32 }}
    >
      <span className={styles.popArrow} aria-hidden />
      <div className={styles.popKicker}>{nodeKicker(node)}</div>
      <h3 className={styles.popTitle}>{title}</h3>
      {desc && <p className={styles.popDesc}>{desc}</p>}

      {!locked && meta.length > 0 && <p className={styles.meta}>{meta.join(', ')}</p>}

      {showHeartsNote && <p className={styles.popNote}>Out of hearts. Practice earns one back, or wait for a refill.</p>}

      {locked ? (
        <>
          <p className={styles.lockedText}>{lockedText}</p>
          <Button color="gray" size="md" disabled icon={<Lock size={18} strokeWidth={3} />}>
            Locked
          </Button>
        </>
      ) : action ? (
        <Button
          size="md"
          className={styles.popBtn}
          style={{ ['--b' as string]: 'var(--text-on-color)', ['--bd' as string]: 'color-mix(in srgb, var(--text-on-color) 62%, var(--cd))' }}
          onClick={() => navigate(nodeHref(node))}
        >
          {action}
        </Button>
      ) : null}
    </motion.div>
  )
}
