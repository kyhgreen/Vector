/* Shows toasts from the store (badge unlocks, etc.) and auto-dismisses them. */
import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { useGame } from '../state/store'
import { sfx } from '../lib/sound'
import { haptic } from '../lib/haptics'
import styles from './Toaster.module.css'

export function Toaster() {
  const toasts = useGame((s) => s.toasts)
  const dismiss = useGame((s) => s.dismissToast)
  const first = toasts[0]

  useEffect(() => {
    if (!first) return
    if (first.tone === 'badge') {
      sfx.unlock()
      haptic.celebrate()
    }
    const t = setTimeout(() => dismiss(first.id), 3800)
    return () => clearTimeout(t)
  }, [first, dismiss])

  return (
    <div className={styles.wrap} aria-live="polite">
      <AnimatePresence>
        {first && (
          <motion.button
            type="button"
            key={first.id}
            className={styles.toast}
            data-tone={first.tone ?? 'info'}
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={() => dismiss(first.id)}
          >
            <span className={styles.emoji}>{first.emoji}</span>
            <span className={styles.text}>
              <strong>{first.title}</strong>
              {first.body && <span>{first.body}</span>}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
