'use client'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { Clock } from 'lucide-react'
import { useMemo } from 'react'
import { TrackCard } from './TrackCard'

interface TracksListProps {
  activeTrackIndex?: number
  likedTrackIds?: Iterable<string>
  tracks: TrackEntity[]
  isPlaybackContextActive?: boolean
  onPlayTrack?: (track: TrackEntity, index: number) => void
  onRemoveTrack?: (trackId: string) => void
  removable?: boolean
  viewMode?: 'compact' | 'list'
}

export const TracksList = ({
  activeTrackIndex,
  likedTrackIds: providedLikedTrackIds,
  isPlaybackContextActive = true,
  onPlayTrack,
  onRemoveTrack,
  removable = false,
  tracks,
  viewMode = 'list',
}: TracksListProps) => {
  const likedTrackIds = useMemo(
    () =>
      providedLikedTrackIds
        ? new Set(providedLikedTrackIds)
        : new Set<string>(),
    [providedLikedTrackIds],
  )

  return (
    <div className="px-6 py-4 max-[1024px]:px-3 max-[1024px]:py-3">
      <div
        className={
          viewMode === 'compact'
            ? 'grid grid-cols-[32px_minmax(0,2fr)_minmax(140px,1.3fr)_minmax(160px,1.5fr)_minmax(140px,1.4fr)_112px] gap-4 px-4 py-2 border-b border-gray-700 text-sm text-gray-400 mb-2 max-[1024px]:hidden'
            : 'grid grid-cols-[32px_minmax(0,4fr)_minmax(160px,2fr)_minmax(140px,2fr)_112px] gap-4 px-4 py-2 border-b border-gray-700 text-sm text-gray-400 mb-2 max-[1024px]:hidden'
        }
      >
        <div>#</div>
        <div>Title</div>
        {viewMode === 'compact' && <div>Artist</div>}
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
            isPlaybackContextActive={isPlaybackContextActive}
            isPlaybackIndexActive={
              activeTrackIndex === undefined || activeTrackIndex === index
            }
            key={track.id}
            onPlayTrack={onPlayTrack}
            onRemoveTrack={onRemoveTrack}
            removable={removable}
            track={track}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  )
}
