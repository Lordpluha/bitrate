'use client'

import { Play, Pause } from 'lucide-react'
import { cn } from '@spotify/ui-react'
import { WaveAnimated } from './WaveAnimated'
import { formatDuration } from '@shared/utils/apiHelpers'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { DateUtils } from '@shared/utils/DateUtils'
import { useAppDispatch, useAppSelector } from '@shared/hooks'
import { play } from '@entities/Player'

interface TrackCardProps {
  track: TrackEntity
  index: number
}

export const TrackCard = ({ track, index }: TrackCardProps) => {
  const dispatch = useAppDispatch()
  const currentTrack = useAppSelector((state) => state.musicPlayer.currentTrack)
  const isPlaying = useAppSelector((state) => state.musicPlayer.isPlaying)
  const isCurrentTrack = currentTrack?.id === track.id

  const handlePlayTrack = (track: TrackEntity) => {
    dispatch(play(track))
  }

  return (
    <button
      type="button"
      onClick={() => handlePlayTrack(track)}
      className="grid grid-cols-[16px_4fr_3fr_3fr_1fr] gap-4 px-4 py-2 rounded hover:bg-surface group items-center w-full text-left"
    >
      <div className="text-sm items-center justify-center flex relative">
        {/* Non-current track: number → play icon on hover */}
        {!isCurrentTrack && (
          <>
            <span className="text-text-subdued group-hover:hidden">{index + 1}</span>
            <Play size={14} className="text-text hidden group-hover:block" fill="currentColor" />
          </>
        )}
        {/* Current track + playing: wave → pause on hover */}
        {isCurrentTrack && isPlaying && (
          <>
            <WaveAnimated className="group-hover:hidden" />
            <Pause size={14} className="text-text hidden group-hover:block" fill="currentColor" />
          </>
        )}
        {/* Current track + paused: green number → play on hover */}
        {isCurrentTrack && !isPlaying && (
          <>
            <span className="text-green-500 group-hover:hidden">{index + 1}</span>
            <Play size={14} className="text-green-500 hidden group-hover:block" fill="currentColor" />
          </>
        )}
      </div>
      <div>
        <div
          className={cn(
            'font-medium',
            isCurrentTrack ? 'text-green-500' : 'text-text',
            !isCurrentTrack && 'group-hover:underline',
          )}
        >
          {track.title}
        </div>
        <div className="text-sm text-text-subdued">{track.artistId}</div>
      </div>
      <div className="text-sm text-text-subdued">Unknown Album</div>
      <div className="text-sm text-text-subdued">
        {track.createdAt ? DateUtils.formatDate(track.createdAt) : 'Unknown'}
      </div>
      <div className="text-sm text-text-subdued text-right">
        {formatDuration(track.duration ?? 0)}
      </div>
    </button>
  )
}
