import React, { useState } from 'react'
import { Clock, Play, Pause } from 'lucide-react'
import { useAppSelector } from '@shared/hooks'
import {
  PlayingIcon
} from '@spotify/ui-react'

export interface Track {
  id: string
  name: string
  artist: string
  album: string
  dateAdded: string
  duration: string
}

interface TracksListProps {
  tracks: Track[]
  onTrackClick: (track: Track) => void
}


export const TracksList: React.FC<TracksListProps> = ({ tracks, onTrackClick }) => {
  const { currentTrack, isPlaying } = useAppSelector((state) => state.musicPlayer)
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null)

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
        {tracks.map((track, index) => {
          const isCurrentTrack = currentTrack?.id === track.id
          const isHovered = hoveredTrackId === track.id
          const showPlayIcon = isHovered && !isCurrentTrack
          const showPauseIcon = isHovered && isCurrentTrack && isPlaying
          const showPlayingIcon = isCurrentTrack && isPlaying && !isHovered
          const showNumber = !showPlayIcon && !showPauseIcon && !showPlayingIcon

          return (
            <div
              key={track.id}
              onClick={() => onTrackClick(track)}
              onMouseEnter={() => setHoveredTrackId(track.id)}
              onMouseLeave={() => setHoveredTrackId(null)}
              className="grid grid-cols-[16px_4fr_3fr_3fr_1fr] gap-4 px-4 py-2 rounded hover:bg-white/10 cursor-pointer group items-center"
            >
              <div className="text-sm flex items-center justify-center">
                {showNumber && (
                  <span className={isCurrentTrack ? 'text-green-500' : 'text-gray-400'}>
                    {index + 1}
                  </span>
                )}
                {showPlayIcon && <Play size={14} className="text-white" fill="white" />}
                {showPauseIcon && <Pause size={14} className="text-white" fill="white" />}
                {showPlayingIcon && <PlayingIcon />}
              </div>
              <div>
                <div className={`font-medium ${isCurrentTrack ? 'text-green-500' : 'text-white'
                  } ${isHovered && !isCurrentTrack ? 'underline' : ''}`}>
                  {track.name}
                </div>
                <div className="text-sm text-gray-400">{track.artist}</div>
              </div>
              <div className="text-sm text-gray-400">{track.album}</div>
              <div className="text-sm text-gray-400">{track.dateAdded}</div>
              <div className="text-sm text-gray-400 text-right">{track.duration}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
