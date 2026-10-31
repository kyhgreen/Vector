/*
  Renders the tiny formatting used in lesson content:
    **bold**                → bold (colored with the current accent)
    lines starting "- "     → bullet list
    blank line              → new paragraph
*/
import { Fragment, type ReactNode } from 'react'
import styles from './RichText.module.css'

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>,
  )
}

const isBullet = (line: string) => /^\s*[-•]\s+/.test(line)

/** Splits a block into runs of plain lines and runs of bullet lines, so
    "Intro line:\n- one\n- two" renders as a sentence followed by a list. */
function runs(block: string): { list: boolean; lines: string[] }[] {
  const out: { list: boolean; lines: string[] }[] = []
  for (const line of block.split('\n')) {
    if (!line.trim()) continue
    const list = isBullet(line)
    const last = out[out.length - 1]
    if (last && last.list === list) last.lines.push(line)
    else out.push({ list, lines: [line] })
  }
  return out
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n/)
  return (
    <div className={[styles.rich, className].filter(Boolean).join(' ')}>
      {blocks.flatMap((block, bi) =>
        runs(block).map((run, ri) =>
          run.list ? (
            <ul key={`${bi}-${ri}`}>
              {run.lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*[-•]\s+/, ''))}</li>
              ))}
            </ul>
          ) : (
            <p key={`${bi}-${ri}`}>
              {run.lines.map((l, li) => (
                <Fragment key={li}>
                  {li > 0 && <br />}
                  {inline(l)}
                </Fragment>
              ))}
            </p>
          ),
        ),
      )}
    </div>
  )
}

/** Inline-only version (just **bold**), for one-line strings like prompts. */
export function Inline({ text }: { text: string }) {
  return <>{inline(text)}</>
}
