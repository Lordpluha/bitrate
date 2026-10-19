'use client'

import { useCallback, useEffect, useState } from 'react'

/** Chromium's install event; not in the DOM lib types. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const isBeforeInstallPromptEvent = (
  event: Event,
): event is BeforeInstallPromptEvent =>
  'prompt' in event &&
  typeof event.prompt === 'function' &&
  'userChoice' in event &&
  event.userChoice instanceof Promise

/**
 * The browser's own "install this web app" prompt. `canInstall` stays false where the
 * browser does not offer one (Safari, Firefox) or once the app is installed.
 */
export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      if (!isBeforeInstallPromptEvent(event)) return
      event.preventDefault()
      setDeferredPrompt(event)
    }
    const onInstalled = () => setDeferredPrompt(null)

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    /** A prompt can be shown only once; after a dismissal the browser fires a new event later. */
    setDeferredPrompt(null)
  }, [deferredPrompt])

  return { canInstall: deferredPrompt !== null, install }
}
