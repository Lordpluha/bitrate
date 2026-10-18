import { Skeleton } from '@shared/ui'

/** Placeholder genre tiles while search loads: the five-column browse grid. */
const TILE_KEYS = Array.from({ length: 10 }, (_, tile) => `genre-tile-${tile}`)

export default function Loading() {
  return (
    <div
      aria-label="Loading search"
      className="flex flex-col gap-7 px-4 pt-2 md:px-8 md:py-6"
      role="status"
    >
      <Skeleton className="h-8 w-40 md:h-10" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {TILE_KEYS.map((key) => (
          <Skeleton className="h-24 rounded-xl sm:h-30" key={key} />
        ))}
      </div>
    </div>
  )
}
