'use client'

import {
  LikeTrackButton,
  type TrackEntity,
  WaveAnimated,
} from '@entities/Track'
import { formatDuration } from '@shared/utils/apiHelpers'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { cn } from '@spotify/ui-react'
import { Play } from 'lucide-react'
import Image from 'next/image'

type ArtistPopularTrackRowProps = {
  index: number
  isActive: boolean
  isLiked: boolean
  isPlaying: boolean
  onPlay: () => void
  track: TrackEntity
}

const getReleaseLabel = (releaseDate: string | null) => {
  if (!releaseDate) return 'Track'
  const year = new Date(releaseDate).getFullYear()
  return Number.isFinite(year) ? `Released ${year}` : 'Track'
}

export const ArtistPopularTrackRow = ({
  index,
  isActive,
  isLiked,
  isPlaying,
  onPlay,
  track,
}: ArtistPopularTrackRowProps) => (
  <li className="group relative grid h-14 grid-cols-[24px_40px_minmax(0,1fr)_32px_44px] items-center gap-x-3 rounded-md px-3 transition-colors hover:bg-surface-hover focus-within:bg-surface-hover lg:grid-cols-[24px_40px_minmax(0,1fr)_minmax(104px,18%)_32px_44px] lg:gap-x-4">
    <button
      aria-current={isActive ? 'true' : undefined}
      aria-label={`Play ${track.title}`}
      className="absolute inset-0 z-0 rounded-md outline-none active:bg-white/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
      onClick={onPlay}
      type="button"
    />
    <span className="pointer-events-none relative z-10 flex justify-center text-sm text-text-subdued">
      {isActive && isPlaying ? (
        <WaveAnimated className="size-4" />
      ) : (
        <>
          <span className="group-hover:hidden group-focus-within:hidden">
            {index + 1}
          </span>
          <Play
            className="hidden text-text group-hover:block group-focus-within:block"
            fill="currentColor"
            size={14}
          />
        </>
      )}
    </span>
    <span className="pointer-events-none relative z-10 size-10 overflow-hidden rounded-sm">
      <Image
        alt=""
        className="size-full object-cover"
        height={40}
        src={getTrackCoverUrl(track.cover)}
        unoptimized
        width={40}
      />
    </span>
    <span
      className={cn(
        'pointer-events-none relative z-10 truncate text-base',
        isActive ? 'text-green-500' : 'text-text',
      )}
    >
      {track.title}
    </span>
    <span className="pointer-events-none relative z-10 hidden truncate text-right text-sm text-text-subdued lg:block">
      {getReleaseLabel(track.releaseDate)}
    </span>
    <span
      className={cn(
        'relative z-20 flex justify-center transition-opacity',
        !isLiked &&
          'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100',
      )}
    >
      <LikeTrackButton
        initialLiked={isLiked}
        trackId={track.id}
        trackTitle={track.title}
      />
    </span>
    <span className="pointer-events-none relative z-10 text-right text-sm tabular-nums text-text-subdued">
      {formatDuration(track.duration ?? 0)}
    </span>
  </li>
)
