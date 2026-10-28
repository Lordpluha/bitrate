'use client'

import { cn } from '@bitrate/ui-react'
import { MediaImage } from '@shared/ui/MediaImage'
import {
  ISLAND_PEEK_DISTANCE,
  type IslandSkipDirection,
} from '@/widgets/MobileIsland/model/useIslandSkipGesture'

type IslandArtworkProps = {
  coverUrl: string
  /** The track a swipe is bringing in, while one is in progress. */
  direction: IslandSkipDirection | null
  label: string
  neighbourCoverUrl: string | null
  /** How far the playing cover has slid out of the ring, in px. */
  offset: number
  onExpand: () => void
}

/** Springs the cover back into the ring once the finger lets go (the design's back-out). */
const SETTLE_CLASS =
  'transition-transform duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none'

/**
 * The playing artwork in the island's gradient ring. During a swipe the cover follows the
 * finger out of the ring while the neighbour's cover slides in from the other side.
 */
export const IslandArtwork = ({
  coverUrl,
  direction,
  label,
  neighbourCoverUrl,
  offset,
  onExpand,
}: IslandArtworkProps) => {
  const isSwiping = direction !== null
  const neighbourStart =
    direction === 'next' ? ISLAND_PEEK_DISTANCE : -ISLAND_PEEK_DISTANCE

  return (
    <button
      aria-label={label}
      className="size-12.5 shrink-0 rounded-full bg-linear-135 from-magenta-500 to-primary p-px"
      onClick={onExpand}
      type="button"
    >
      <span className="flex size-full items-center justify-center rounded-full bg-card">
        <span className="relative size-10 overflow-hidden rounded-full">
          <MediaImage
            alt=""
            className={cn(
              'size-10 rounded-full object-cover',
              !isSwiping && SETTLE_CLASS,
            )}
            draggable={false}
            fallback="track"
            height={40}
            src={coverUrl}
            style={{ transform: `translateX(${offset}px)` }}
            unoptimized
            width={40}
          />
          {isSwiping && neighbourCoverUrl ? (
            <MediaImage
              alt=""
              className="absolute inset-0 size-10 rounded-full object-cover"
              draggable={false}
              fallback="track"
              height={40}
              src={neighbourCoverUrl}
              style={{
                transform: `translateX(${offset + neighbourStart}px)`,
              }}
              unoptimized
              width={40}
            />
          ) : null}
        </span>
      </span>
    </button>
  )
}
