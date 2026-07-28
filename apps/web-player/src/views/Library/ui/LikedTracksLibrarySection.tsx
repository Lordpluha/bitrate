'use client'

import Image from 'next/image'
import { play } from '@/entities/Player'
import type { TrackEntity } from '@/entities/Track'
import { useAppDispatch } from '@/shared/hooks'
import { getTrackCoverUrl } from '@/shared/utils/mediaUrl'
import { LibraryListEmptyAware } from '@/views/Library/ui/LibraryEmptyAware'

type LikedTracksLibrarySectionProps = {
  tracks: TrackEntity[]
}

export const LikedTracksLibrarySection = ({
  tracks,
}: LikedTracksLibrarySectionProps) => {
  const dispatch = useAppDispatch()

  return (
    <LibraryListEmptyAware isEmpty={tracks.length === 0}>
      {tracks.map((track) => (
        <button
          className="grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-surface"
          key={track.id}
          onClick={() => dispatch(play(track))}
          type="button"
        >
          <Image
            alt={track.title}
            className="rounded object-cover"
            height={48}
            src={getTrackCoverUrl(track.cover)}
            unoptimized
            width={48}
          />
          <div className="min-w-0">
            <div className="truncate font-medium text-text">{track.title}</div>
            <div className="truncate text-sm text-text-subdued">
              {track.artistId}
            </div>
          </div>
        </button>
      ))}
    </LibraryListEmptyAware>
  )
}
