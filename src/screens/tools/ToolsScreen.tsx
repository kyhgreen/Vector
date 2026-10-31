import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { TOOLS } from '../../tools/registry'
import { sfx } from '../../lib/sound'
import styles from './ToolsScreen.module.css'

export default function ToolsScreen() {
  const navigate = useNavigate()
  return (
    <>
      <PageHeader title="Money tools" subtitle="Quick calculators for real money choices. Nothing leaves your device." />
      <ul className={styles.list}>
        {TOOLS.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className={styles.tool}
              onClick={() => {
                sfx.tap()
                navigate(`/tools/${t.id}`)
              }}
            >
              <span className={styles.icon} aria-hidden>
                {t.emoji}
              </span>
              <span className={styles.text}>
                <span className={styles.title}>{t.title}</span>
                <span className={styles.tagline}>{t.tagline}</span>
              </span>
              <ChevronRight className={styles.chev} size={22} strokeWidth={2.5} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
