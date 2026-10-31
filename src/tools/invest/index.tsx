/*
  Practice Investing: a pretend stock market with made-up companies.
  Start with $10,000 of fake cash, buy stuff, skip ahead in time, and feel
  what risk is like without losing a real cent. Everything runs offline and
  is saved on the device through useToolState('invest').
*/
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { Sheet } from '../../components/Sheet'
import { EVENTS } from '../../state/badges'
import { useToolState } from '../../state/hooks'
import { useGame } from '../../state/store'
import { celebrate } from '../../lib/confetti'
import { haptic } from '../../lib/haptics'
import { money } from '../../lib/format'
import { sfx } from '../../lib/sound'
import { ASSET_BY_TICKER, type Ticker } from './assets'
import { AssetSheet, type TradeMode } from './AssetSheet'
import { pctPlain, units } from './fmt'
import { lessonsFor, recapFor } from './lessons'
import { MarketList, NewsFeed } from './Market'
import { DiversityCard, HoldingsCard, Hero, HowItWorks } from './Portfolio'
import { JUMPS, TimeMachine } from './TimeMachine'
import { INITIAL, START_CASH, advance, buy, change, freshState, portfolioValue, randomSeed, sanitize, sell } from './sim'
import { cx } from './parts'
import styles from './Invest.module.css'

const MARKET_ID = 'invest-market'
const NEWS_ID = 'invest-news'

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

export default function InvestTool() {
  const [raw, setRaw] = useToolState<unknown>('invest', INITIAL)
  const s = useMemo(() => sanitize(raw), [raw])
  const track = useGame((g) => g.track)
  const pushToast = useGame((g) => g.pushToast)

  const [sheet, setSheet] = useState<{ ticker: Ticker; mode: TradeMode; open: boolean; key: number }>({ ticker: 'TMIX', mode: 'buy', open: false, key: 0 })
  const [resetOpen, setResetOpen] = useState(false)
  const [heldDip, setHeldDip] = useState<number | null>(null)

  // Keep the latest state handy for the keyboard handler.
  const latest = useRef(s)
  useEffect(() => {
    latest.current = s
  }, [s])

  const openAsset = useCallback((ticker: Ticker, mode: TradeMode = 'buy') => {
    setSheet((p) => ({ ticker, mode, open: true, key: p.key + 1 }))
  }, [])
  const closeSheet = useCallback(() => setSheet((p) => ({ ...p, open: false })), [])

  const jump = useCallback(
    (days: number) => {
      const cur = latest.current
      const res = advance(cur, days)
      if (res.days === 0) return
      latest.current = res.state
      setRaw(res.state)
      const moved = change(res.after, res.before)
      if (moved > 0.0005) {
        sfx.coin()
        haptic.correct()
      } else if (moved < -0.0005) {
        sfx.heartLost()
        haptic.tap()
      } else {
        sfx.tap()
        haptic.tap()
      }
      if (res.firstHeldDip) {
        track(EVENTS.investHeldDip)
        setHeldDip(res.heldDip)
        celebrate('big')
        sfx.complete()
        haptic.celebrate()
      }
    },
    [setRaw, track],
  )

  const trade = useCallback(
    (ticker: Ticker, mode: TradeMode, dollars: number | 'all') => {
      const cur = latest.current
      const a = ASSET_BY_TICKER[ticker]
      const res = mode === 'buy' ? buy(cur, ticker, dollars === 'all' ? cur.cash : dollars) : sell(cur, ticker, dollars)
      if (!res.ok) {
        sfx.wrong()
        haptic.wrong()
        return
      }
      latest.current = res.state
      setRaw(res.state)
      setSheet((p) => ({ ...p, open: false }))
      sfx.coin()
      haptic.correct()
      track(EVENTS.investTrade)
      const amt = money(res.amount, { cents: Math.abs(res.amount - Math.round(res.amount)) >= 0.005 })
      pushToast({
        emoji: a.emoji,
        title:
          mode === 'buy'
            ? ticker === 'SAVE'
              ? `Put ${amt} in savings`
              : `Bought ${units(ticker, res.shares)} of ${a.short}`
            : `Sold ${amt} of ${a.short}`,
        tone: 'info',
      })
      if (res.firstDiversified) {
        track(EVENTS.investDiversified)
        celebrate('small')
        sfx.unlock()
      }
    },
    [setRaw, track, pushToast],
  )

  const reset = () => {
    setRaw(freshState(randomSeed(), s.flags))
    setResetOpen(false)
    setSheet((p) => ({ ...p, open: false }))
    sfx.complete()
    haptic.correct()
    pushToast({ emoji: '🌱', title: 'New market', body: `${money(START_CASH)} of pretend cash.`, tone: 'info' })
  }

  // Keyboard: 1-4 work the time machine on desktop (not while typing or in a pop-up).
  const busy = sheet.open || resetOpen || heldDip !== null
  useEffect(() => {
    if (busy) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return
      const j = JUMPS[Number(e.key) - 1]
      if (!j) return
      e.preventDefault()
      jump(j.days)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, jump])

  const recap = useMemo(() => recapFor(s), [s])
  const tip = useMemo(() => lessonsFor(s)[0], [s])
  const total = portfolioValue(s)
  const showDiversity = s.trades > 0 || total - s.cash > 0.01

  return (
    <div className={cx(styles.page, styles.tones)}>
      <Hero s={s} />
      {s.trades === 0 && <HowItWorks onShop={() => scrollTo(MARKET_ID)} />}
      <TimeMachine s={s} recap={recap} onJump={jump} onNews={() => scrollTo(NEWS_ID)} />

      {tip && (
        <p key={tip.id} className={styles.tip}>
          <span className={styles.tipEmoji} aria-hidden>
            {tip.emoji}
          </span>
          <span>
            <strong>{tip.title}.</strong> {tip.body}
          </span>
        </p>
      )}

      <HoldingsCard s={s} onOpen={(t) => openAsset(t, 'sell')} />
      {showDiversity && <DiversityCard s={s} />}
      <MarketList s={s} id={MARKET_ID} onOpen={(t) => openAsset(t, 'buy')} />
      <NewsFeed s={s} id={NEWS_ID} />

      <footer className={styles.footer}>
        <p className={styles.disclaimer}>Pretend money and made-up companies. Real investments can lose value.</p>
        <Button variant="outline" size="md" block={false} onClick={() => setResetOpen(true)}>
          Start over
        </Button>
      </footer>

      <AssetSheet s={s} ticker={sheet.ticker} open={sheet.open} mode={sheet.mode} openKey={sheet.key} onClose={closeSheet} onTrade={trade} />

      <Sheet open={resetOpen} onClose={() => setResetOpen(false)} title="Start over?">
        <div className={styles.sheetStack}>
          <p className={styles.sheetDetail}>
            This erases your {money(total)} portfolio and starts a new market with {money(START_CASH)}.
          </p>
          <Button color="red" onClick={reset}>
            Start over
          </Button>
          <Button variant="ghost" color="gray" onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet open={heldDip !== null} onClose={() => setHeldDip(null)} title="Steady Hands" emoji="🧘">
        <div className={styles.sheetStack}>
          <p className={styles.sheetDetail}>
            You held through a {pctPlain(heldDip ?? 0)} drop and reached a new high. Dips usually pass, though not always.
          </p>
          <Button color="blue" onClick={() => setHeldDip(null)}>
            Continue
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
