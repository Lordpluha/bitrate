import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { TrackRow } from '@/components/track-row'
import { SectionHeader } from '@/components/ui/section-header'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import type { PlayableTrack } from '@/lib/catalog/playable-track'

const VISIBLE = 5

type RecentlyPlayedProps = {
  tracks: PlayableTrack[]
  currentId: string | null
  onPlay: (index: number) => void
}

/** The latest listening history as track rows; playing one queues the whole history. */
export function RecentlyPlayed({ tracks, currentId, onPlay }: RecentlyPlayedProps) {
  const { t } = useI18n()

  return (
    <View style={styles.section}>
      <SectionHeader title={t('home.recentlyPlayed')} />
      {tracks.length === 0 ? (
        <ThemedText tone="textSecondary" variant="caption">
          {t('home.recentlyPlayed.empty')}
        </ThemedText>
      ) : (
        tracks
          .slice(0, VISIBLE)
          .map((track, index) => (
            <TrackRow active={track.id === currentId} key={track.id} onPress={() => onPlay(index)} track={track} />
          ))
      )}
    </View>
  )
}

const styles = StyleSheet.create({ section: { gap: spacing['2'] } })
