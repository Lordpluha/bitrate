import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { ThemeName } from '@/constants/theme'
import type { Locale } from '@/lib/i18n/locales'

export type ThemePreference = ThemeName | 'system'
type LocalePreference = Locale | 'system'

type PreferencesState = {
  theme: ThemePreference
  locale: LocalePreference
  setTheme: (theme: ThemePreference) => void
  setLocale: (locale: LocalePreference) => void
}

/** Device-local UI preferences, persisted across launches. */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      locale: 'system',
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'bitrate.preferences',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ theme, locale }) => ({ theme, locale }),
    },
  ),
)
