/*
  Tool registry. Each tool lives in its own folder with two files:
    tools/<id>/meta.ts    export const meta: ToolMeta = {...}
    tools/<id>/index.tsx  export default function MyTool() {...}
  Folders are discovered automatically. Nothing else to register.
*/
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { UnitColor } from '../content/types'

export interface ToolMeta {
  /** Must match the folder name. Also the key for useToolState(). */
  id: string
  title: string
  /** One playful line on the tool card. */
  tagline: string
  emoji: string
  color: UnitColor
  /** Sort order on the Tools screen (lower first). */
  order: number
}

export interface ToolEntry extends ToolMeta {
  Component: LazyExoticComponent<ComponentType>
}

const metas = import.meta.glob<{ meta: ToolMeta }>('./*/meta.ts', { eager: true })
const pages = import.meta.glob<{ default: ComponentType }>('./*/index.tsx')

export const TOOLS: ToolEntry[] = Object.entries(metas)
  .map(([path, m]) => {
    const loader = pages[path.replace(/meta\.ts$/, 'index.tsx')]
    return loader ? { ...m.meta, Component: lazy(loader) } : null
  })
  .filter((t): t is ToolEntry => !!t)
  .sort((a, b) => a.order - b.order)

export const getTool = (id: string) => TOOLS.find((t) => t.id === id)
