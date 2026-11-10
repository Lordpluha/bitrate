'use client'

import { useEffect } from 'react'
import {
  type SettingsSnapshot,
  STREAMING_QUALITIES,
} from '@/entities/Settings/model/settings.types'
import {
  initialSettings,
  useSettingsStore,
} from '@/entities/Settings/model/settingsStore'
import { normalizeLocale, pickSupportedLocale } from '@/shared/i18n'

const STORAGE_KEY = 'bitrate-settings'

/**
 * The language for a visitor who never chose one: the browser's preferred language when the
 * app speaks it. Read after mount only, so the server render and hydration stay in English.
 */
const readBrowserLocale = () =>
  pickSupportedLocale(
    navigator.languages?.length ? navigator.languages : [navigator.language],
  ) ?? initialSettings.language

const readStoredSettings = (): Partial<SettingsSnapshot> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { language: readBrowserLocale() }

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return { language: readBrowserLocale() }
    }

    const stored = parsed as Record<string, unknown>
    const snapshot = Object.fromEntries(
      Object.keys(initialSettings)
        .filter((key) => key in stored)
        .map((key) => [key, stored[key]]),
    ) as Partial<SettingsSnapshot>

    const streamingQuality = STREAMING_QUALITIES.find(
      (quality) => quality === stored.streamingQuality,
    )
    return {
      ...snapshot,
      language:
        'language' in stored
          ? normalizeLocale(stored.language)
          : readBrowserLocale(),
      streamingQuality: streamingQuality ?? initialSettings.streamingQuality,
    }
  } catch {
    return {}
  }
}

const pickSnapshot = (state: SettingsSnapshot): SettingsSnapshot =>
  Object.fromEntries(
    Object.keys(initialSettings).map((key) => [
      key,
      state[key as keyof SettingsSnapshot],
    ]),
  ) as SettingsSnapshot

/**
 * Loads persisted settings after mount and mirrors later changes back to
 * localStorage. Mounted once, at the app provider level.
 */
export const useSettingsPersistence = () => {
  useEffect(() => {
    useSettingsStore.getState().hydrate(readStoredSettings())

    return useSettingsStore.subscribe((state) => {
      if (!state.hasHydrated) return

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pickSnapshot(state)))
      } catch {
        /** Storage can be unavailable (private mode, quota) — preferences stay in memory. */
      }
    })
  }, [])
}
