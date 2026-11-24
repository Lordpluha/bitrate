import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { PlaylistRow } from '@/components/library/playlist-row'
import { ThemedText } from '@/components/themed-text'
import { TrackListSkeleton } from '@/components/track-list-skeleton'
import { TrackRow } from '@/components/track-row'
import { Screen } from '@/components/ui/screen'
import { SectionHeader } from '@/components/ui/section-header'
import { StateMessage } from '@/components/ui/state-message'
import { spacing } from '@/constants/theme'
import { useI18n } from '@/hooks/use-i18n'
import { usePlayCard } from '@/hooks/use-play-card'
import { historyQuery } from '@/lib/catalog/history-query'
import { myPlaylistsQuery } from '@/lib/catalog/my-playlists-query'
import { usePlayerStore } from '@/lib/player/player-store'

/** Liked Songs, own playlists and listening history. */
export default function LibraryScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const playlists = useQuery(myPlaylistsQuery)
  const history = useQuery(historyQuery)
  const playCard = usePlayCard()
  const playQueue = usePlayerStore((player) => player.playQueue)
  const currentId = usePlayerStore((player) => player.queue[player.index]?.id ?? null)

  const content = () => {
    if (playlists.isPending || history.isPending) return <TrackListSkeleton />
    if (playlists.isError || history.isError) {
      return (
        <StateMessage
          action={{ label: t('common.tryAgain'), onPress: () => void Promise.all([playlists.refetch(), history.refetch()]) }}
          icon="cloud-off"
          title={t('library.failed')}
          tone="error"
        />
      )
    }

    const recent = history.data
    return (
      <>
        <PlaylistRow coverUrl={null} liked onPress={() => router.push('/liked-songs')} title={t('library.likedSongs')} />
        {playlists.data.length === 0 && recent.length === 0 ? (
          <StateMessage description={t('library.empty.description')} icon="layers" title={t('library.empty.title')} />
        ) : null}
        {playlists.data.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title={t('library.playlists')} />
            {playlists.data.map((playlist) => (
              <PlaylistRow
                coverUrl={playlist.coverUrl}
                key={playlist.id}
                onPress={() =>
                  void playCard({ kind: 'playlist', id: playlist.id, title: playlist.title, subtitle: null, imageUrl: playlist.coverUrl })
                }
                title={playlist.title}
              />
            ))}
          </View>
        ) : null}
        {recent.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title={t('library.history')} />
            {recent.map((track, index) => (
              <TrackRow
                active={track.id === currentId}
                key={track.id}
                onPress={() => playQueue({ tracks: recent, startIndex: index, source: { kind: 'history' } })}
                track={track}
              />
            ))}
          </View>
        ) : null}
      </>
    )
  }

  return (
    <Screen island>
      <ThemedText accessibilityRole="header" variant="title">
        {t('library.heading')}
      </ThemedText>
      {content()}
    </Screen>
  )
}

const styles = StyleSheet.create({ section: { gap: spacing['1'] } })
