/* Counts a number up from 0 for the results screen. Never returns NaN. */
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

export function useCountUp(target: number, { duration = 900, delay = 0 }: { duration?: number; delay?: number } = {}): number {
  const safe = Number.isFinite(target) ? target : 0
  const reduce = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (reduce) return
    let raf = 0
    let start = 0
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min(1, (ts - start) / Math.max(1, duration))
      setValue(safe * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    const t = window.setTimeout(() => {
      raf = requestAnimationFrame(step)
    }, delay)
    return () => {
      window.clearTimeout(t)
      cancelAnimationFrame(raf)
    }
  }, [safe, duration, delay, reduce])

  return reduce ? safe : value
}
