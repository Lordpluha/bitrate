import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Artwork } from '@/components/ui/artwork'
import { Icon } from '@/components/ui/icon'
import { Tile } from '@/components/ui/tile'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import type { PlayableTrack } from '@/lib/catalog/playable-track'

type ResumeTileProps = {
  track: PlayableTrack
  onPlay: () => void
}

/** The design's Home/Resume tile: pick up the last played track in one tap. */
export function ResumeTile({ track, onPlay }: ResumeTileProps) {
  const { t } = useI18n()
  const artist = track.artistName ?? t('player.unknownArtist')

  return (
    <Tile accessibilityLabel={`${t('player.play')}: ${track.title}, ${artist}`} onPress={onPlay}>
      <ThemedText tone="textBrand" variant="label">
        {t('home.recentlyPlayed').toUpperCase()}
      </ThemedText>
      <View style={styles.row}>
        <Artwork size={64} uri={track.coverUrl} />
        <View style={styles.text}>
          <ThemedText numberOfLines={1} variant="heading">
            {track.title}
          </ThemedText>
          <ThemedText numberOfLines={1} tone="textSecondary" variant="caption">
            {artist}
          </ThemedText>
        </View>
        <Icon name="play-circle" size={32} tone="textBrand" />
      </View>
    </Tile>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing['3'] },
  text: { flex: 1, gap: 2 },
})
