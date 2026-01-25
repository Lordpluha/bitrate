'use client'
import React, { useState } from 'react'
import { Clock } from 'lucide-react'
import { useAppSelector } from '@shared/hooks'
import { useArtists } from '@shared/hooks/useArtists'
import { ApiSchemas } from '@spotify/contracts'
import { TrackCard } from './TrackCard'

export type Track = ApiSchemas['TrackEntity']

interface TracksListProps {
  tracks: Track[]
  onPlayTrack: (track: Track) => void
}

export const TracksList: React.FC<TracksListProps> = ({ tracks, onPlayTrack }) => {
  const { currentTrack, isPlaying } = useAppSelector((state) => state.musicPlayer)
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null)
  const { getArtistName } = useArtists()

  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-[16px_4fr_3fr_3fr_1fr] gap-4 px-4 py-2 border-b border-gray-700 text-sm text-gray-400 mb-2">
        <div>#</div>
        <div>TITLE</div>
        <div>ALBUM</div>
        <div>DATE ADDED</div>
        <div className="flex justify-end">
          <Clock size={16} />
        </div>
      </div>

      <div className="space-y-1">
        {tracks.map((track, index) => (
          <TrackCard
            key={track.id}
            track={track}
            index={index}
            isCurrentTrack={currentTrack?.id === track.id}
            isPlaying={isPlaying}
            isHovered={hoveredTrackId === track.id}
            onMouseEnter={() => setHoveredTrackId(track.id)}
            onMouseLeave={() => setHoveredTrackId(null)}
            onClick={() => onPlayTrack(track)}
            getArtistName={getArtistName}
          />
        ))}
      </div>
    </div>
  )
}
