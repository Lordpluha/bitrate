'use client'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@spotify/ui-react'
import { SkipBack, SkipForward } from 'lucide-react'
import Image from 'next/image'
import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'
import { getTrackCoverUrl } from '@/shared/utils/mediaUrl'

interface TrackNavigationButtonProps {
  direction: 'next' | 'previous'
  onClick: () => void
  track: TrackEntity | null
}

export const TrackNavigationButton = ({
  direction,
  onClick,
  track,
}: TrackNavigationButtonProps) => {
  const isNext = direction === 'next'
  const label = isNext ? 'Next track' : 'Previous track'
  const Icon = isNext ? SkipForward : SkipBack

  return (
    <HoverCard>
      <HoverCardTrigger asChild closeDelay={100} delay={250}>
        <button
          aria-label={label}
          className="p-1 text-text-subdued transition-all hover:scale-110 hover:text-text focus-visible:text-text"
          onClick={onClick}
          type="button"
        >
          <Icon size={20} />
        </button>
      </HoverCardTrigger>
      {track && (
        <HoverCardContent className="hidden w-60 p-2.5 [@media(hover:hover)]:flex">
          <Image
            alt=""
            className="size-12 shrink-0 rounded object-cover"
            height={48}
            src={getTrackCoverUrl(track.cover)}
            unoptimized
            width={48}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-text-subdued">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-text">
              {track.title}
            </p>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  )
}
