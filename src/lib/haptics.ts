/*
  Phone vibration for feedback. Works on Android; iPhones and desktops
  quietly ignore it, which is fine.
*/

let enabled = true

export function setHapticsEnabled(on: boolean) {
  enabled = on
}

function buzz(pattern: number | number[]) {
  if (!enabled || typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  try {
    navigator.vibrate(pattern)
  } catch {
    /* some browsers throw if the page hasn't been tapped yet */
  }
}

export const haptic = {
  tap: () => buzz(8),
  correct: () => buzz(20),
  wrong: () => buzz([40, 60, 40]),
  celebrate: () => buzz([30, 50, 30, 50, 60]),
}
