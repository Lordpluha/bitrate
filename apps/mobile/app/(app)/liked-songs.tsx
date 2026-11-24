import { useQuery } from '@tanstack/react-query'

import { ScreenHeader } from '@/components/screen-header'
import { TrackListSkeleton } from '@/components/track-list-skeleton'
import { TrackRow } from '@/components/track-row'
import { Screen } from '@/components/ui/screen'
import { StateMessage } from '@/components/ui/state-message'
import { useI18n } from '@/hooks/use-i18n'
import { likedTracksQuery } from '@/lib/catalog/liked-tracks-query'
import { usePlayerStore } from '@/lib/player/player-store'

/** Every liked track; playing one queues the whole list from there. */
export default function LikedSongsScreen() {
  const { t } = useI18n()
  const liked = useQuery(likedTracksQuery)
  const playQueue = usePlayerStore((player) => player.playQueue)
  const currentId = usePlayerStore((player) => player.queue[player.index]?.id ?? null)
  const title = t('library.likedSongs')

  const content = () => {
    if (liked.isPending) return <TrackListSkeleton />
    if (liked.isError) {
      return (
        <StateMessage
          action={{ label: t('common.tryAgain'), onPress: () => void liked.refetch() }}
          icon="cloud-off"
          title={t('library.failed')}
          tone="error"
        />
      )
    }
    if (liked.data.length === 0) return <StateMessage icon="heart" title={t('library.liked.empty')} />

    return liked.data.map((track, index) => (
      <TrackRow
        active={track.id === currentId}
        key={track.id}
        onPress={() => playQueue({ tracks: liked.data, startIndex: index, source: { kind: 'liked', title } })}
        track={track}
      />
    ))
  }

  return (
    <Screen island>
      <ScreenHeader title={title} />
      {content()}
    </Screen>
  )
}
