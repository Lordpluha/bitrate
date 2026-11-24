import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { radius, spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type TileProps = {
  children: ReactNode
  onPress?: () => void
  accessibilityLabel?: string
  /** Share a bento row with siblings instead of taking the full width. */
  flex?: boolean
}

/**
 * A bento tile — the unit screens are built from, so a later edit mode can reorder them.
 * Pressable when it has an action, otherwise a plain card.
 */
export function Tile({ children, onPress, accessibilityLabel, flex = false }: TileProps) {
  const { colors } = useTheme()
  const surface = [styles.tile, flex && styles.flex, { backgroundColor: colors.card, borderColor: colors.border }]

  if (!onPress) return <View style={surface}>{children}</View>

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [...surface, pressed && { backgroundColor: colors.backgroundHighlight }]}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing['3'],
    gap: spacing['2'],
    overflow: 'hidden',
  },
  flex: { flex: 1 },
})
