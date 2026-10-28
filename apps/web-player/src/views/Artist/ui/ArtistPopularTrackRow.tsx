'use client'

import { cn } from '@bitrate/ui-react'
import { LikeTrackButton, type TrackEntity } from '@entities/Track'
import { MediaImage } from '@shared/ui/MediaImage'
import { formatDuration } from '@shared/utils/apiHelpers'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { AudioLines, Play } from 'lucide-react'
import { type Translate, useI18n } from '@/shared/i18n'

type ArtistPopularTrackRowProps = {
  index: number
  isActive: boolean
  isLiked: boolean
  isPlaying: boolean
  onPlay: () => void
  track: TrackEntity
}

type ReleaseLabelInput = {
  releaseDate: string | null
  t: Translate
}

const getReleaseLabel = ({ releaseDate, t }: ReleaseLabelInput) => {
  if (!releaseDate) return t('artist.track')
  const year = new Date(releaseDate).getFullYear()
  return Number.isFinite(year)
    ? t('artist.released', { year })
    : t('artist.track')
}

export const ArtistPopularTrackRow = ({
  index,
  isActive,
  isLiked,
  isPlaying,
  onPlay,
  track,
}: ArtistPopularTrackRowProps) => {
  const { t } = useI18n()

  return (
    <li
      className={cn(
        'group relative grid h-15 grid-cols-[32px_44px_minmax(0,1fr)_32px_44px] items-center gap-x-3 rounded-lg px-3 transition-colors hover:bg-surface lg:gap-x-4',
        isActive && 'bg-secondary',
      )}
    >
      <button
        aria-current={isActive ? 'true' : undefined}
        aria-label={t('common.playName', { name: track.title })}
        className="absolute inset-0 z-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onClick={onPlay}
        type="button"
      />
      <span className="pointer-events-none relative z-10 flex justify-start font-[family-name:var(--font-landing-display)] text-xl font-bold text-muted-foreground">
        {isActive && isPlaying ? (
          <AudioLines aria-hidden="true" className="text-primary" size={16} />
        ) : (
          <>
            <span className="group-hover:hidden group-focus-within:hidden">
              {index + 1}
            </span>
            <Play
              className="hidden text-foreground group-hover:block group-focus-within:block"
              fill="currentColor"
              size={16}
            />
          </>
        )}
      </span>
      <span className="pointer-events-none relative z-10 size-11 overflow-hidden rounded-md">
        <MediaImage
          alt=""
          className="size-full object-cover"
          fallback="track"
          height={44}
          src={getTrackCoverUrl(track.cover)}
          unoptimized
          width={44}
        />
      </span>
      <span className="pointer-events-none relative z-10 flex min-w-0 flex-col gap-0.5">
        <span
          className={cn(
            'truncate text-sm font-semibold',
            isActive ? 'text-primary' : 'text-foreground',
          )}
        >
          {track.title}
        </span>
        <span className="truncate text-[13px] text-muted-foreground">
          {getReleaseLabel({ releaseDate: track.releaseDate, t })}
        </span>
      </span>
      <span
        className={cn(
          'relative z-20 flex justify-center transition-opacity',
          !isLiked &&
            'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100',
        )}
      >
        <LikeTrackButton trackId={track.id} trackTitle={track.title} />
      </span>
      <span className="pointer-events-none relative z-10 text-right text-[13px] tabular-nums text-muted-foreground">
        {formatDuration(track.duration ?? 0)}
      </span>
    </li>
  )
}
