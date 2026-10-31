/*
  Peek inside one investment, then buy or sell it by dollar amount.
  Fractional shares are fine. You can never spend more cash than you have.
*/
import { useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { LineChart } from '../../components/Charts'
import { Sheet } from '../../components/Sheet'
import { Field, MoneyInput, Segmented } from '../../components/ui'
import { money } from '../../lib/format'
import { ASSET_BY_TICKER, type Asset, type Ticker } from './assets'
import { axisLabel, chartWindow, moneyTick, price, units } from './fmt'
import { Change, cx, tagLine } from './parts'
import { chartPoints, change, indexOf, portfolioValue, round2, type InvestState } from './sim'
import styles from './Invest.module.css'

export type TradeMode = 'buy' | 'sell'

const cents = (n: number) => money(n, { cents: true })
/** "$500" for round amounts, "$512.40" otherwise. */
const amountText = (n: number) => money(n, { cents: Math.abs(n - Math.round(n)) >= 0.005 })

export function AssetSheet({
  s,
  ticker,
  open,
  mode,
  openKey,
  onClose,
  onTrade,
}: {
  s: InvestState
  ticker: Ticker
  open: boolean
  mode: TradeMode
  /** Changes every time the sheet opens, so the form starts fresh. */
  openKey: number
  onClose: () => void
  onTrade: (t: Ticker, mode: TradeMode, dollars: number | 'all') => void
}) {
  const a = ASSET_BY_TICKER[ticker]
  return (
    <Sheet open={open} onClose={onClose} title={a.name} emoji={a.emoji}>
      <SheetBody key={`${ticker}:${openKey}`} s={s} a={a} startMode={mode} onTrade={onTrade} />
    </Sheet>
  )
}

function SheetBody({ s, a, startMode, onTrade }: { s: InvestState; a: Asset; startMode: TradeMode; onTrade: (t: Ticker, mode: TradeMode, dollars: number | 'all') => void }) {
  const i = indexOf(a.ticker)
  const p = s.prices[i] ?? a.start
  const h = s.holdings[a.ticker]
  const worth = h ? h.shares * p : 0
  const owned = !!h && h.shares > 0
  const [mode, setMode] = useState<TradeMode>(owned ? startMode : 'buy')
  const [amount, setAmount] = useState(0)
  const [all, setAll] = useState(false)

  const pts = chartPoints(s)
  const prices = pts.map((pt) => pt.p[i] ?? a.start)
  const w = chartWindow(prices)
  const sinceStart = change(p, a.start)

  return (
    <div className={cx(styles.tones, styles.sheet)}>
      <p className={styles.small}>{tagLine(a, a.kind)}</p>
      <p className={styles.sheetDetail}>{a.detail}</p>

      <dl className={styles.facts}>
        <div>
          <dt>Price</dt>
          <dd className={styles.factValue}>{price(p)}</dd>
        </div>
        <div>
          <dt>Since day 1</dt>
          <dd>{s.day === 0 ? 'No change yet' : <Change value={sinceStart} />}</dd>
        </div>
        <div>
          <dt>Growth</dt>
          <dd>{a.growthText}</dd>
        </div>
        <div>
          <dt>Swings</dt>
          <dd>{a.swingText}</dd>
        </div>
      </dl>

      {pts.length >= 2 && a.vol > 0 && (
        <div className={styles.chartBox}>
          <LineChart
            series={[{ name: 'Price', values: prices.map((v) => v - w.base), area: true }]}
            xLabels={pts.map((pt) => axisLabel(pt.d, s.day))}
            format={(n) => moneyTick(n + w.base)}
            tooltipFormat={(n) => price(n + w.base)}
            height={160}
            ariaLabel={`${a.name} price history. Now ${price(p)}.`}
          />
        </div>
      )}

      {owned && h && (
        <p className={styles.ownLine}>
          <span>
            You own {a.ticker === 'SAVE' ? cents(worth) : units(a.ticker, h.shares)}. Paid {cents(h.cost)}, now {cents(worth)}.
          </span>{' '}
          <Change value={change(worth, h.cost)} />
        </p>
      )}

      <TradeForm
        s={s}
        a={a}
        p={p}
        worth={worth}
        mode={mode}
        amount={amount}
        all={all}
        canSell={owned}
        onMode={(m) => {
          setMode(m)
          setAmount(0)
          setAll(false)
        }}
        onAmount={(n, isAll = false) => {
          setAmount(n)
          setAll(isAll)
        }}
        onSubmit={() => onTrade(a.ticker, mode, all ? 'all' : amount)}
      />
    </div>
  )
}

function TradeForm({
  s,
  a,
  p,
  worth,
  mode,
  amount,
  all,
  canSell,
  onMode,
  onAmount,
  onSubmit,
}: {
  s: InvestState
  a: Asset
  p: number
  worth: number
  mode: TradeMode
  amount: number
  all: boolean
  canSell: boolean
  onMode: (m: TradeMode) => void
  onAmount: (n: number, all?: boolean) => void
  onSubmit: () => void
}) {
  const h = s.holdings[a.ticker]
  const amt = Number.isFinite(amount) ? Math.max(0, amount) : 0
  const total = portfolioValue(s)
  let note = ''
  let error = false
  let valid = false

  if (mode === 'buy') {
    if (s.cash < 0.01) {
      note = "You're out of cash. Sell something first."
      error = true
    } else if (amt < 0.01) {
      note = 'Pick an amount. You can buy part of a share.'
    } else if (amt > s.cash + 0.001) {
      note = "That's more cash than you have."
      error = true
    } else {
      valid = true
      note =
        a.ticker === 'SAVE'
          ? `${amountText(amt)} into savings, at 4% a year.`
          : `That's ${units(a.ticker, amt / p)} at ${price(p)} each.`
      if (a.risk >= 4 && total > 0 && amt / total >= 0.5) note += " That's at least half your money on one risky pick."
    }
  } else {
    const sellAll = all || amt >= worth - 0.005
    if (!h) {
      note = "You don't own any of this."
      error = true
    } else if (!all && amt < 0.01) {
      note = 'Pick an amount, or sell it all.'
    } else if (!all && amt > worth + 0.005) {
      note = "That's more than you own."
      error = true
    } else {
      valid = true
      const sh = sellAll ? h.shares : amt / p
      const proceeds = sellAll ? worth : amt
      const gain = proceeds - h.cost * (sh / h.shares)
      note = a.ticker === 'SAVE' ? `${cents(proceeds)} goes back to cash.` : `That's ${units(a.ticker, sh)} for ${cents(proceeds)}.`
      if (gain >= 0.5) note += ` You lock in a ${money(gain)} profit.`
      else if (gain <= -0.5) note += ` You lock in a ${money(-gain)} loss.`
      if (s.dip && !s.dip.sold && a.ticker !== 'SAVE') note += ' Selling during a dip means you won\'t earn the Steady Hands badge.'
    }
  }

  const chips =
    mode === 'buy'
      ? [
          ...[100, 500, 1000].map((n) => ({ label: money(n), value: n, all: false, off: s.cash < n })),
          // The epsilon matters: 0.29 * 100 is 28.999..., which would leave a stray cent behind.
          { label: 'Max', value: Math.floor(s.cash * 100 + 1e-6) / 100, all: false, off: s.cash < 0.01 },
        ]
      : [
          { label: '25%', value: round2(worth * 0.25), all: false, off: worth < 0.04 },
          { label: '50%', value: round2(worth * 0.5), all: false, off: worth < 0.02 },
          // 'All' stays on for crumbs worth under a cent, so they can still be cleared out.
          { label: 'All', value: round2(worth), all: true, off: !h },
        ]

  const label =
    mode === 'buy'
      ? valid
        ? `Buy ${amountText(amt)}`
        : 'Buy'
      : all || (valid && amt >= worth - 0.005)
        ? 'Sell all'
        : valid
          ? `Sell ${amountText(amt)}`
          : 'Sell'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (valid) onSubmit()
  }

  return (
    <form className={styles.trade} onSubmit={submit} noValidate>
      {canSell && (
        <Segmented
          value={mode}
          onChange={onMode}
          options={[
            { value: 'buy', label: 'Buy' },
            { value: 'sell', label: 'Sell' },
          ]}
        />
      )}
      <Field
        label="Amount"
        hint={mode === 'buy' ? `You have ${cents(s.cash)} in cash` : `You have ${cents(worth)} of this`}
      >
        <MoneyInput value={all ? round2(worth) : amount} onChange={(n) => onAmount(n)} ariaLabel={mode === 'buy' ? 'Dollars to invest' : 'Dollars to sell'} />
      </Field>
      <div className={styles.chips} role="group" aria-label="Quick amounts">
        {chips.map((c) => {
          const on = c.all ? all : !all && amt > 0 && Math.abs(amt - c.value) < 0.005
          return (
            <button key={c.label} type="button" className={cx(styles.chip, on && styles.chipOn)} disabled={c.off} aria-pressed={on} onClick={() => onAmount(c.value, c.all)}>
              {c.label}
            </button>
          )
        })}
      </div>
      <p className={cx(styles.preview, error && styles.previewErr, valid && styles.previewOk)} aria-live="polite">
        {note}
      </p>
      <Button type="submit" color={mode === 'buy' ? 'green' : 'orange'} disabled={!valid}>
        {label}
      </Button>
    </form>
  )
}
