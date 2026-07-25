'use client'

import { useListeningHistory } from '@entities/History'
import { play } from '@entities/Player'
import { getTrackById } from '@entities/Track'
import { showApiErrorToast } from '@shared/api/feedback'
import { useAppDispatch } from '@shared/hooks'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import Image from 'next/image'

export const RecentlyPlayed = () => {
  const dispatch = useAppDispatch()
  const { data: history, isPending } = useListeningHistory({
    page: 1,
    limit: 6,
  })
  const recentTracks = history ?? []

  const playHistoryTrack = async (trackId: string) => {
    try {
      dispatch(play(await getTrackById(trackId)))
    } catch (error) {
      showApiErrorToast(error, 'Unable to play this track.')
    }
  }

  if (isPending || recentTracks.length === 0) return null

  return (
    <section className="relative mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">Recently played</h2>
      </div>
      <div className="space-y-1">
        {recentTracks.map((entry) => (
          <button
            className="grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-surface"
            key={entry.id}
            onClick={() => void playHistoryTrack(entry.track.id)}
            type="button"
          >
            <Image
              alt={entry.track.title}
              className="rounded object-cover"
              height={48}
              src={getTrackCoverUrl(entry.track.cover)}
              unoptimized
              width={48}
            />
            <div className="min-w-0">
              <div className="truncate font-medium text-text">
                {entry.track.title}
              </div>
              <div className="truncate text-sm text-text-subdued">
                {entry.track.artist?.username ?? entry.track.artistId}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
