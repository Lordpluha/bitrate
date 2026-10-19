import { cn } from '@bitrate/ui-react'

type SkeletonProps = {
  className?: string
}

/** The design system's Skeleton/Line: a placeholder block that pulses unless motion is reduced. */
export const Skeleton = ({ className }: SkeletonProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'block rounded bg-border motion-safe:animate-pulse',
      className,
    )}
  />
)

/** The design's Skeleton/Track Row: number, cover, title and artist, and the duration. */
export const TrackRowSkeleton = () => (
  <span className="flex h-14 items-center gap-4 px-4 max-[1024px]:px-0">
    <Skeleton className="h-3 w-4 max-[1024px]:hidden" />
    <Skeleton className="size-10 shrink-0 rounded-md max-[1024px]:size-12" />
    <span className="flex min-w-0 flex-1 flex-col gap-2">
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="h-2.5 w-1/4" />
    </span>
    <Skeleton className="h-3 w-10" />
  </span>
)
