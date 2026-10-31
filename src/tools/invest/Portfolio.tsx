/* The top of the page: your money, your stuff, and how spread out it is. */
import { Button } from '../../components/Button'
import { DonutChart, LineChart } from '../../components/Charts'
import { money, moneyShort } from '../../lib/format'
import { axisLabel, chartWindow, dayTitle, elapsed, moneySigned, moneyTick, pct, pctPlain, units } from './fmt'
import { DIVERSITY_LABELS, diversityLine, riskMix } from './lessons'
import { AssetIcon, CardHead, Change, colorVars, cx } from './parts'
import { START_CASH, change, chartPoints, diversity, holdingsList, portfolioValue, type InvestState } from './sim'
import type { Ticker } from './assets'
import styles from './Invest.module.css'

const dollars = (n: number) => money(n, { cents: true })

/* ---------- the big number + chart ---------- */

export function Hero({ s }: { s: InvestState }) {
  const total = portfolioValue(s)
  const gain = total - START_CASH
  const g = change(total, START_CASH)
  const invested = Math.max(0, total - s.cash)
  const pts = chartPoints(s)
  const vals = pts.map((p) => p.v)
  const w = chartWindow([...vals, START_CASH])

  return (
    <section className={styles.hero} aria-label="Your portfolio">
      <p className={styles.small}>{dayTitle(s.day)}</p>
      <p className={styles.heroValue}>{dollars(total)}</p>

      <p className={styles.heroSub}>
        {s.day === 0 ? (
          <span className={styles.muted}>{s.trades === 0 ? 'This is pretend cash for practice.' : 'Prices only move when you skip ahead.'}</span>
        ) : (
          <>
            <Change value={g}>
              {moneySigned(gain)} ({pct(g)})
            </Change>
            <span className={styles.muted}>in {elapsed(s.day)}</span>
          </>
        )}
      </p>

      {pts.length >= 2 ? (
        <div className={styles.chartBox}>
          <LineChart
            series={[
              { name: 'Your portfolio', values: vals.map((v) => v - w.base), area: true },
              { name: 'Where you started', values: vals.map(() => START_CASH - w.base), dashed: true, slot: 2 },
            ]}
            xLabels={pts.map((p) => axisLabel(p.d, s.day))}
            format={(n) => moneyTick(n + w.base)}
            tooltipFormat={(n) => money(n + w.base)}
            height={200}
            ariaLabel={`Portfolio value over ${elapsed(s.day)}. Now ${money(total)}, started at ${money(START_CASH)}.`}
          />
        </div>
      ) : (
        <p className={styles.chartEmpty}>Your chart starts once you skip ahead.</p>
      )}

      <dl className={styles.stats}>
        <div>
          <dt>Cash</dt>
          <dd>{money(s.cash)}</dd>
        </div>
        <div>
          <dt>Invested</dt>
          <dd>{money(invested)}</dd>
        </div>
        <div>
          <dt>Worst dip</dt>
          <dd>{s.worstDrop >= 0.005 ? `−${pctPlain(s.worstDrop)}` : 'None yet'}</dd>
        </div>
      </dl>
    </section>
  )
}

/* ---------- first visit ---------- */

export function HowItWorks({ onShop }: { onShop: () => void }) {
  return (
    <section className={styles.how}>
      <p>Buy a few things, then skip ahead to see how they do.</p>
      <Button color="blue" size="md" block={false} onClick={onShop}>
        Browse the market
      </Button>
    </section>
  )
}

/* ---------- holdings ---------- */

export function HoldingsCard({ s, onOpen }: { s: InvestState; onOpen: (t: Ticker) => void }) {
  const list = holdingsList(s)
  const total = portfolioValue(s)
  const cashShare = total > 0 ? s.cash / total : 1

  return (
    <section className={cx(styles.section, styles.divided)}>
      <CardHead title="What you own" />
      <div className={styles.rows}>
        <div className={styles.row}>
          <AssetIcon asset={{ emoji: '💵' }} />
          <div className={styles.rowMain}>
            <span className={styles.rowName}>Cash</span>
            <span className={styles.rowSub}>{s.cash < 0.01 ? 'All spent' : 'Earns 0%'}</span>
          </div>
          <div className={styles.rowRight}>
            <span className={styles.rowValue}>{dollars(s.cash)}</span>
            {list.length > 0 && <span className={styles.rowSub}>{pctPlain(cashShare)} of total</span>}
          </div>
        </div>

        {list.map((h) => (
          <button
            key={h.asset.ticker}
            type="button"
            className={cx(styles.row, styles.rowBtn)}
            onClick={() => onOpen(h.asset.ticker)}
            aria-label={`${h.asset.name}: worth ${dollars(h.value)}, ${h.gain >= 0 ? 'up' : 'down'} ${pctPlain(h.gainPct, 1)}. Open to buy or sell.`}
          >
            <AssetIcon asset={h.asset} />
            <div className={styles.rowMain}>
              <span className={styles.rowName}>{h.asset.name}</span>
              <span className={styles.rowSub}>
                {h.asset.ticker === 'SAVE' ? 'At 4% a year' : units(h.asset.ticker, h.shares)} · {moneySigned(h.gain)}
              </span>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.rowValue}>{dollars(h.value)}</span>
              <Change value={h.gainPct} />
            </div>
          </button>
        ))}
      </div>
      {list.length === 0 && <p className={styles.empty}>Just cash so far. Buy from the market below.</p>}
    </section>
  )
}

/* ---------- diversity ---------- */

export function DiversityCard({ s }: { s: InvestState }) {
  const d = diversity(s)
  const label = DIVERSITY_LABELS[d.level]
  const total = portfolioValue(s)

  return (
    <section className={cx(styles.section, styles.diversity)}>
      <CardHead title="Diversity meter" />
      <div className={styles.meter} role="meter" aria-label="How spread out your investments are" aria-valuemin={0} aria-valuemax={4} aria-valuenow={d.level} aria-valuetext={label.title}>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cx(styles.meterSeg, i <= d.level && styles.meterOn)} style={i <= d.level ? colorVars(label.color) : undefined} />
        ))}
      </div>
      <p className={styles.meterText}>
        <strong>{label.title}.</strong> {diversityLine(d)}
      </p>
      {d.invested > 0 && (
        <div className={styles.mix}>
          <span className={styles.mixTitle}>Your risk mix</span>
          <DonutChart segments={riskMix(s)} center={moneyShort(total)} sub="total" size={160} />
        </div>
      )}
    </section>
  )
}
