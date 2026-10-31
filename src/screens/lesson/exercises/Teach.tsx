/* A teaching card: emoji, title, body, optional example. Not graded. */
import { motion, useReducedMotion } from 'motion/react'
import type { TeachExercise } from '../../../content/types'
import { RichText } from '../../../components/RichText'
import { DocCard } from './DocCard'
import styles from './ex.module.css'

export function Teach({ ex }: { ex: TeachExercise }) {
  const reduce = useReducedMotion()
  return (
    <article className={styles.teach} aria-labelledby={`${ex.id}-title`}>
      <motion.div
        className={styles.teachEmoji}
        initial={reduce ? false : { scale: 0.5, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: -4, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 15, delay: 0.06 }}
        aria-hidden
      >
        {ex.emoji || (ex.funFact ? '🤯' : '💡')}
      </motion.div>
      {ex.funFact && <p className={styles.funFact}>Fun fact</p>}
      <h2 id={`${ex.id}-title`} className={styles.teachTitle}>
        {ex.title}
      </h2>
      <RichText text={ex.body} className={styles.teachBody} />
      {ex.doc && <DocCard doc={ex.doc} />}
      {ex.example && (
        <div className={styles.example}>
          <p className={styles.exampleLabel}>For example</p>
          <RichText text={ex.example} />
        </div>
      )}
    </article>
  )
}
