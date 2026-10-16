'use client'

import type {
  SettingsKey,
  SettingsSnapshot,
} from '@/entities/Settings/model/settings.types'
import { createPersistedStore } from '@/shared/store'

/** Keys whose value is a boolean, so `toggleSetting` stays type-safe. */
type BooleanSettingsKey = {
  [TKey in SettingsKey]: SettingsSnapshot[TKey] extends boolean ? TKey : never
}[SettingsKey]

export type SettingsState = SettingsSnapshot & {
  hasHydrated: boolean
  setSetting: <TKey extends SettingsKey>(
    key: TKey,
    value: SettingsSnapshot[TKey],
  ) => void
  toggleSetting: (key: BooleanSettingsKey) => void
  hydrate: (snapshot: Partial<SettingsSnapshot>) => void
  reset: () => void
}

export const initialSettings: SettingsSnapshot = {
  compactLibrary: false,
  language: 'en',
  nowPlayingPanel: true,
  streamingQuality: 'Automatic',
}

/**
 * Device-level preferences; the account's copy (`/me/settings`) replaces them after sign-in.
 * Persistence is applied after mount by `useSettingsPersistence` so the server
 * and the first client render always agree on `initialSettings`.
 */
export const useSettingsStore = createPersistedStore<SettingsState>({
  name: 'settings',
  initializer: (set) => ({
    ...initialSettings,
    hasHydrated: false,
    setSetting: (key, value) => set({ [key]: value } as Partial<SettingsState>),
    toggleSetting: (key) =>
      set((state) => ({ [key]: !state[key] }) as Partial<SettingsState>),
    hydrate: (snapshot) =>
      set({ ...snapshot, hasHydrated: true } as Partial<SettingsState>),
    reset: () => set(initialSettings),
  }),
})

export const selectCompactLibrary = (state: SettingsState) =>
  state.compactLibrary

export const selectNowPlayingPanel = (state: SettingsState) =>
  state.nowPlayingPanel
