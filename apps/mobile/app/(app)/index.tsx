import { useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshControl } from 'react-native'

import { FeedRow } from '@/components/home/feed-row'
import { GreetingHeader } from '@/components/home/greeting-header'
import { HomeSkeleton } from '@/components/home/home-skeleton'
import { QuickGrid } from '@/components/home/quick-grid'
import { RecentlyPlayed } from '@/components/home/recently-played'
import { ResumeTile } from '@/components/home/resume-tile'
import { Screen } from '@/components/ui/screen'
import { StateMessage } from '@/components/ui/state-message'
import { useI18n } from '@/hooks/use-i18n'
import { usePlayCard } from '@/hooks/use-play-card'
import { useSession } from '@/hooks/use-session'
import { useTheme } from '@/hooks/use-theme'
import { feedQuery } from '@/lib/catalog/feed-query'
import { historyQuery } from '@/lib/catalog/history-query'
import { myPlaylistsQuery } from '@/lib/catalog/my-playlists-query'
import { catalogKeys } from '@/lib/catalog/query-keys'
import { usePlayerStore } from '@/lib/player/player-store'

/** Home as bento tiles: greeting, resume, quick grid, recommendation rows, recently played. */
export default function HomeScreen() {
  const { t } = useI18n()
  const { colors } = useTheme()
  const session = useSession()
  const queryClient = useQueryClient()
  const feed = useQuery(feedQuery)
  const history = useQuery(historyQuery)
  const playlists = useQuery(myPlaylistsQuery)
  const playCard = usePlayCard()
  const playQueue = usePlayerStore((player) => player.playQueue)
  const currentId = usePlayerStore((player) => player.queue[player.index]?.id ?? null)

  if (session.status !== 'signed-in') return null
  const recent = history.data ?? []
  const playHistory = (startIndex: number) => playQueue({ tracks: recent, startIndex, source: { kind: 'history' } })

  return (
    <Screen
      island
      refreshControl={
        <RefreshControl
          onRefresh={() => void queryClient.invalidateQueries({ queryKey: ['catalog'] })}
          refreshing={feed.isRefetching}
          tintColor={colors.textSecondary}
        />
      }
    >
      <GreetingHeader user={session.user} />
      {feed.isPending ? (
        <HomeSkeleton />
      ) : feed.isError ? (
        <StateMessage
          action={{ label: t('common.tryAgain'), onPress: () => void queryClient.invalidateQueries({ queryKey: catalogKeys.feed }) }}
          description={t('home.feed.failed')}
          icon="cloud-off"
          title={t('common.error.title')}
          tone="error"
        />
      ) : (
        <>
          {recent[0] ? <ResumeTile onPlay={() => playHistory(0)} track={recent[0]} /> : null}
          <QuickGrid
            onPlayPlaylist={(playlist) =>
              void playCard({ kind: 'playlist', id: playlist.id, title: playlist.title, subtitle: null, imageUrl: playlist.coverUrl })
            }
            playlists={playlists.data ?? []}
          />
          {feed.data.length === 0 ? (
            <StateMessage icon="radio" title={t('home.feed.empty')} />
          ) : (
            feed.data.map((row) => <FeedRow key={row.id} onPlay={(card) => void playCard(card)} row={row} />)
          )}
          <RecentlyPlayed currentId={currentId} onPlay={playHistory} tracks={recent} />
        </>
      )}
    </Screen>
  )
}
