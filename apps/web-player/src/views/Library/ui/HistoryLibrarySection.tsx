'use client'

import Image from 'next/image'
import type { ListeningHistoryEntry } from '@/entities/History'
import { play } from '@/entities/Player'
import type { TrackEntity } from '@/entities/Track'
import { useAppDispatch } from '@/shared/hooks'
import { getApiUrl, getTrackCoverUrl } from '@/shared/utils/mediaUrl'
import { LibraryListEmptyAware } from '@/views/Library/ui/LibraryEmptyAware'

type HistoryLibrarySectionProps = {
  history: ListeningHistoryEntry[]
}

export const HistoryLibrarySection = ({
  history,
}: HistoryLibrarySectionProps) => {
  const dispatch = useAppDispatch()

  const playHistoryTrack = (entry: ListeningHistoryEntry) => {
    dispatch(
      play({
        ...entry.track,
        audioUrl: getApiUrl(`/api/v1/tracks/stream/${entry.track.id}`),
      } as unknown as TrackEntity),
    )
  }

  return (
    <LibraryListEmptyAware isEmpty={history.length === 0}>
      {history.map((entry) => (
        <button
          className="grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-surface"
          key={entry.id}
          onClick={() => playHistoryTrack(entry)}
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
    </LibraryListEmptyAware>
  )
}
