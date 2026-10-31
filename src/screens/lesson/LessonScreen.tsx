/*
  /lesson/:lessonId, /quiz/:unitId, and /practice all land here.

  The session is keyed by mode + id + attempt, so switching lessons (or hitting
  "Try again" on a quiz) always starts fresh instead of reusing old state.
*/
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { Button, IconButton } from '../../components/Button'
import { Empty } from '../../components/ui'
import { useGame } from '../../state/store'
import { EMPTY_PRACTICE } from './lessonCopy'
import { Player, accentVars } from './Player'
import { planSession, type Mode } from './session'
import styles from './lesson.module.css'

export default function LessonScreen({ mode }: { mode: Mode }) {
  const params = useParams()
  const id = mode === 'lesson' ? params.lessonId : mode === 'quiz' ? params.unitId : 'practice'
  const [attempt, setAttempt] = useState(0)
  return <Session key={`${mode}:${id ?? ''}:${attempt}`} mode={mode} id={id} onRetry={() => setAttempt((a) => a + 1)} />
}

function Session({ mode, id, onRetry }: { mode: Mode; id: string | undefined; onRetry: () => void }) {
  const navigate = useNavigate()
  // Planned once per session, from the save as it was when you tapped Start.
  const [outcome] = useState(() => planSession(mode, id, useGame.getState()))

  useEffect(() => {
    if (outcome.kind === 'redirect') navigate('/learn', { replace: true })
  }, [outcome, navigate])

  if (outcome.kind === 'redirect') return <div className={styles.screen} />
  if (outcome.kind === 'empty') return <EmptyPractice />
  return <Player plan={outcome.plan} onRetry={onRetry} />
}

function EmptyPractice() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const back = () => navigate('/learn', { replace: true })
  return (
    <div className={styles.screen} style={accentVars('teal')}>
      <header className={styles.top}>
        <div className={styles.topInner}>
          <IconButton label="Back to Learn" onClick={back} className={styles.quitBtn}>
            <X size={26} strokeWidth={3} />
          </IconButton>
        </div>
      </header>
      <main className={styles.main}>
        <motion.div
          className={styles.emptyWrap}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <Empty emoji="🧹" title={EMPTY_PRACTICE.title}>
            <p className={styles.emptyBody}>{EMPTY_PRACTICE.body}</p>
          </Empty>
        </motion.div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Button className={styles.actionBtn} onClick={back} autoFocus>
            Back to Learn
          </Button>
        </div>
      </footer>
    </div>
  )
}
