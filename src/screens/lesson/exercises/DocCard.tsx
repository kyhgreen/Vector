/*
  A money document drawn as a piece of paper: a pay stub, a receipt, a bank
  or card statement, a loan or job offer, or a plain table. Each kind has its
  own look (see DocCard.module.css) so it reads like the real thing.

  For screen readers it's a figure named by its title, holding a definition
  list: each row is a term (the label) and its value.
*/
import { useId } from 'react'
import { Banknote, FileText, Landmark, Receipt, Table2, type LucideIcon } from 'lucide-react'
import type { Doc } from '../../../content/types'
import { cx } from './ChoiceCard'
import styles from './DocCard.module.css'

const ICONS: Record<Doc['kind'], LucideIcon> = {
  paystub: Banknote,
  receipt: Receipt,
  statement: Landmark,
  offer: FileText,
  table: Table2,
}

/** Long documents get tighter rows so the answer choices still fit. */
const DENSE_AFTER = 8

export function DocCard({ doc, className }: { doc: Doc; className?: string }) {
  const titleId = useId()
  const rows = Array.isArray(doc.rows) ? doc.rows : []
  const Icon = ICONS[doc.kind] ?? FileText
  return (
    <figure
      className={cx(styles.doc, styles[doc.kind], rows.length > DENSE_AFTER && styles.dense, className)}
      aria-labelledby={titleId}
    >
      <figcaption className={styles.head}>
        <Icon className={styles.icon} size={18} strokeWidth={2.25} aria-hidden />
        <span className={styles.headText}>
          <span id={titleId} className={styles.title}>
            {doc.title}
          </span>
          {doc.subtitle && <span className={styles.subtitle}>{doc.subtitle}</span>}
        </span>
      </figcaption>
      <dl className={styles.rows}>
        {rows.map((r, i) => (
          <div key={i} className={cx(styles.row, r.strong && styles.strong, r.indent && styles.indent)}>
            <dt className={styles.label}>{r.label ?? ''}</dt>
            <dd className={styles.value}>{r.value ?? ''}</dd>
          </div>
        ))}
      </dl>
      {doc.note && <p className={styles.note}>{doc.note}</p>}
    </figure>
  )
}
