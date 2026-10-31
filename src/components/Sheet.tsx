/*
  Pop-ups. A Sheet slides up from the bottom on phones and appears as a
  centered dialog on big screens.

  <Sheet open={open} onClose={() => setOpen(false)} title="Out of hearts">
    ...content...
  </Sheet>

  Keyboard: focus moves into the sheet when it opens, Tab stays inside it,
  Escape closes it (if dismissable), and focus goes back where it was after.
  While it animates closed it ignores clicks, so a quick double tap can't
  press a button twice.
*/
import { AnimatePresence, motion, useIsPresent } from 'motion/react'
import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import styles from './Sheet.module.css'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  /** If false, tapping outside or pressing Escape does nothing. */
  dismissable?: boolean
  /** Big emoji above the title. */
  emoji?: string
}

export function Sheet(props: SheetProps) {
  return createPortal(<AnimatePresence>{props.open && <SheetPanel key="sheet" {...props} />}</AnimatePresence>, document.body)
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function SheetPanel({ onClose, title, children, dismissable = true, emoji }: SheetProps) {
  const isPresent = useIsPresent()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  // Remember what had focus BEFORE the sheet existed. This has to happen during
  // render: children's effects (an autofocused button inside the sheet) run
  // before ours and would already have moved focus.
  const returnTo = useRef<HTMLElement | null>(null)
  if (returnTo.current === null && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    returnTo.current = document.activeElement
  }

  useEffect(() => {
    if (!dismissable || !isPresent) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dismissable, isPresent, onClose])

  // Move focus in on open (unless something inside already grabbed it), and
  // put it back where it was once the sheet is gone.
  useEffect(() => {
    const panel = panelRef.current
    if (panel && !panel.contains(document.activeElement)) panel.focus({ preventScroll: true })
    return () => {
      const before = returnTo.current
      if (before && document.contains(before) && !panel?.contains(before)) before.focus({ preventScroll: true })
    }
  }, [])

  const trapTab = (e: ReactKeyboardEvent) => {
    const panel = panelRef.current
    if (e.key !== 'Tab' || !panel) return
    const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)]
    if (!items.length) {
      e.preventDefault()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      style={isPresent ? undefined : { pointerEvents: 'none' }}
      onKeyDown={trapTab}
    >
      <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={dismissable ? onClose : undefined} />
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        className={styles.panel}
        initial={{ y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      >
        {dismissable && (
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X size={22} strokeWidth={3} />
          </button>
        )}
        {emoji && <div className={styles.emoji}>{emoji}</div>}
        {title && (
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        )}
        <div className={styles.body}>{children}</div>
      </motion.div>
    </div>
  )
}
