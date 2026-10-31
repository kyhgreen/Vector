/*
  The "are you sure?" sheet for every purchase: price, what you have, what's
  left, plus a need-vs-want line and the opportunity cost of not stashing
  those coins in the Coin Vault instead.
*/
import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen } from 'lucide-react'
import { Sheet } from '../../components/Sheet'
import { Button } from '../../components/Button'
import { CoinIcon } from '../../components/icons'
import { COINS } from '../../state/constants'
import { coins0, opportunityValue } from './vaultMath'
import styles from './BuySheet.module.css'

export interface BuySheetProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  /** Big emoji above the title. Pass `art` instead to show a drawing. */
  emoji?: string
  /** A drawing (e.g. an avatar) shown above the line, in place of the emoji. */
  art?: ReactNode
  title: ReactNode
  /** The money-lesson line. */
  line: string
  price: number
  wallet: number
  vaultBalance: number
  /** Short label for the buy button, e.g. "Buy" or "Get it". */
  verb?: string
  /** Extra info under the line (e.g. what the item does). */
  children?: ReactNode
}

export function BuySheet({ open, onClose, onConfirm, emoji, art, title, line, price, wallet, vaultBalance, verb = 'Buy', children }: BuySheetProps) {
  const navigate = useNavigate()
  // The sheet stays on screen (and clickable) while it animates closed, so a
  // double tap or a second Enter would buy twice. One confirm per opening.
  const used = useRef(false)
  useEffect(() => {
    if (open) used.current = false
  }, [open])
  const confirmOnce = () => {
    if (used.current) return
    used.current = true
    onConfirm()
  }
  const have = Math.floor(Number.isFinite(wallet) ? wallet : 0)
  const short = Math.max(0, price - have)
  const canAfford = short === 0
  const grown = opportunityValue(price, vaultBalance, 30)
  const showCost = price > 0 && grown - price >= 1

  return (
    <Sheet open={open} onClose={onClose} emoji={art ? undefined : emoji} title={title}>
      {art && <div className={styles.art}>{art}</div>}
      <p className={styles.line}>{line}</p>
      {children}

      <dl className={styles.receipt}>
        <div className={styles.row}>
          <dt>Price</dt>
          <dd className={styles.amt}>
            <CoinIcon size={18} />
            {coins0(price)}
          </dd>
        </div>
        <div className={styles.row}>
          <dt>You have</dt>
          <dd className={styles.amt}>
            <CoinIcon size={18} />
            {coins0(have)}
          </dd>
        </div>
        {canAfford ? (
          <div className={`${styles.row} ${styles.total}`}>
            <dt>Left after</dt>
            <dd className={styles.amt}>
              <CoinIcon size={18} />
              {coins0(have - price)}
            </dd>
          </div>
        ) : (
          <div className={`${styles.row} ${styles.total} ${styles.shortRow}`}>
            <dt>You're short</dt>
            <dd className={styles.amt}>
              <CoinIcon size={18} />
              {coins0(short)}
            </dd>
          </div>
        )}
      </dl>

      {canAfford && showCost && (
        <p className={styles.cost}>
          Opportunity cost: if you put these coins in the vault instead, they would grow to about <strong>{coins0(grown)}</strong> in 30 days.
        </p>
      )}

      {canAfford ? (
        <>
          <Button color="green" onClick={confirmOnce} icon={<CoinIcon size={22} />} autoFocus>
            {verb} for {coins0(price)}
          </Button>
          <Button variant="ghost" color="gray" onClick={onClose}>
            Not now
          </Button>
        </>
      ) : (
        <>
          <p className={styles.shortNote}>
            {short <= 2 * COINS.lessonFirstTime ? 'A couple of lessons should cover it.' : `Each new lesson earns ${COINS.lessonFirstTime} coins.`}
          </p>
          <Button
            color="blue"
            icon={<BookOpen size={20} strokeWidth={2.5} />}
            autoFocus
            onClick={() => {
              onClose()
              navigate('/learn')
            }}
          >
            Earn coins
          </Button>
          <Button variant="ghost" color="gray" onClick={onClose}>
            Maybe later
          </Button>
        </>
      )}
    </Sheet>
  )
}
