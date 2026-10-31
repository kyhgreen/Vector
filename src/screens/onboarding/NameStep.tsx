/* Step 3: pick an avatar and a nickname. Both optional, both stay on the device. */
import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Dices } from 'lucide-react'
import { AVATARS } from '../../state/constants'
import { Avatar } from '../../components/Avatar'
import { sfx } from '../../lib/sound'
import { haptic } from '../../lib/haptics'
import { pick } from '../../lib/random'
import { NAME_MAX, NICKNAME_IDEAS } from './copy'
import { StepHeader } from './StepHeader'
import styles from './Steps.module.css'

export const FREE_AVATARS = AVATARS.filter((a) => a.price === 0)

interface Props {
  name: string
  avatar: string
  onName: (name: string) => void
  onAvatar: (id: string) => void
}

export function NameStep({ name, avatar, onName, onAvatar }: Props) {
  const reduce = useReducedMotion()
  const [rolls, setRolls] = useState(0)
  const shown = name.trim() || 'Money Rookie'
  const nearLimit = name.length >= NAME_MAX - 4

  const roll = () => {
    sfx.tap()
    haptic.tap()
    const options = NICKNAME_IDEAS.filter((n) => n !== name)
    onName(pick(options))
    setRolls((r) => r + 1)
  }

  return (
    <div className={styles.root}>
      <StepHeader title="What should we call you?" sub="A nickname is perfect. It stays on this device." />

      <div className={styles.avatarRow} role="group" aria-label="Pick an avatar">
        {FREE_AVATARS.map((a) => {
          const on = a.id === avatar
          return (
            <button
              key={a.id}
              type="button"
              data-choice
              aria-pressed={on}
              aria-label={a.name}
              className={`${styles.tile} ${styles.avatarTile} ${on ? styles.tileOn : ''}`}
              onClick={() => {
                sfx.tap()
                haptic.tap()
                onAvatar(a.id)
              }}
            >
              <Avatar id={a.id} size={52} />
            </button>
          )
        })}
      </div>

      <div className={styles.block}>
        <label htmlFor="onb-name" className="sr-only">
          Nickname
        </label>
        <div className={styles.nameBox}>
          <input
            id="onb-name"
            data-autofocus
            className={styles.nameInput}
            value={name}
            maxLength={NAME_MAX}
            placeholder="Your nickname"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck={false}
            enterKeyHint="next"
            onChange={(e) => onName(e.target.value.replace(/[\r\n\t]/g, '').slice(0, NAME_MAX))}
          />
          <button type="button" className={styles.dice} onClick={roll} aria-label="Random nickname" title="Random nickname">
            <motion.span
              key={rolls}
              className={styles.diceIcon}
              animate={rolls && !reduce ? { rotate: [0, 360] } : undefined}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Dices size={22} strokeWidth={2.25} />
            </motion.span>
          </button>
        </div>
        {nearLimit && (
          <span className={name.length >= NAME_MAX ? styles.countFull : styles.count}>
            {name.length}/{NAME_MAX}
          </span>
        )}
      </div>

      <div className={styles.preview} aria-label="Leaderboard preview">
        <Avatar id={avatar} size={42} />
        <span className={`${styles.previewName} ${name.trim() ? '' : styles.previewPlaceholder}`}>{shown}</span>
        <span className={styles.previewXp}>0 XP</span>
      </div>
    </div>
  )
}
