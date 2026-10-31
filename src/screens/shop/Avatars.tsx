/*
  Avatar closet. Owned avatars equip with one tap; the rest show a price and
  open the receipt sheet. Buying one equips it right away.
*/
import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useGame } from '../../state/store'
import { AVATARS, type AvatarItem } from '../../state/constants'
import { CoinIcon } from '../../components/icons'
import { Avatar } from '../../components/Avatar'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { celebrate } from '../../lib/confetti'
import { pick } from '../../lib/random'
import { BuySheet } from './BuySheet'
import { AVATAR_LINES, REASON_TITLE } from './shopCopy'
import { coins0, safe } from './vaultMath'
import styles from './Avatars.module.css'

export function Avatars() {
  const coins = Math.floor(safe(useGame((s) => s.coins)))
  const owned = useGame((s) => s.ownedAvatars)
  const current = useGame((s) => s.profile.avatar)
  const vaultBalance = useGame((s) => s.vault.balance)
  const setAvatar = useGame((s) => s.setAvatar)
  const buyAvatar = useGame((s) => s.buyAvatar)
  const pushToast = useGame((s) => s.pushToast)
  const reduce = useReducedMotion()

  const [target, setTarget] = useState<{ item: AvatarItem; line: string }>({ item: AVATARS[0], line: '' })
  const [open, setOpen] = useState(false)
  const [pop, setPop] = useState(0)

  const ownedCount = AVATARS.filter((a) => owned.includes(a.id)).length
  const currentItem = AVATARS.find((a) => a.id === current)

  const onTile = (a: AvatarItem) => {
    if (a.id === current) {
      sfx.tap()
      return
    }
    if (owned.includes(a.id)) {
      setAvatar(a.id)
      sfx.match()
      haptic.tap()
      setPop((n) => n + 1)
      return
    }
    sfx.tap()
    setTarget({ item: a, line: pick(AVATAR_LINES) })
    setOpen(true)
  }

  const confirm = () => {
    const a = target.item
    const r = buyAvatar(a.id)
    setOpen(false)
    if (r.ok) {
      sfx.coin()
      haptic.celebrate()
      celebrate('small')
      setPop((n) => n + 1)
      pushToast({ emoji: '🛍️', title: `${a.name} is yours`, body: 'You are wearing it now.', tone: 'coins' })
    } else {
      sfx.wrong()
      haptic.wrong()
      pushToast({ emoji: '🤔', title: r.reason === 'coins' ? REASON_TITLE.coins : REASON_TITLE.owned, tone: 'warning' })
    }
  }

  return (
    <>
      <div className={styles.wearing}>
        <motion.span
          key={pop}
          className={styles.wearingFace}
          initial={pop && !reduce ? { scale: 0.7 } : false}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          aria-hidden
        >
          <Avatar id={currentItem?.id} size={60} />
        </motion.span>
        <div className={styles.wearingText}>
          <span className={styles.kicker}>You're wearing</span>
          <strong className={styles.wearingName}>{currentItem?.name ?? AVATARS[0].name}</strong>
          <span className={styles.count}>
            {ownedCount} of {AVATARS.length} collected
          </span>
        </div>
      </div>

      <ul className={styles.grid}>
        {AVATARS.map((a) => {
          const isOwned = owned.includes(a.id)
          const isOn = a.id === current
          const short = Math.max(0, a.price - coins)
          const label = isOn ? `${a.name}, wearing` : isOwned ? `${a.name}, owned, tap to wear` : `${a.name}, ${a.price} coins${short ? `, ${short} short` : ''}`
          return (
            <li key={a.id}>
              <button
                type="button"
                className={[styles.tile, isOn && styles.tileOn, !isOwned && short > 0 && styles.tilePoor].filter(Boolean).join(' ')}
                onClick={() => onTile(a)}
                aria-pressed={isOwned ? isOn : undefined}
                aria-label={label}
              >
                <Avatar id={a.id} size={56} className={styles.face} />
                <span className={styles.name}>{a.name}</span>
                <span className={styles.foot} aria-hidden>
                  {isOn ? (
                    <span className={styles.onLabel}>Wearing</span>
                  ) : isOwned ? (
                    <span className={styles.ownedLabel}>Wear</span>
                  ) : (
                    <span className={styles.priceLabel}>
                      <CoinIcon size={16} />
                      {coins0(a.price)}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <BuySheet
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        art={<Avatar id={target.item.id} size={88} />}
        title={`Get ${target.item.name}?`}
        line={target.line}
        price={target.item.price}
        wallet={coins}
        vaultBalance={vaultBalance}
        verb="Get it"
      >
        <p className={styles.sheetNote}>You keep it for good, and it goes on your profile right away.</p>
      </BuySheet>
    </>
  )
}
