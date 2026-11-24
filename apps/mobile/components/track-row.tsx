import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Artwork } from '@/components/ui/artwork'
import { Icon } from '@/components/ui/icon'
import { MIN_TOUCH_TARGET, spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'
import type { PlayableTrack } from '@/lib/catalog/playable-track'

type TrackRowProps = {
  track: PlayableTrack
  onPress: () => void
  /** Highlights the row of the track that is playing now. */
  active?: boolean
  /** Second line when the track carries no artist name (e.g. the playlist title). */
  fallbackSubtitle?: string
}

/** One track in a list — the design's Mobile Track row. */
export function TrackRow({ track, onPress, active = false, fallbackSubtitle }: TrackRowProps) {
  const { colors } = useTheme()
  const { t } = useI18n()
  const subtitle = track.artistName ?? fallbackSubtitle ?? t('player.unknownArtist')

  return (
    <Pressable
      accessibilityLabel={`${track.title}, ${subtitle}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.backgroundHighlight }]}
    >
      <Artwork size={48} uri={track.coverUrl} />
      <View style={styles.text}>
        <ThemedText numberOfLines={1} tone={active ? 'textBrand' : 'text'} variant="bodyStrong">
          {track.title}
        </ThemedText>
        <ThemedText numberOfLines={1} tone="textSecondary" variant="caption">
          {subtitle}
        </ThemedText>
      </View>
      {active ? <Icon name="volume-2" size={18} tone="textBrand" /> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH_TARGET + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    borderRadius: 12,
  },
  text: { flex: 1, gap: 2 },
})
