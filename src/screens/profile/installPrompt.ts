/*
  Install helpers for the Settings screen.

  Chrome and Edge fire "beforeinstallprompt" once, early, when the app can be
  installed. This module is loaded at startup (App imports the profile
  screens), so it catches that event and keeps it until Settings wants to
  show a real "Install" button. It never calls preventDefault, so the
  browser's own install UI keeps working exactly as before.
*/
import { useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
let justInstalled = false
let version = 0
const listeners = new Set<() => void>()

function emit() {
  version++
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    deferred = e as BeforeInstallPromptEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    justInstalled = true
    emit()
  })
  try {
    window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', emit)
  } catch {
    /* very old browsers: no live updates, which is fine */
  }
}

/** True when Vector is running as an installed app (home screen, Start menu, dock). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const mq = (q: string) => !!window.matchMedia?.(q).matches
    const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
    return iosStandalone || mq('(display-mode: standalone)') || mq('(display-mode: window-controls-overlay)') || mq('(display-mode: fullscreen)')
  } catch {
    return false
  }
}

export type Platform = 'ios' | 'android' | 'desktop'

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && (navigator.maxTouchPoints ?? 0) > 1)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** Live install status for React. */
export function useInstall() {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  )
  const installed = justInstalled || isStandalone()
  return {
    installed,
    canPrompt: !installed && deferred !== null,
    /** Opens the browser's install dialog. Resolves true if the player said yes. */
    async prompt(): Promise<boolean> {
      const ev = deferred
      if (!ev) return false
      deferred = null // the browser only lets each event prompt once
      emit()
      try {
        await ev.prompt()
        const choice = await ev.userChoice
        return choice?.outcome === 'accepted'
      } catch {
        return false
      }
    },
  }
}
