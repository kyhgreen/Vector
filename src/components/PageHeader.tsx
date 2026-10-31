/*
  Header for inner screens: back arrow + title (+ optional right-side content).
  <PageHeader title="Budget Builder" back="/tools" />
*/
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import styles from './PageHeader.module.css'

export function PageHeader({ title, subtitle, back, right, emoji }: { title: ReactNode; subtitle?: ReactNode; back?: string | true; right?: ReactNode; emoji?: string }) {
  const navigate = useNavigate()
  return (
    <header className={styles.header}>
      {back && (
        <button type="button" className={styles.back} aria-label="Back" onClick={() => (back === true ? navigate(-1) : navigate(back))}>
          <ArrowLeft size={24} strokeWidth={3} />
        </button>
      )}
      <div className={styles.titles}>
        <h1 className={styles.title}>
          {emoji && <span className={styles.emoji}>{emoji}</span>}
          {title}
        </h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {right && <div className={styles.right}>{right}</div>}
    </header>
  )
}
