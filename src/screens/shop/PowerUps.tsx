/*
  Power-ups: Streak Freeze, Heart Refill, Double XP. Each row says why you
  can or can't buy it right now (maxed out, hearts full, already active, or
  short on coins), then a receipt sheet confirms the buy.
*/
import { useState, type ReactNode } from 'react'
import { Heart, Infinity as InfinityIcon, Lock, Snowflake } from 'lucide-react'
import { useGame } from '../../state/store'
import { useHearts, useNow } from '../../state/hooks'
import { DOUBLE_XP_MS, SHOP_ITEMS, type ShopItem } from '../../state/constants'
import { Button } from '../../components/Button'
import { CoinIcon } from '../../components/icons'
import { ProgressBar } from '../../components/ui'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { celebrate } from '../../lib/confetti'
import { pick } from '../../lib/random'
import { BuySheet } from './BuySheet'
import { ITEM_COLOR, ITEM_DESC, ITEM_LINES, REASON_TITLE, boughtToast } from './shopCopy'
import { clock, coins0, safe } from './vaultMath'
import styles from './PowerUps.module.css'

type ItemId = ShopItem['id']

interface ItemState {
  /** Why it can't be bought right now (not counting coins). */
  lock: null | { button: string; note: ReactNode }
  /** Small status next to the name: pips, hearts, "On". */
  badge: ReactNode
  /** Helpful line when nothing is blocking. */
  hint: ReactNode
  active?: { left: number; frac: number }
}

const EXTRA: Partial<Record<ItemId, string>> = {
  'streak-freeze': 'It is used automatically on the first day you miss.',
  'double-xp': 'The timer starts when you buy it.',
}

