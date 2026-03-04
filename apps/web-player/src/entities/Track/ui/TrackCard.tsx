'use client'

import { play } from '@entities/Player'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useAppDispatch, useAppSelector } from '@shared/hooks'
import { formatDuration } from '@shared/utils/apiHelpers'
import { DateUtils } from '@shared/utils/DateUtils'
import { cn, WaveIcon } from '@spotify/ui-react'
import { Pause, Play } from 'lucide-react'

interface TrackCardProps {
  track: TrackEntity
  index: number
}

export const TrackCard = ({ track, index }: TrackCardProps) => {
  const dispatch = useAppDispatch()
  const currentTrack = useAppSelector((state) => state.musicPlayer.currentTrack)
  const isPlaying = useAppSelector((state) => state.musicPlayer.isPlaying)
  const isCurrentTrack = currentTrack?.id === track.id

  const showPlayIcon = !isCurrentTrack
  const showPauseIcon = isCurrentTrack && isPlaying
  const showWaveIcon = isCurrentTrack && isPlaying
  const showGreenNumber = isCurrentTrack && !isPlaying
  const showNumber =
    !showPlayIcon && !showPauseIcon && !showWaveIcon && !showGreenNumber

  const handlePlayTrack = (track: TrackEntity) => {
    dispatch(play(track))
  }

  return (
    <button
      className="grid grid-cols-[16px_4fr_3fr_3fr_1fr] gap-4 px-4 py-2 rounded hover:bg-white/10 group items-center w-full text-left"
      onClick={() => handlePlayTrack(track)}
      type="button"
    >
      <div className="text-sm items-center justify-center flex">
        {showNumber && <span className="text-gray-400">{index + 1}</span>}
        {showGreenNumber && <span className="text-green-500">{index + 1}</span>}
        {showPlayIcon && <Play className="text-white" fill="white" size={14} />}
        {showPauseIcon && (
          <Pause className="text-white" fill="white" size={14} />
        )}
        {showWaveIcon && <WaveIcon />}
      </div>
      <div>
        <div
          className={cn(
            'font-medium',
            isCurrentTrack ? 'text-green-500' : 'text-white',
            !isCurrentTrack && 'group-hover:underline',
          )}
        >
          {track.title}
        </div>
        <div className="text-sm text-gray-400">{track.artistId}</div>
      </div>
      <div className="text-sm text-gray-400">Unknown Album</div>
      <div className="text-sm text-gray-400">
        {track.createdAt ? DateUtils.formatDate(track.createdAt) : 'Unknown'}
      </div>
      <div className="text-sm text-gray-400 text-right">
        {formatDuration(track.duration ?? 0)}
      </div>
    </button>
  )
}
