/*
  The Shop (/shop): spend coins on power-ups and avatars, or stash them in
  the Coin Vault to learn how compound interest works.
*/
import { useEffect, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { Landmark, Smile, Zap } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { useGame } from '../../state/store'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { CoinHero } from './CoinHero'
import { PowerUps } from './PowerUps'
import { CoinVault } from './CoinVault'
import { Avatars } from './Avatars'
import styles from './ShopScreen.module.css'

const SECTIONS = [
  { id: 'shop-powerups', label: 'Power-ups', icon: Zap, color: 'orange' },
  { id: 'shop-vault', label: 'Vault', icon: Landmark, color: 'green' },
  { id: 'shop-avatars', label: 'Avatars', icon: Smile, color: 'purple' },
] as const

export default function ShopScreen() {
  const syncTime = useGame((s) => s.syncTime)
  const reduce = useReducedMotion()

  useEffect(() => {
    syncTime()
  }, [syncTime])

  const jump = (id: string) => {
    sfx.tap()
    haptic.tap()
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Shop" subtitle="Spend or save the coins you earn." />

      <CoinHero onVault={() => jump('shop-vault')} />

      <nav className={styles.jump} aria-label="Shop sections">
        {SECTIONS.map((s) => (
          <button key={s.id} type="button" className={styles.jumpBtn} style={{ ['--c' as string]: `var(--c-${s.color})` }} onClick={() => jump(s.id)}>
            <s.icon size={18} strokeWidth={2.5} aria-hidden />
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      <Section id="shop-powerups" title="Power-ups">
        <PowerUps />
      </Section>

      <Section id="shop-vault" title="Coin Vault" sub="Save coins and earn interest every day.">
        <CoinVault />
      </Section>

      <Section id="shop-avatars" title="Avatars" sub="Choose how you look in the app.">
        <Avatars />
      </Section>

      <p className={styles.footer}>Coins only exist in this app. You can't buy them with real money, and they have no cash value.</p>
    </div>
  )
}

function Section({ id, title, sub, children }: { id: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.secHead}>
        <h2 id={`${id}-title`} className={styles.secTitle}>
          {title}
        </h2>
        {sub && <p className={styles.secSub}>{sub}</p>}
      </header>
      {children}
    </section>
  )
}
