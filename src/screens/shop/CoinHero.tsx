/*
  The coin balance at the top of the shop. The coin flips and a little
  "+20" / "-40" pops up whenever the balance changes.
*/
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useGame } from '../../state/store'
import { COINS } from '../../state/constants'
import { CoinIcon } from '../../components/icons'
import { coins0, coins2, safe } from './vaultMath'
import styles from './CoinHero.module.css'

const EARN = [
  { label: 'New lesson', amount: COINS.lessonFirstTime },
  { label: 'Quiz', amount: COINS.quizPass },
  { label: 'Daily goal', amount: COINS.dailyGoal },
  { label: 'Badge', amount: COINS.badge },
]

export function CoinHero({ onVault }: { onVault: () => void }) {
  const coins = Math.floor(safe(useGame((s) => s.coins)))
  const vault = safe(useGame((s) => s.vault.balance))
  const reduce = useReducedMotion()

  // Pop a "+N" or "-N" whenever the balance changes.
  const prev = useRef(coins)
  const [delta, setDelta] = useState<{ id: number; n: number } | null>(null)
  useEffect(() => {
    const d = coins - prev.current
    prev.current = coins
    if (!d) return
    setDelta({ id: Date.now(), n: d })
    const t = setTimeout(() => setDelta(null), 1400)
    return () => clearTimeout(t)
  }, [coins])

  return (
    <section className={styles.hero} aria-label="Your coins">
      <div className={styles.top}>
        <motion.span
          className={styles.coin}
          key={delta?.id ?? 'still'}
          initial={reduce || !delta ? false : { rotateY: 0 }}
          animate={reduce || !delta ? undefined : { rotateY: 360 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          aria-hidden
        >
          <CoinIcon size={52} />
        </motion.span>
        <span className={styles.number} aria-hidden>
          {coins0(coins)}
        </span>
        <span className={styles.unit} aria-hidden>
          {coins === 1 ? 'coin' : 'coins'}
        </span>
        <span className="sr-only" aria-live="polite">
          {coins0(coins)} {coins === 1 ? 'coin' : 'coins'}
        </span>
        <AnimatePresence>
          {delta && (
            <motion.span
              key={delta.id}
              className={delta.n > 0 ? styles.deltaUp : styles.deltaDown}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -12 }}
              transition={{ duration: 0.25 }}
              aria-hidden
            >
              {delta.n > 0 ? '+' : '-'}
              {coins0(Math.abs(delta.n))}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <ul className={styles.earn} aria-label="Ways to earn coins">
        {EARN.map((e) => (
          <li key={e.label}>
            {e.label} <strong>+{e.amount}</strong>
          </li>
        ))}
      </ul>

      {vault > 0 && (
        <button type="button" className={styles.vaultLink} onClick={onVault}>
          Plus <strong>{coins2(vault)}</strong> saved in the vault
        </button>
      )}
    </section>
  )
}
