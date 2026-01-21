'use client'
import React from 'react'
import { Play, Pause } from 'lucide-react'
import { WaveIcon } from '@spotify/ui-react'
import { Track } from './TracksList'
import { formatDuration } from '@shared/utils/apiHelpers'

interface TrackCardProps {
  track: Track
  index: number
  isCurrentTrack: boolean
  isPlaying: boolean
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  index,
  isCurrentTrack,
  isPlaying,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  const showPlayIcon = isHovered && !isCurrentTrack
  const showPauseIcon = isHovered && isCurrentTrack && isPlaying
  const showWaveIcon = isCurrentTrack && isPlaying && !isHovered
  const showGreenNumber = isCurrentTrack && !isPlaying && !isHovered
  const showNumber = !showPlayIcon && !showPauseIcon && !showWaveIcon && !showGreenNumber

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="grid grid-cols-[16px_4fr_3fr_3fr_1fr] gap-4 px-4 py-2 rounded hover:bg-white/10 cursor-pointer group items-center"
    >
      <div className="text-sm flex items-center justify-center">
        {showNumber && (
          <span className='text-gray-400'>
            {index + 1}
          </span>
        )}
        {showGreenNumber && (
          <span className='text-green-500'>
            {index + 1}
          </span>
        )}
        {showPlayIcon && <Play size={14} className="text-white" fill="white" />}
        {showPauseIcon && <Pause size={14} className="text-white" fill="white" />}
        {showWaveIcon && <WaveIcon />}
      </div>
      <div>
        <div className={`font-medium ${isCurrentTrack ? 'text-green-500' : 'text-white'
          } ${isHovered && !isCurrentTrack ? 'underline' : ''}`}>
          {track.title}
        </div>
        <div className="text-sm text-gray-400">{(track as any).artist?.name || (track as any).artist || 'Unknown Artist'}</div>
      </div>
      <div className="text-sm text-gray-400">{(track as any).album || 'Unknown Album'}</div>
      <div className="text-sm text-gray-400">
        {track.createdAt ? new Date(track.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }) : 'Unknown'}
      </div>
      <div className="text-sm text-gray-400 text-right">
        {formatDuration((track as any).duration || 0)}
      </div>
    </div>
  )
}
