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

/** Numbered "Popular" list — the artist's most played tracks (`GET /artists/{id}/top-tracks`). */
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
    <section className="flex min-w-0 flex-col gap-2">
      <h2 className="text-[19px] leading-[1.25] font-semibold">Popular</h2>

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
          className="self-start px-3 py-1 text-[13px] font-semibold text-accent transition-colors hover:underline"
          onClick={() => setIsExpanded((value) => !value)}
          type="button"
        >
          {isExpanded ? 'Show less' : 'See more'}
        </button>
      )}
    </section>
  )
}
