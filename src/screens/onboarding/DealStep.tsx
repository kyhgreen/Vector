/* Step 5: "Here's the deal." The three rules of the game, one short line each. */
import type { ReactNode } from 'react'
import { Flame, Heart } from 'lucide-react'
import { Toggle } from '../../components/ui'
import { XpIcon } from '../../components/icons'
import { COINS, HEART_REFILL_MS } from '../../state/constants'
import { StepHeader } from './StepHeader'
import styles from './Steps.module.css'

interface Props {
  name: string
  goal: number
  grownUp: boolean
  demo: boolean
  onDemo: (on: boolean) => void
}

export function DealStep({ name, goal, grownUp, demo, onDemo }: Props) {
  const nick = name.trim()

  return (
    <div className={styles.root}>
      <StepHeader
        title={nick ? `Here's the deal, ${nick}` : "Here's the deal"}
        sub={`You start with ${COINS.startingBalance} coins for the shop. Finishing lessons earns more.`}
      />

      <ul className={styles.rules}>
        <Rule icon={<XpIcon size={26} />} tone="yellow">
          Earn {goal} XP a day to hit your goal.
        </Rule>
        <Rule icon={<Flame size={24} strokeWidth={2.25} fill="currentColor" />} tone="orange">
          Do a lesson every day to keep your streak.
        </Rule>
        <Rule icon={<Heart size={24} strokeWidth={2.25} fill="currentColor" />} tone="red">
          Wrong answers cost a heart. One comes back every {Math.round(HEART_REFILL_MS / 60000)} minutes.
        </Rule>
      </ul>

      {grownUp && (
        <div className={styles.demo}>
          <Toggle checked={demo} onChange={onDemo} label="Demo mode" hint="Unlocks every lesson. Turn it off in Settings." />
        </div>
      )}
    </div>
  )
}

function Rule({ icon, tone, children }: { icon: ReactNode; tone: 'yellow' | 'orange' | 'red'; children: ReactNode }) {
  return (
    <li className={styles.rule}>
      <span className={`${styles.ruleIcon} ${styles[`tone_${tone}`]}`} aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </li>
  )
}
