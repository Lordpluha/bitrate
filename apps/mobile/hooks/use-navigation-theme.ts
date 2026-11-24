import { DarkTheme, DefaultTheme, type Theme } from 'expo-router'

import { useTheme } from '@/hooks/use-theme'

/** React Navigation's theme painted with the active Bitrate roles (headers, modals, cards). */
export function useNavigationTheme(): Theme {
  const { colors, isDark } = useTheme()
  const base = isDark ? DarkTheme : DefaultTheme

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.destructive,
    },
  }
}
