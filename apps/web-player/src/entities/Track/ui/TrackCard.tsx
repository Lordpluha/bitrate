'use client'

import { play } from '@entities/Player'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useAppDispatch, useAppSelector } from '@shared/hooks'
import { formatDuration } from '@shared/utils/apiHelpers'
import { DateUtils } from '@shared/utils/DateUtils'
import { getStaticMediaUrl } from '@shared/utils/mediaUrl'
import { cn } from '@spotify/ui-react'
import { Pause, Play } from 'lucide-react'
import Image from 'next/image'
import { WaveAnimated } from './WaveAnimated'

interface TrackCardProps {
  track: TrackEntity
  index: number
}

export const TrackCard = ({ track, index }: TrackCardProps) => {
  const dispatch = useAppDispatch()
  const currentTrack = useAppSelector((state) => state.musicPlayer.currentTrack)
  const isPlaying = useAppSelector((state) => state.musicPlayer.isPlaying)
  const isCurrentTrack = currentTrack?.id === track.id
  const coverUrl = getStaticMediaUrl(
    track.cover,
    'tracks/covers',
    '/images/default-track-cover.jpg',
  )

  const handlePlayTrack = (track: TrackEntity) => {
    dispatch(play(track))
  }

  return (
    <button
      className="w-full text-left rounded hover:bg-surface group grid grid-cols-[32px_minmax(0,4fr)_minmax(160px,2fr)_minmax(140px,2fr)_64px] items-center gap-4 px-4 py-2 max-[1024px]:block max-[1024px]:px-3"
      onClick={() => handlePlayTrack(track)}
      type="button"
    >
      <div className="text-sm items-center justify-center flex relative max-[1024px]:hidden">
        {/* Non-current track: number → play icon on hover */}
        {!isCurrentTrack && (
          <>
            <span className="text-text-subdued group-hover:hidden">
              {index + 1}
            </span>
            <Play
              className="text-text hidden group-hover:block"
              fill="currentColor"
              size={14}
            />
          </>
        )}
        {/* Current track + playing: wave → pause on hover */}
        {isCurrentTrack && isPlaying && (
          <>
            <WaveAnimated className="group-hover:hidden" />
            <Pause
              className="text-text hidden group-hover:block"
              fill="currentColor"
              size={14}
            />
          </>
        )}
        {/* Current track + paused: green number → play on hover */}
        {isCurrentTrack && !isPlaying && (
          <>
            <span className="text-green-500 group-hover:hidden">
              {index + 1}
            </span>
            <Play
              className="text-green-500 hidden group-hover:block"
              fill="currentColor"
              size={14}
            />
          </>
        )}
      </div>

      <div className="min-w-0 flex items-center gap-3 max-[1024px]:gap-3">
        <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden hidden max-[1024px]:block">
          <Image
            alt={track.title}
            className="w-full h-full object-cover"
            height={40}
            src={coverUrl}
            unoptimized
            width={40}
          />
        </div>
        <div className="min-w-0">
          <div
            className={cn(
              'font-medium truncate',
              isCurrentTrack ? 'text-green-500' : 'text-text',
              !isCurrentTrack && 'group-hover:underline',
            )}
          >
            {track.title}
          </div>
          <div className="text-sm text-text-subdued truncate max-[1024px]:text-xs">
            {track.artistId}
          </div>
        </div>
      </div>

      <div className="text-sm text-text-subdued truncate max-[1024px]:hidden">
        Unknown Album
      </div>
      <div className="text-sm text-text-subdued max-[1024px]:hidden">
        {track.createdAt ? DateUtils.formatDate(track.createdAt) : 'Unknown'}
      </div>
      <div className="text-sm text-text-subdued text-right max-[1024px]:hidden">
        {formatDuration(track.duration ?? 0)}
      </div>
    </button>
  )
}
