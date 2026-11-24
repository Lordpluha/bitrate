import type { ReactNode } from 'react'
import { type RefreshControlProps, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

/** Room the floating island needs at the bottom of a tab screen. */
const ISLAND_CLEARANCE = 66 + 18 + spacing['4']

type ScreenProps = {
  children: ReactNode
  /** Scrollable content (default) or a fixed, centred layout for states. */
  scroll?: boolean
  /** Leave space for the island under the content. */
  island?: boolean
  refreshControl?: React.ReactElement<RefreshControlProps>
}

/** A page: theme background, safe-area padding and the standard 16pt gutters. */
export function Screen({ children, scroll = true, island = false, refreshControl }: ScreenProps) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const padding = {
    paddingTop: insets.top + spacing['2'],
    paddingBottom: insets.bottom + (island ? ISLAND_CLEARANCE : spacing['6']),
  }

  if (!scroll) {
    return <View style={[styles.fixed, padding, { backgroundColor: colors.background }]}>{children}</View>
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, padding]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      style={{ backgroundColor: colors.background }}
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing['4'], gap: spacing['5'] },
  fixed: { flex: 1, paddingHorizontal: spacing['4'], gap: spacing['5'] },
})
