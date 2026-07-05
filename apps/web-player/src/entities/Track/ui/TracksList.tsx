'use client'
import { useLikedTracks } from '@entities/Track/api/client'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { Clock } from 'lucide-react'
import { useMemo } from 'react'
import { TrackCard } from './TrackCard'

interface TracksListProps {
  likedTrackIds?: Iterable<string>
  tracks: TrackEntity[]
  onRemoveTrack?: (trackId: string) => void
  removable?: boolean
}

export const TracksList = ({
  likedTrackIds: providedLikedTrackIds,
  onRemoveTrack,
  removable = false,
  tracks,
}: TracksListProps) => {
  const shouldLoadLikedTracks = !providedLikedTrackIds
  const { data: likedTracks } = useLikedTracks(1, 100, undefined, {
    enabled: shouldLoadLikedTracks,
  })
  const likedTrackIds = useMemo(
    () =>
      providedLikedTrackIds
        ? new Set(providedLikedTrackIds)
        : new Set((likedTracks ?? []).map((track) => track.id)),
    [likedTracks, providedLikedTrackIds],
  )

  return (
    <div className="px-6 py-4 max-[1024px]:px-3 max-[1024px]:py-3">
      <div className="grid grid-cols-[32px_minmax(0,4fr)_minmax(160px,2fr)_minmax(140px,2fr)_88px] gap-4 px-4 py-2 border-b border-gray-700 text-sm text-gray-400 mb-2 max-[1024px]:hidden">
        <div>#</div>
        <div>Title</div>
        <div>Album</div>
        <div>Date added</div>
        <div className="flex justify-end">
          <Clock size={16} />
        </div>
      </div>

      <div className="space-y-1">
        {tracks.map((track, index) => (
          <TrackCard
            index={index}
            isLiked={likedTrackIds.has(track.id)}
            key={track.id}
            onRemoveTrack={onRemoveTrack}
            removable={removable}
            track={track}
          />
        ))}
      </div>
    </div>
  )
}
