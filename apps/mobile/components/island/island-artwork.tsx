import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, StyleSheet, View } from 'react-native'

import { Artwork } from '@/components/ui/artwork'
import { brandColors, radius } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'

type IslandArtworkProps = {
  uri: string | null
  title: string
  onPress: () => void
}

const RING_SIZE = 50

/** The playing artwork in the brand gradient ring (magenta → purple); opens Now Playing. */
export function IslandArtwork({ uri, title, onPress }: IslandArtworkProps) {
  const { colors } = useTheme()
  const { t } = useI18n()

  return (
    <Pressable accessibilityLabel={`${t('player.openNowPlaying')}: ${title}`} accessibilityRole="button" onPress={onPress}>
      <LinearGradient
        colors={[brandColors.magenta, brandColors.purple]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.ring}
      >
        <View style={[styles.inner, { backgroundColor: colors.card }]}>
          <Artwork round size={40} uri={uri} />
        </View>
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  ring: { width: RING_SIZE, height: RING_SIZE, borderRadius: radius.full, padding: 1 },
  inner: { flex: 1, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
})
