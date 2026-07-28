'use client'

import { play, togglePlay } from '@entities/Player'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useAppDispatch, useAppSelector } from '@shared/hooks'
import { formatDuration } from '@shared/utils/apiHelpers'
import { DateUtils } from '@shared/utils/DateUtils'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { cn } from '@spotify/ui-react'
import { Pause, Play, X } from 'lucide-react'
import Image from 'next/image'
import { LikeTrackButton } from './LikeTrackButton'
import { WaveAnimated } from './WaveAnimated'

interface TrackCardProps {
  track: TrackEntity
  index: number
  onPlayTrack?: (track: TrackEntity, index: number) => void
  onRemoveTrack?: (trackId: string) => void
  isLiked?: boolean
  isPlaybackContextActive?: boolean
  isPlaybackTrackActive?: boolean
  removable?: boolean
  viewMode?: 'compact' | 'list'
}

export const TrackCard = ({
  index,
  isLiked = false,
  isPlaybackContextActive = true,
  isPlaybackTrackActive = true,
  onPlayTrack,
  onRemoveTrack,
  removable = false,
  track,
  viewMode = 'list',
}: TrackCardProps) => {
  const dispatch = useAppDispatch()
  const currentTrack = useAppSelector((state) => state.musicPlayer.currentTrack)
  const isPlaying = useAppSelector((state) => state.musicPlayer.isPlaying)
  const isCurrentTrack =
    isPlaybackContextActive &&
    isPlaybackTrackActive &&
    currentTrack?.id === track.id
  const coverUrl = getTrackCoverUrl(track.cover)

  const handlePlayTrack = (track: TrackEntity) => {
    if (isCurrentTrack) {
      dispatch(togglePlay())
      return
    }

    if (onPlayTrack) {
      onPlayTrack(track, index)
      return
    }

    dispatch(play(track))
  }

  return (
    <div
      className={cn(
        'group grid w-full items-center gap-4 rounded px-4 py-2 text-left hover:bg-surface max-[1024px]:grid-cols-[minmax(0,1fr)_auto] max-[1024px]:gap-2 max-[1024px]:px-2',
        viewMode === 'compact'
          ? 'grid-cols-[32px_minmax(0,2fr)_minmax(140px,1.3fr)_minmax(160px,1.5fr)_minmax(140px,1.4fr)_112px]'
          : 'grid-cols-[32px_minmax(0,4fr)_minmax(160px,2fr)_minmax(140px,2fr)_112px]',
      )}
    >
      <button
        aria-label={`${isCurrentTrack && isPlaying ? 'Pause' : 'Play'} ${track.title}`}
        className="relative flex items-center justify-center text-sm max-[1024px]:hidden"
        onClick={() => handlePlayTrack(track)}
        type="button"
      >
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
      </button>

      <button
        className="flex min-w-0 items-center gap-3 text-left"
        onClick={() => handlePlayTrack(track)}
        type="button"
      >
        <div
          className={cn(
            'relative h-10 w-10 shrink-0 overflow-hidden rounded',
            viewMode === 'list' ? 'block' : 'hidden max-[1024px]:block',
          )}
        >
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
      </button>

      {viewMode === 'compact' && (
        <div className="text-sm text-text-subdued truncate max-[1024px]:hidden">
          {track.artistId}
        </div>
      )}
      <div className="text-sm text-text-subdued truncate max-[1024px]:hidden">
        Unknown Album
      </div>
      <div className="text-sm text-text-subdued max-[1024px]:hidden">
        {track.createdAt ? DateUtils.formatDate(track.createdAt) : 'Unknown'}
      </div>
      <div className="grid grid-cols-[24px_44px_24px] items-center justify-end gap-2 text-sm text-text-subdued max-[1024px]:hidden">
        <div className="flex justify-center">
          <LikeTrackButton
            initialLiked={isLiked}
            trackId={track.id}
            trackTitle={track.title}
          />
        </div>
        <span className="text-right">
          {formatDuration(track.duration ?? 0)}
        </span>
        {removable && (
          <button
            aria-label={`Remove ${track.title} from playlist`}
            className="rounded-full p-1 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100"
            onClick={(event) => {
              event.stopPropagation()
              onRemoveTrack?.(track.id)
            }}
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="hidden shrink-0 grid-cols-[24px_auto] items-center justify-end gap-2 text-xs text-text-subdued max-[1024px]:grid">
        <LikeTrackButton
          initialLiked={isLiked}
          trackId={track.id}
          trackTitle={track.title}
        />
        {removable ? (
          <button
            aria-label={`Remove ${track.title} from playlist`}
            className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-text"
            onClick={() => onRemoveTrack?.(track.id)}
            type="button"
          >
            <X size={18} />
          </button>
        ) : (
          <span className="min-w-8 text-right">
            {formatDuration(track.duration ?? 0)}
          </span>
        )}
      </div>
    </div>
  )
}
