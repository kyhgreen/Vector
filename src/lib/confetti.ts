/* Celebration confetti in brand colors. */
import confetti from 'canvas-confetti'

const COLORS = ['#1fb760', '#1e9bf0', '#ffc92e', '#ff5fa8', '#9b5cf6', '#ff9416']

export function celebrate(intensity: 'small' | 'big' = 'big') {
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const count = intensity === 'big' ? 160 : 60
  confetti({ particleCount: count, spread: 80, startVelocity: 45, origin: { y: 0.7 }, colors: COLORS, disableForReducedMotion: true, zIndex: 300 })
  if (intensity === 'big') {
    setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors: COLORS, zIndex: 300 }), 220)
    setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors: COLORS, zIndex: 300 }), 380)
  }
}
