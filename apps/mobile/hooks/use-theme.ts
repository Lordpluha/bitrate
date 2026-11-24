import { colorThemes, type ThemeColors, type ThemeName } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { usePreferencesStore } from '@/lib/preferences/preferences-store'
import { resolveThemeName } from '@/lib/preferences/resolve-theme-name'

export type Theme = {
  name: ThemeName
  colors: ThemeColors
  isDark: boolean
}

/** The active theme: the user's choice, or the OS appearance when they chose `system`. */
export function useTheme(): Theme {
  const preference = usePreferencesStore((state) => state.theme)
  const systemScheme = useColorScheme()
  const name = resolveThemeName({ preference, systemScheme })

  return { name, colors: colorThemes[name], isDark: name !== 'light' }
}