export function PowerUps() {
  const coins = Math.floor(safe(useGame((s) => s.coins)))
  const freezes = useGame((s) => s.streak.freezes)
  const doubleXpUntil = useGame((s) => s.doubleXpUntil)
  const vaultBalance = useGame((s) => s.vault.balance)
  const buyItem = useGame((s) => s.buyItem)
  const pushToast = useGame((s) => s.pushToast)
  const hearts = useHearts()
  const now = useNow(1000)

  const [sheet, setSheet] = useState<{ id: ItemId; line: string }>({ id: 'streak-freeze', line: '' })
  const [open, setOpen] = useState(false)

  const stateFor = (item: ShopItem): ItemState => {
    switch (item.id) {
      case 'streak-freeze': {
        const max = item.maxOwned ?? 2
        const pips = (
          <span className={styles.pips} role="img" aria-label={`${freezes} of ${max} equipped`}>
            {Array.from({ length: max }, (_, i) => (
              <Snowflake key={i} size={16} strokeWidth={2.75} className={i < freezes ? styles.pipOn : styles.pipOff} aria-hidden />
            ))}
          </span>
        )
        if (freezes >= max) return { lock: { button: 'At max', note: 'You have the most you can hold.' }, badge: pips, hint: null }
        return {
          lock: null,
          badge: pips,
          hint: freezes === 0 ? "You don't have any yet." : `You can hold ${max - freezes} more.`,
        }
      }
      case 'heart-refill': {
        const badge = hearts.unlimited ? (
          <span className={styles.heartBadge}>
            <Heart size={15} strokeWidth={2.75} fill="currentColor" aria-hidden />
            <InfinityIcon size={15} strokeWidth={2.75} aria-label="unlimited" />
          </span>
        ) : (
          <span className={styles.heartBadge} aria-label={`${hearts.hearts} of ${hearts.max} hearts`}>
            <Heart size={15} strokeWidth={2.75} fill="currentColor" aria-hidden />
            {hearts.hearts}/{hearts.max}
          </span>
        )
        if (hearts.unlimited) return { lock: { button: 'Not needed', note: 'Relaxed mode is on, so hearts are unlimited.' }, badge, hint: null }
        if (hearts.hearts >= hearts.max) return { lock: { button: 'Full', note: 'Your hearts are already full.' }, badge, hint: null }
        return { lock: null, badge, hint: `Or wait ${clock(hearts.nextInMs)} for a free one.` }
      }
      case 'double-xp': {
        // `now` can be up to a second old right after a buy, which showed "15:01".
        const left = Math.max(0, safe(doubleXpUntil) - Math.max(now.getTime(), Date.now()))
        if (left > 0) {
          return {
            lock: { button: 'Active', note: `${clock(left)} left.` },
            badge: <span className={styles.activeBadge}>On</span>,
            hint: null,
            active: { left, frac: Math.min(1, left / DOUBLE_XP_MS) },
          }
        }
        return { lock: null, badge: null, hint: 'Best used right before you do several lessons.' }
      }
    }
  }

  const openSheet = (id: ItemId) => {
    setSheet({ id, line: pick(ITEM_LINES[id]) })
    setOpen(true)
  }

  const confirm = () => {
    const item = SHOP_ITEMS.find((i) => i.id === sheet.id)
    if (!item) return
    const r = buyItem(item.id)
    setOpen(false)
    if (r.ok) {
      sfx.coin()
      haptic.correct()
      celebrate('small')
      const t = boughtToast(item.id, useGame.getState().streak.freezes, item.maxOwned ?? 2)
      pushToast({ emoji: item.emoji, title: t.title, body: t.body, tone: 'coins' })
    } else {
      sfx.wrong()
      haptic.wrong()
      pushToast({ emoji: '🤔', title: REASON_TITLE[r.reason], tone: 'warning' })
    }
  }

  const current = SHOP_ITEMS.find((i) => i.id === sheet.id) ?? SHOP_ITEMS[0]

  return (
    <>
      <ul className={styles.list}>
        {SHOP_ITEMS.map((item) => {
          const st = stateFor(item)
          const short = Math.max(0, item.price - coins)
          const canBuy = !st.lock && short === 0
          return (
            <li key={item.id} className={styles.row} style={{ ['--c' as string]: `var(--c-${ITEM_COLOR[item.id]})` }}>
              <span className={styles.emoji} aria-hidden>
                {item.emoji}
              </span>
              <div className={styles.text}>
                <h3 className={styles.name}>
                  <span>{item.name}</span>
                  {st.badge}
                </h3>
                <p className={styles.desc}>{ITEM_DESC[item.id]}</p>

                {st.active && (
                  <div className={styles.timer}>
                    <ProgressBar value={st.active.frac} color="orange" height={10} label="Double XP time left" />
                  </div>
                )}

                <div className={styles.foot}>
                  <p className={[styles.note, !st.lock && short > 0 && styles.noteWarn].filter(Boolean).join(' ')}>
                    {st.lock ? (
                      st.lock.note
                    ) : short > 0 ? (
                      <>
                        <Lock size={14} strokeWidth={2.75} aria-hidden />
                        {coins0(short)} {short === 1 ? 'coin' : 'coins'} short
                      </>
                    ) : (
                      st.hint
                    )}
                  </p>
                  <Button
                    size="md"
                    block={false}
                    color={canBuy ? 'green' : 'gray'}
                    disabled={!canBuy}
                    icon={st.lock ? undefined : <CoinIcon size={20} />}
                    onClick={() => openSheet(item.id)}
                    aria-label={st.lock ? `${item.name}: ${st.lock.button}` : `Buy ${item.name} for ${item.price} coins`}
                    className={styles.price}
                  >
                    {st.lock ? st.lock.button : coins0(item.price)}
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <BuySheet
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        emoji={current.emoji}
        title={`Buy ${current.name}?`}
        line={sheet.line}
        price={current.price}
        wallet={coins}
        vaultBalance={vaultBalance}
      >
        {EXTRA[current.id] && <p className={styles.extra}>{EXTRA[current.id]}</p>}
      </BuySheet>
    </>
  )
}
