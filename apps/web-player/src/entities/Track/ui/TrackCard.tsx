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
      className="w-full text-left rounded hover:bg-surface group items-center grid grid-cols-[16px_4fr_3fr_3fr_1fr] gap-4 px-4 py-2 max-[1024px]:block max-[1024px]:px-3"
    >
      <div className="contents max-[1024px]:flex max-[1024px]:items-center max-[1024px]:gap-3">
        <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden hidden max-[1024px]:block">
          <img
            src={track.cover || '/images/default-track-cover.jpg'}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-sm items-center justify-center flex relative max-[1024px]:w-4 max-[1024px]:shrink-0">
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

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'font-medium truncate',
              isCurrentTrack ? 'text-green-500' : 'text-text',
              !isCurrentTrack && 'group-hover:underline',
            )}
          >
            {track.title}
          </div>
          <div className="text-sm text-text-subdued truncate max-[1024px]:text-xs">{track.artistId}</div>
        </div>

        <div className="text-sm text-text-subdued shrink-0 text-right max-[1024px]:text-left">
          {formatDuration(track.duration ?? 0)}
        </div>
      </div>

      <div className="text-sm text-text-subdued max-[1024px]:hidden">Unknown Album</div>
      <div className="text-sm text-text-subdued max-[1024px]:hidden">
        {track.createdAt ? DateUtils.formatDate(track.createdAt) : 'Unknown'}
      </div>
      <div className="text-sm text-text-subdued text-right max-[1024px]:hidden">
        {formatDuration(track.duration ?? 0)}
      </div>
    </button>
  )
}
