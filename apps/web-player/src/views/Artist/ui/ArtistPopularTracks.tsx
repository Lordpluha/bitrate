'use client'

import {
  selectCurrentTrack,
  selectIsPlaying,
  usePlayerStore,
} from '@entities/Player'
import type { TrackEntity } from '@entities/Track'
import { useState } from 'react'
import { ArtistPopularTrackRow } from './ArtistPopularTrackRow'

export type ArtistPopularTracksProps = {
  isPlaybackContextActive: boolean
  likedTrackIds: Set<string>
  onPlayTrack: (track: TrackEntity, index: number) => void
  tracks: TrackEntity[]
}

const COLLAPSED_COUNT = 5

/** Numbered "Popular" list — the artist's most-played tracks. */
export const ArtistPopularTracks = ({
  isPlaybackContextActive,
  likedTrackIds,
  onPlayTrack,
  tracks,
}: ArtistPopularTracksProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const isPlaying = usePlayerStore(selectIsPlaying)
  const visibleTracks = isExpanded ? tracks : tracks.slice(0, COLLAPSED_COUNT)

  if (tracks.length === 0) return null

  return (
    <section className="px-4 sm:px-6">
      <h2 className="mb-4 text-2xl font-bold text-text">Popular</h2>

      <ul className="flex flex-col">
        {visibleTracks.map((track, index) => {
          const isActive =
            isPlaybackContextActive && currentTrack?.id === track.id
          const isLiked = likedTrackIds.has(track.id)

          return (
            <ArtistPopularTrackRow
              index={index}
              isActive={isActive}
              isLiked={isLiked}
              isPlaying={isPlaying}
              key={track.id}
              onPlay={() => onPlayTrack(track, index)}
              track={track}
            />
          )
        })}
      </ul>

      {tracks.length > COLLAPSED_COUNT && (
        <button
          className="mt-2 px-2 py-2 text-sm font-bold text-text-subdued transition-colors hover:text-text sm:px-3"
          onClick={() => setIsExpanded((value) => !value)}
          type="button"
        >
          {isExpanded ? 'Show less' : 'See more'}
        </button>
      )}
    </section>
  )
}
