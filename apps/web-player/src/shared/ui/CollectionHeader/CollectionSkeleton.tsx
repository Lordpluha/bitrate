import { Skeleton, TrackRowSkeleton } from '@shared/ui/Skeleton'

/** How many skeleton rows stand in for the track table while a collection loads. */
const SKELETON_ROWS = 10
const SKELETON_KEYS = Array.from(
  { length: SKELETON_ROWS },
  (_, row) => `track-skeleton-${row}`,
)

type CollectionSkeletonProps = {
  /** Announced to assistive technology, e.g. "Loading playlist". */
  label: string
}

/** The design's collection loading frame: the header's cover and copy, then the track table. */
export const CollectionSkeleton = ({ label }: CollectionSkeletonProps) => (
  <div aria-label={label} className="flex flex-col gap-6" role="status">
    <span className="sr-only">{label}...</span>
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
      <Skeleton className="size-55 rounded-xl md:size-50" />
      <div className="flex w-full flex-1 flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-3/5" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
    <div className="flex flex-col gap-1">
      <div className="h-9 border-b border-border max-[1024px]:hidden" />
      {SKELETON_KEYS.map((key) => (
        <TrackRowSkeleton key={key} />
      ))}
    </div>
  </div>
)
