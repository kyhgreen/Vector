/*
  Step 1: the splash. The student wireframe's "VECTOR" screen with the dollar
  bill. Tapping the bill shows a short money fact and pops out a coin.
*/
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CoinIcon, Logo } from '../../components/icons'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { BILL_LINES } from './copy'
import { HEADING_ID } from './StepHeader'
import styles from './Splash.module.css'

export function Splash() {
  const reduce = useReducedMotion()
  const [line, setLine] = useState<number | null>(null)
  const [pokes, setPokes] = useState(0)
  const [flying, setFlying] = useState<{ id: number; x: number; spin: number }[]>([])
  const seq = useRef(0)
  const timers = useRef<number[]>([])
  const hideTimer = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      window.clearTimeout(hideTimer.current)
    },
    [],
  )

  const poke = () => {
    sfx.coin()
    haptic.tap()
    setPokes((p) => p + 1)
    setLine((l) => (l === null ? 0 : (l + 1) % BILL_LINES.length))
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setLine(null), 2800)
    if (!reduce) {
      const id = ++seq.current
      const x = Math.round(Math.random() * 140 - 70)
      const spin = Math.random() > 0.5 ? 360 : -360
      setFlying((f) => [...f.slice(-5), { id, x, spin }])
      timers.current.push(window.setTimeout(() => setFlying((f) => f.filter((c) => c.id !== id)), 900))
    }
  }

  const rise = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3, delay },
        }

  return (
    <div className={styles.splash}>
      <motion.div
        className={styles.art}
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <button type="button" className={styles.billBtn} onClick={poke} aria-label="Show a money fact">
          <motion.span
            key={pokes}
            className={styles.billWiggle}
            animate={pokes && !reduce ? { rotate: [0, 5, -4, 0] } : undefined}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <span className={styles.bill} aria-hidden>
              <span className={styles.billBorder} />
              <span className={`${styles.billText} ${styles.billTop}`}>VECTOR</span>
              <span className={`${styles.corner} ${styles.tl}`}>1</span>
              <span className={`${styles.corner} ${styles.tr}`}>1</span>
              <span className={styles.seal}>$</span>
              <span className={`${styles.corner} ${styles.bl}`}>1</span>
              <span className={`${styles.corner} ${styles.br}`}>1</span>
              <span className={`${styles.billText} ${styles.billBottom}`}>ONE DOLLAR</span>
            </span>
          </motion.span>
        </button>

        {flying.map((c) => (
          <motion.span
            key={c.id}
            className={styles.fly}
            aria-hidden
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6, rotate: 0 }}
            animate={{ x: c.x, y: -130, opacity: 0, scale: 1.15, rotate: c.spin }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          >
            <CoinIcon size={30} />
          </motion.span>
        ))}

        <div className={styles.quipWrap} aria-live="polite">
          <AnimatePresence mode="wait">
            {line !== null && (
              <motion.div
                key={`${line}-${pokes}`}
                className={styles.quip}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95, transition: { duration: 0.12 } }}
                transition={{ type: 'spring', stiffness: 600, damping: 26 }}
              >
                {BILL_LINES[line]}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className={styles.copy}>
        <motion.div className={styles.brand} {...rise(0.12)}>
          <Logo size={46} />
          <h1 id={HEADING_ID} tabIndex={-1} className={styles.wordmark}>
            vector
          </h1>
        </motion.div>
        <motion.p className={styles.pitch} {...rise(0.22)}>
          Learn to manage money, five minutes at a time.
        </motion.p>
      </div>
    </div>
  )
}
