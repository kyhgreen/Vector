/*
  Coin Vault: a savings account for coins that teaches compound interest.
  Coins inside grow VAULT.dailyRatePct percent every day (on up to
  VAULT.interestCap coins), and the interest earns interest too. A projection
  and a small chart show where that leads, and the copy says plainly that
  real banks pay far less.
*/
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router'
import { ArrowDownToLine, ArrowUpFromLine, BookOpen } from 'lucide-react'
import { useGame } from '../../state/store'
import { useNow } from '../../state/hooks'
import { VAULT } from '../../state/constants'
import { Button } from '../../components/Button'
import { CoinIcon } from '../../components/icons'
import { ProgressBar, Segmented } from '../../components/ui'
import { LineChart } from '../../components/Charts'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { dayKey } from '../../lib/dates'
import { VAULT_EMPTY_LINE } from './shopCopy'
import { balanceAfter, coins0, coins2, dailyInterest, msToMidnight, projectCompound, projectSimple, roughTime, ruleOf72, safe } from './vaultMath'
import styles from './CoinVault.module.css'

type Mode = 'deposit' | 'withdraw'

const DAYS = 30
const EXAMPLE = 50
const RATE = VAULT.dailyRatePct
const X_LABELS = Array.from({ length: DAYS + 1 }, (_, d) => (d === 0 ? 'Today' : `Day ${d}`))

