import type { ThemeName } from '@/constants/theme'

import type { ThemePreference } from './preferences-store'

type ResolveThemeNameInput = {
  preference: ThemePreference
  systemScheme: 'light' | 'dark' | null
}

/** `system` follows the OS appearance (dark when unknown); an explicit theme always wins. */
export function resolveThemeName({ preference, systemScheme }: ResolveThemeNameInput): ThemeName {
  if (preference !== 'system') return preference
  return systemScheme === 'light' ? 'light' : 'dark'
}
