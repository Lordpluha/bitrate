'use client'

import { Button } from '@bitrate/ui-react'
import {
  selectCurrentPlaylistName,
  selectCurrentTrack,
  selectCurrentTrackIndex,
  selectPlaylist,
  selectQueue,
  usePlayerStore,
} from '@entities/Player'
import { ROUTES } from '@shared/routes'
import { PageTitle, StateMessage } from '@shared/ui'
import { ListMusic } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { QueueTrackSection } from '@/views/Queue/ui/QueueTrackSection'

export const QueuePage = () => {
  const { t } = useI18n()
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const currentTrackIndex = usePlayerStore(selectCurrentTrackIndex)
  const playlist = usePlayerStore(selectPlaylist)
  const playlistName = usePlayerStore(selectCurrentPlaylistName)
  const queue = usePlayerStore(selectQueue)
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue)
  const clearQueue = usePlayerStore((state) => state.clearQueue)
  const playPlaylist = usePlayerStore((state) => state.playPlaylist)
  const currentPlaylistId = usePlayerStore((state) => state.currentPlaylistId)

  /** Playlist tail after the playing track, with its absolute position kept for playback. */
  const upcoming =
    currentTrackIndex >= 0
      ? playlist.slice(currentTrackIndex + 1).map((track, offset) => ({
          key: `${track.id}-${currentTrackIndex + 1 + offset}`,
          position: currentTrackIndex + 1 + offset,
          track,
        }))
      : []

  if (!currentTrack) {
    return (
      <div className="flex h-full flex-1 flex-col gap-7 px-4 pt-2 md:px-8 md:py-6">
        <PageTitle title={t('queue.title')} />
        <StateMessage
          description={t('queue.empty.description')}
          icon={ListMusic}
          primary={{ href: ROUTES.search(), label: t('queue.find') }}
          title={t('queue.empty')}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto custom-scrollbar">
      <div className="flex flex-1 flex-col gap-7 px-4 pt-2 pb-3 md:px-8 md:py-6">
        <PageTitle
          action={
            queue.length > 0 ? (
              <Button
                className="h-9 px-4 text-sm font-medium"
                onClick={clearQueue}
                variant="ghost"
              >
                {t('queue.clear')}
              </Button>
            ) : null
          }
          title={t('queue.title')}
        />

        <QueueTrackSection
          entries={[
            { isActive: true, key: currentTrack.id, track: currentTrack },
          ]}
          title={t('queue.nowPlaying')}
        />
        <QueueTrackSection
          entries={queue.map((item, index) => ({
            index: index + 1,
            key: item.queueId,
            onRemove: () => removeFromQueue(item.queueId),
            track: item.track,
          }))}
          title={t('queue.next')}
        />
        <QueueTrackSection
          entries={upcoming.map((entry) => ({
            index: entry.position - currentTrackIndex,
            key: entry.key,
            onPlay: () =>
              playPlaylist({
                currentPlaylistId,
                currentPlaylistName: playlistName,
                startTrack: entry.track,
                startTrackIndex: entry.position,
                tracks: playlist,
              }),
            track: entry.track,
          }))}
          title={t('queue.nextFrom', {
            name: playlistName ?? t('common.unknown'),
          })}
        />
      </div>
    </div>
  )
}
