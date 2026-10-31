/*
  Sound effects, synthesized live with the Web Audio API. No audio files to
  download, so they work offline and add zero bytes to the app.

  Usage:  import { sfx } from '../lib/sound';  sfx.correct()
  Sounds respect the user's Sound setting (wired up in App.tsx).
*/

let enabled = true
let ctx: AudioContext | null = null

export function setSoundEnabled(on: boolean) {
  enabled = on
}

function audio(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

type Wave = OscillatorType

function tone(freq: number, start: number, dur: number, type: Wave = 'sine', vol = 0.18, slideTo?: number) {
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + start
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export const sfx = {
  /** Soft click for taps on choices and tiles. */
  tap() {
    tone(520, 0, 0.06, 'triangle', 0.08)
  },
  /** Happy two-note "ding-ding" for a right answer. */
  correct() {
    tone(880, 0, 0.14, 'sine', 0.16)
    tone(1318.5, 0.09, 0.22, 'sine', 0.16)
  },
  /** Low, gentle "bwomp" for a wrong answer. */
  wrong() {
    tone(220, 0, 0.28, 'sawtooth', 0.07, 150)
    tone(196, 0.02, 0.3, 'triangle', 0.1, 130)
  },
  /** A match in the matching game. */
  match() {
    tone(660, 0, 0.1, 'sine', 0.12)
    tone(990, 0.05, 0.12, 'sine', 0.1)
  },
  /** Coins landing. */
  coin() {
    tone(1568, 0, 0.08, 'square', 0.05)
    tone(2093, 0.07, 0.16, 'square', 0.05)
  },
  /** Little fanfare for finishing a lesson. */
  complete() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => tone(f, i * 0.1, 0.25, 'triangle', 0.14))
    tone(1318.5, 0.42, 0.45, 'sine', 0.12)
  },
  /** Losing a heart. */
  heartLost() {
    tone(392, 0, 0.12, 'triangle', 0.1, 330)
  },
  /** Badge unlocked / level up. */
  unlock() {
    ;[784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.18, 'sine', 0.12))
  },
}
