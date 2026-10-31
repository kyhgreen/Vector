/* The market list and the news feed. */
import { useState } from 'react'
import { Button } from '../../components/Button'
import { Segmented } from '../../components/ui'
import { ASSETS, ASSET_BY_TICKER, type Ticker } from './assets'
import { jumpWord, newsDay, price } from './fmt'
import { AssetIcon, CardHead, Change, cx, tagLine } from './parts'
import { change, type InvestState } from './sim'
import styles from './Invest.module.css'

export function MarketList({ s, onOpen, id }: { s: InvestState; onOpen: (t: Ticker) => void; id?: string }) {
  const j = s.lastJump
  return (
    <section className={cx(styles.section, styles.divided)}>
      <CardHead id={id} title="Fakeland market" right={j ? <span className={styles.headNote}>Change {jumpWord(j.days)}</span> : undefined} />
      <div className={styles.rows}>
        {ASSETS.map((a, i) => {
          const p = s.prices[i] ?? a.start
          const owned = !!s.holdings[a.ticker]
          const c = j ? change(p, j.prices[i] ?? p) : 0
          return (
            <button
              key={a.ticker}
              type="button"
              className={cx(styles.row, styles.rowBtn, styles.marketRow)}
              onClick={() => onOpen(a.ticker)}
              aria-label={`${a.name}, ${a.kind}, ${price(p)}${owned ? ', you own some' : ''}. Open details.`}
            >
              <AssetIcon asset={a} />
              <div className={styles.rowMain}>
                <span className={styles.rowName}>
                  {a.name}
                  {owned && <span className={styles.owned}>yours</span>}
                </span>
                <span className={styles.blurb}>{a.blurb}</span>
                <span className={styles.rowSub}>{tagLine(a)}</span>
              </div>
              <div className={styles.rowRight}>
                <span className={styles.rowValue}>{price(p)}</span>
                {j && <Change value={c} />}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

const PAGE = 6

export function NewsFeed({ s, id }: { s: InvestState; id?: string }) {
  const [filter, setFilter] = useState<'all' | 'mine'>('all')
  const [more, setMore] = useState(false)
  const ownsAny = Object.keys(s.holdings).length > 0
  const mode = ownsAny ? filter : 'all'
  const items = mode === 'mine' ? s.news.filter((n) => n.ticker && s.holdings[n.ticker]) : s.news
  const shown = more ? items : items.slice(0, PAGE)
  const freshAfter = s.lastJump?.fromDay ?? s.day

  return (
    <section className={cx(styles.section, styles.divided)}>
      <CardHead id={id} title="Fakeland news" />
      {ownsAny && s.news.length > 0 && (
        <div className={styles.newsFilter}>
          <Segmented
            value={mode}
            onChange={(v) => {
              setFilter(v)
              setMore(false)
            }}
            options={[
              { value: 'all', label: 'All' },
              { value: 'mine', label: 'Mine' },
            ]}
          />
        </div>
      )}

      {items.length === 0 ? (
        <p className={styles.empty}>{s.news.length === 0 ? 'No news yet. Headlines show up as time passes.' : 'No news about what you own.'}</p>
      ) : (
        <ul className={styles.news}>
          {shown.map((n) => {
            const a = n.ticker ? ASSET_BY_TICKER[n.ticker] : null
            return (
              <li key={n.id} className={cx(styles.newsItem, n.day > freshAfter && styles.newsFresh)}>
                <span className={styles.newsEmoji} aria-hidden>
                  {n.emoji}
                </span>
                <div className={styles.newsMain}>
                  <p className={styles.newsText}>{n.text}</p>
                  <div className={styles.newsMeta}>
                    <span>
                      {newsDay(n.day, s.day)} · {a ? a.short : 'Whole market'}
                    </span>
                    {a && n.move !== 0 && <Change value={n.move} />}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {items.length > PAGE && (
        <div className={styles.moreRow}>
          <Button variant="ghost" color="blue" size="md" block={false} onClick={() => setMore((m) => !m)}>
            {more ? 'Show less' : `Show all ${items.length}`}
          </Button>
        </div>
      )}
    </section>
  )
}
