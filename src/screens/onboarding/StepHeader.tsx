/*
  The top of every question step: the Vector logo "talking" through a speech
  bubble (Duolingo style), plus an optional short line under it.
*/
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Logo } from '../../components/icons'
import styles from './Steps.module.css'

export const HEADING_ID = 'onboarding-heading'

export function StepHeader({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <div className={styles.header}>
      <div className={styles.mascotRow}>
        <motion.div
          className={styles.mascot}
          animate={reduce ? undefined : { rotate: [0, -6, 0] }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <Logo size={52} />
        </motion.div>
        <motion.div
          className={styles.bubble}
          initial={reduce ? false : { opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h1 id={HEADING_ID} tabIndex={-1} className={styles.title}>
            {title}
          </h1>
        </motion.div>
      </div>
      {sub && <p className={styles.sub}>{sub}</p>}
    </div>
  )
}
