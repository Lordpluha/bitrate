import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Icon } from '@/components/ui/icon'
import { brandColors, radius, spacing } from '@/constants/theme'

/** The Bitrate mark: the brand gradient disc with a wave glyph, beside the wordmark. */
export function BrandMark() {
  return (
    <View accessibilityLabel="Bitrate" accessibilityRole="image" style={styles.row}>
      <LinearGradient
        colors={[brandColors.purple, brandColors.magenta]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.disc}
      >
        <Icon name="activity" size={18} tone="primaryForeground" />
      </LinearGradient>
      <ThemedText variant="heading">bitrate</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'], marginBottom: spacing['4'] },
  disc: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
})
