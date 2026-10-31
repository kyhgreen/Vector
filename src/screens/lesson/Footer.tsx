/*
  The bottom of the lesson: the Check / Continue button, which turns into the
  green or red feedback panel after you check an answer.
*/
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Puzzle, X } from 'lucide-react'
import { Button } from '../../components/Button'
import { Inline, RichText } from '../../components/RichText'
import { cx } from './exercises/ChoiceCard'
import styles from './lesson.module.css'

export interface FeedbackInfo {
  /** right = green, wrong = red, meh = matching that took a few tries (orange, no penalty). */
  tone: 'right' | 'wrong' | 'meh'
  title: string
  /** Shown after a miss. */
  answer?: string
  answerLabel?: string
  answerDetail?: string
  /** Feedback on the pick itself (a choice's why, a scenario's outcome). */
  why?: string
  whyLabel?: string
  explain?: string
  note?: string
}

export type FooterKind = 'teach' | 'question' | 'match'

export function Footer({
  kind,
  ready,
  feedback,
  onCheck,
  onContinue,
}: {
  kind: FooterKind
  ready: boolean
  feedback: FeedbackInfo | null
  onCheck: () => void
  onContinue: () => void
}) {
  const reduce = useReducedMotion()
  const tone = feedback?.tone

  return (
    <footer className={cx(styles.footer, tone === 'right' && styles.toneRight, tone === 'wrong' && styles.toneWrong, tone === 'meh' && styles.toneMeh)}>
      {/* Always mounted, so screen readers reliably hear the verdict when it changes. */}
      <p className="sr-only" role="status" aria-live="polite">
        {announce(feedback)}
      </p>
      <AnimatePresence mode="wait" initial={false}>
        {feedback ? (
          <motion.div
            key="feedback"
            className={styles.footerInner}
            initial={reduce ? { opacity: 0 } : { y: 70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 32 }}
          >
            <div className={styles.fbBody}>
              <div className={styles.fbHead}>
                <motion.span
                  className={styles.fbIcon}
                  initial={reduce ? false : { scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 16, delay: 0.05 }}
                  aria-hidden
                >
                  {feedback.tone === 'right' ? <Check size={24} strokeWidth={4} /> : feedback.tone === 'wrong' ? <X size={24} strokeWidth={4} /> : <Puzzle size={22} strokeWidth={3} />}
                </motion.span>
                <h2 className={styles.fbTitle}>{feedback.title}</h2>
              </div>
              <div className={styles.fbScroll}>
                {feedback.whyLabel && feedback.why && <WhyBlock label={feedback.whyLabel} text={feedback.why} />}
                {feedback.tone === 'wrong' && feedback.answer && (
                  <div className={styles.fbAnswer}>
                    <span className={styles.fbLabel}>{feedback.answerLabel ?? 'Correct answer:'}</span>
                    <span className={styles.fbAnswerText}>
                      <Inline text={feedback.answer} />
                    </span>
                    {feedback.answerDetail && <RichText text={feedback.answerDetail} className={styles.fbDetail} />}
                  </div>
                )}
                {!feedback.whyLabel && feedback.why && <WhyBlock text={feedback.why} />}
                {feedback.explain && <RichText text={feedback.explain} className={styles.fbExplain} />}
                {feedback.note && <p className={styles.fbNote}>{feedback.note}</p>}
              </div>
            </div>
            <Button
              color={feedback.tone === 'wrong' ? 'red' : feedback.tone === 'meh' ? 'orange' : 'green'}
              className={styles.actionBtn}
              onClick={onContinue}
              autoFocus
            >
              {feedback.tone === 'wrong' ? 'Got it' : 'Continue'}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="bar" className={styles.footerInner} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.05 } }}>
            {kind === 'teach' ? (
              <Button className={styles.actionBtn} onClick={onContinue}>
                Continue
              </Button>
            ) : kind === 'match' ? (
              <Button className={styles.actionBtn} disabled feedback={false}>
                Continue
              </Button>
            ) : (
              <Button className={cx(styles.actionBtn, ready && styles.actionReady)} disabled={!ready} onClick={onCheck} feedback={false}>
                Check
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  )
}

/** One plain sentence for screen readers: the verdict, the line, and the right answer after a miss. */
function announce(f: FeedbackInfo | null): string {
  if (!f) return ''
  const verdict = f.tone === 'right' ? 'Correct.' : f.tone === 'wrong' ? 'Incorrect.' : 'All matched.'
  const answer = f.tone === 'wrong' && f.answer ? ` ${f.answerLabel ?? 'Correct answer:'} ${f.answer.replace(/\*\*/g, '')}` : ''
  // Skip the line when it just repeats the verdict ("Correct. Correct.").
  return f.title === verdict ? `${verdict}${answer}` : `${verdict} ${f.title}${answer}`
}

function WhyBlock({ label, text }: { label?: string; text: string }) {
  return (
    <div className={styles.fbWhy}>
      {label && <span className={styles.fbLabel}>{label}</span>}
      <RichText text={text} />
    </div>
  )
}
