'use client'

import {
  selectCurrentPlaylistName,
  selectCurrentTrack,
  selectCurrentTrackIndex,
  selectPlaylist,
  selectQueue,
  usePlayerStore,
} from '@entities/Player'
import { ROUTES } from '@shared/routes'
import { ListMusic } from 'lucide-react'
import Link from 'next/link'
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
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg bg-background-secondary px-6 text-center">
        <ListMusic className="text-text-subdued" size={40} />
        <h1 className="text-2xl font-bold text-text sm:text-3xl">
          {t('queue.empty')}
        </h1>
        <p className="max-w-100 text-text-subdued">
          {t('queue.empty.description')}
        </p>
        <Link
          className="mt-2 rounded-full bg-text px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-105"
          href={ROUTES.main}
        >
          {t('queue.find')}
        </Link>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto rounded-lg bg-background-secondary custom-scrollbar">
      <div className="mx-auto w-full max-w-250 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-text sm:text-4xl">
            {t('queue.title')}
          </h1>
          {queue.length > 0 && (
            <button
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-bold text-text transition-colors hover:border-white"
              onClick={clearQueue}
              type="button"
            >
              {t('queue.clear')}
            </button>
          )}
        </div>

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