/** Axis ticks: whole numbers, a decimal for tiny values, "1.5K" for big ones. */
function tick(n: number): string {
  const a = Math.abs(n)
  if (a >= 10_000) return `${Math.round(n / 1000)}K`
  if (a >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  if (a < 10 && !Number.isInteger(n)) return n.toFixed(1)
  return String(Math.round(n))
}

const plural = (n: number) => (n === 1 ? 'coin' : 'coins')

export function CoinVault() {
  const navigate = useNavigate()
  const vault = useGame((s) => s.vault)
  const coins = Math.floor(safe(useGame((s) => s.coins)))
  const deposit = useGame((s) => s.vaultDeposit)
  const withdraw = useGame((s) => s.vaultWithdraw)
  const syncTime = useGame((s) => s.syncTime)
  const now = useNow(30_000)
  const reduce = useReducedMotion()

  // Settle any interest that piled up while the app was closed, and again
  // if the clock rolls past midnight while you're staring at the vault.
  const today = dayKey(now)
  useEffect(() => {
    syncTime()
  }, [syncTime, today])

  const [mode, setMode] = useState<Mode>('deposit')
  const [amount, setAmount] = useState(0)
  const [flash, setFlash] = useState<{ id: number; text: string } | null>(null)

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 3600)
    return () => clearTimeout(t)
  }, [flash])

  const balance = Math.max(0, safe(vault.balance))
  const interest = Math.max(0, safe(vault.totalInterest))
  const wholeInVault = Math.floor(balance)
  const available = mode === 'deposit' ? coins : wholeInVault

  const blocked: string | null =
    available <= 0
      ? mode === 'deposit'
        ? "You don't have any coins yet. Finish a lesson to earn some."
        : balance > 0
          ? 'There is less than 1 coin in the vault. You can only withdraw whole coins.'
          : 'The vault is empty.'
      : amount > available
        ? mode === 'deposit'
          ? `You only have ${coins0(coins)} ${plural(coins)}.`
          : `Only ${coins0(wholeInVault)} whole ${plural(wholeInVault)} in here.`
        : null
  const canGo = amount > 0 && !blocked

  const submit = () => {
    if (!canGo) {
      if (amount > 0) {
        sfx.wrong()
        haptic.wrong()
      }
      return
    }
    const n = amount
    const ok = mode === 'deposit' ? deposit(n) : withdraw(n)
    if (!ok) {
      sfx.wrong()
      haptic.wrong()
      return
    }
    sfx.coin()
    haptic.correct()
    setAmount(0)
    setFlash({
      id: Date.now(),
      text: mode === 'deposit' ? `Deposited ${coins0(n)} ${plural(n)}. They start earning interest at midnight.` : `Moved ${coins0(n)} ${plural(n)} back to your wallet.`,
    })
  }

  // The projection shows your balance, a live preview of the amount
  // you're typing, or an example if the vault is empty.
  const preview = canGo ? (mode === 'deposit' ? balance + amount : Math.max(0, balance - amount)) : null
  const base = preview ?? balance
  const isExample = base <= 0 && preview === null
  const projBase = isExample ? EXAMPLE : base
  const compound = useMemo(() => projectCompound(projBase, DAYS), [projBase])
  const simple = useMemo(() => projectSimple(projBase, DAYS), [projBase])
  const in7 = balanceAfter(projBase, 7)
  const in30 = compound[compound.length - 1]
  const tomorrow = dailyInterest(balance)
  const capped = balance >= VAULT.interestCap
  const emptied = preview !== null && preview <= 0

  const example = useMemo(() => {
    const r = 1 + RATE / 100
    return [100, 100 * r, 100 * r * r]
  }, [])
  const extra = example[2] - example[0] - 2 * (example[1] - example[0])

  return (
    <div className={styles.wrap}>
      {/* ---------- Balance ---------- */}
      <div className={styles.head}>
        <span className={styles.vaultEmoji} aria-hidden>
          🏦
        </span>
        <div className={styles.balanceBox}>
          <span className={styles.kicker}>In the vault</span>
          <span className={styles.balance}>
            <CoinIcon size={28} />
            <span aria-hidden>{coins2(balance)}</span>
            <span className="sr-only">{coins2(balance)} coins</span>
          </span>
          <span className={styles.sub}>{balance > 0 ? `${coins2(interest)} in interest so far` : VAULT_EMPTY_LINE}</span>
        </div>
      </div>

      {balance > 0 && (
        <div className={styles.status}>
          <p>
            Next payout: <strong>+{coins2(tomorrow)}</strong> in {roughTime(msToMidnight(now))}
          </p>
          <ProgressBar value={balance / VAULT.interestCap} color="green" height={10} label="Coins earning interest" />
          <p className={styles.capText}>
            {capped
              ? `Only the first ${coins0(VAULT.interestCap)} coins earn interest. Coins above that do not grow.`
              : `Earning interest on ${coins0(balance)} of up to ${coins0(VAULT.interestCap)} coins`}
          </p>
        </div>
      )}

      {/* ---------- Deposit / withdraw ---------- */}
      <div className={styles.controls}>
        <Segmented
          value={mode}
          onChange={(m) => {
            setMode(m)
            setAmount(0)
          }}
          options={[
            {
              value: 'deposit',
              label: (
                <span className={styles.segLabel}>
                  <ArrowDownToLine size={16} strokeWidth={2.75} aria-hidden /> Deposit
                </span>
              ),
            },
            {
              value: 'withdraw',
              label: (
                <span className={styles.segLabel}>
                  <ArrowUpFromLine size={16} strokeWidth={2.75} aria-hidden /> Withdraw
                </span>
              ),
            },
          ]}
        />

        <p className={styles.avail}>
          {mode === 'deposit' ? 'Wallet: ' : 'Can take out: '}
          <strong>
            {coins0(available)} {plural(available)}
          </strong>
        </p>

        <div className={[styles.amount, amount > 0 && !!blocked && styles.amountBad].filter(Boolean).join(' ')}>
          <CoinIcon size={24} />
          <input
            className={styles.amountInput}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            placeholder="0"
            aria-label={mode === 'deposit' ? 'Coins to deposit' : 'Coins to withdraw'}
            value={amount > 0 ? String(amount) : ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 7)
              setAmount(digits ? parseInt(digits, 10) : 0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
          />
          <span className={styles.amountUnit}>coins</span>
        </div>

        <div className={styles.chips} role="group" aria-label="Quick amounts">
          {[10, 50].map((v) => (
            <button
              key={v}
              type="button"
              className={[styles.chip, amount === v && styles.chipOn].filter(Boolean).join(' ')}
              disabled={available < v}
              onClick={() => {
                sfx.tap()
                setAmount(v)
              }}
            >
              {v}
            </button>
          ))}
          <button
            type="button"
            className={[styles.chip, amount > 0 && amount === available && styles.chipOn].filter(Boolean).join(' ')}
            disabled={available <= 0}
            onClick={() => {
              sfx.tap()
              setAmount(available)
            }}
          >
            All{available > 0 ? ` (${coins0(available)})` : ''}
          </button>
        </div>

        <Button
          color={mode === 'deposit' ? 'green' : 'blue'}
          disabled={!canGo}
          onClick={submit}
          icon={mode === 'deposit' ? <ArrowDownToLine size={20} strokeWidth={2.75} /> : <ArrowUpFromLine size={20} strokeWidth={2.75} />}
        >
          {mode === 'deposit' ? 'Deposit' : 'Withdraw'}
          {amount > 0 ? ` ${coins0(amount)}` : ''}
        </Button>

        <AnimatePresence mode="wait" initial={false}>
          {flash ? (
            <motion.p
              key={`f${flash.id}`}
              className={styles.flash}
              initial={{ opacity: 0, y: reduce ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
            >
              {flash.text}
            </motion.p>
          ) : blocked && (amount > 0 || available <= 0) ? (
            <motion.p key={`b${mode}`} className={styles.blocked} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {blocked}
            </motion.p>
          ) : null}
        </AnimatePresence>

        {mode === 'deposit' && available <= 0 && (
          <Button variant="outline" icon={<BookOpen size={18} strokeWidth={2.5} />} onClick={() => navigate('/learn')}>
            Start a lesson
          </Button>
        )}
      </div>

      {/* ---------- Projection ---------- */}
      <div className={styles.block}>
        <h3 className={styles.h3}>Projection</h3>
        <p className={styles.muted}>
          {isExample
            ? `If you deposited ${EXAMPLE} coins:`
            : emptied
              ? 'That empties the vault, so nothing will grow.'
              : preview !== null
                ? mode === 'deposit'
                  ? 'With this deposit:'
                  : 'After this withdrawal:'
                : 'If you leave it alone:'}
        </p>

        {!emptied && (
          <>
            <p className={styles.big}>
              <strong>{coins2(in30)}</strong> in 30 days
            </p>
            <p className={styles.muted}>{coins2(in7)} after a week</p>
            <div className={styles.chart}>
              <LineChart
                series={[
                  { name: 'With compounding', values: compound, area: true },
                  { name: 'Without compounding', values: simple, dashed: true },
                ]}
                xLabels={X_LABELS}
                format={tick}
                tooltipFormat={(n) => `${coins2(n)} coins`}
                height={190}
                ariaLabel={`Vault projection: ${coins2(projBase)} coins grows to ${coins2(in30)} in 30 days with compounding, or ${coins2(simple[simple.length - 1])} without.`}
              />
            </div>
            <p className={styles.small}>The gap between the two lines is interest earned on interest.</p>
          </>
        )}
      </div>

      {/* ---------- How it works ---------- */}
      <div className={styles.block}>
        <h3 className={styles.h3}>How it works</h3>
        <p>
          Coins in the vault grow <strong>{RATE}%</strong> a day. Each day, the {RATE}% is figured on the new, larger balance. Earning interest on interest is called <strong>compounding</strong>.
        </p>
        <p className={styles.ladder}>
          {coins2(example[0])} today <span aria-hidden>→</span> {coins2(example[1])} tomorrow <span aria-hidden>→</span> <strong>{coins2(example[2])}</strong> on day 2
        </p>
        <p className={styles.small}>
          That extra {coins2(extra)} is interest on interest. Only the first {coins0(VAULT.interestCap)} coins earn interest, which keeps coin totals reasonable.
        </p>
        <p>
          <strong>Rule of 72:</strong> divide 72 by the interest rate to estimate how long it takes money to double. Here, 72 ÷ {RATE} is about {ruleOf72(RATE)} days. At a bank paying 4% a year, about {ruleOf72(4)} years.
        </p>
        <p className={styles.small}>
          Real savings accounts pay a few percent a year, not {RATE}% a day. The vault uses a high rate so you can see compounding quickly.
        </p>
      </div>
    </div>
  )
}
