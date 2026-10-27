'use client'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@bitrate/ui-react'
import { MediaImage } from '@shared/ui/MediaImage'
import { SkipBack, SkipForward } from 'lucide-react'
import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'
import { useI18n } from '@/shared/i18n'
import { getTrackCoverUrl } from '@/shared/utils/mediaUrl'

interface TrackNavigationButtonProps {
  direction: 'next' | 'previous'
  iconSize?: number
  onClick: () => void
  track: TrackEntity | null
}

export const TrackNavigationButton = ({
  direction,
  iconSize = 22,
  onClick,
  track,
}: TrackNavigationButtonProps) => {
  const { t } = useI18n()
  const isNext = direction === 'next'
  const label = isNext ? t('player.next') : t('player.previous')
  const Icon = isNext ? SkipForward : SkipBack

  return (
    <HoverCard>
      <HoverCardTrigger asChild closeDelay={100} delay={250}>
        <button
          aria-label={label}
          className="p-1 text-foreground transition-all hover:scale-110 focus-visible:text-foreground"
          onClick={onClick}
          type="button"
        >
          <Icon size={iconSize} />
        </button>
      </HoverCardTrigger>
      {track && (
        <HoverCardContent className="hidden w-60 items-center gap-3 p-2.5 [@media(hover:hover)]:flex">
          <MediaImage
            alt=""
            className="size-12 shrink-0 rounded object-cover"
            fallback="track"
            height={48}
            src={getTrackCoverUrl(track.cover)}
            unoptimized
            width={48}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
              {track.title}
            </p>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  )
}
