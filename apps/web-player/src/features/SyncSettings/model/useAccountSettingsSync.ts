'use client'

import { useEffect } from 'react'
import { useMeSettings } from '@/entities/Me'
import {
  fromServerStreamingQuality,
  useSettingsStore,
} from '@/entities/Settings'
import { useAuth } from '@/shared/hooks'
import { normalizeLocale } from '@/shared/i18n'

/**
 * Applies the account's saved preferences (`GET /me/settings`) to this browser after sign-in,
 * so language, audio quality and layout follow the listener between devices.
 */
export const useAccountSettingsSync = () => {
  const { isAuthenticated } = useAuth()
  const { data: settings } = useMeSettings(isAuthenticated)
  const hasHydrated = useSettingsStore((state) => state.hasHydrated)

  useEffect(() => {
    /** Waiting for the local copy keeps hydration from overwriting the account's values. */
    if (!settings || !hasHydrated) return
    const { setSetting } = useSettingsStore.getState()
    setSetting('language', normalizeLocale(settings.language))
    setSetting(
      'streamingQuality',
      fromServerStreamingQuality(settings.streamingQuality),
    )
    setSetting('compactLibrary', settings.compactLibrary)
    setSetting('nowPlayingPanel', settings.showNowPlaying)
  }, [hasHydrated, settings])
}
