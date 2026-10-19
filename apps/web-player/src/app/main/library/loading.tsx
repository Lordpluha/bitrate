import { Skeleton } from '@shared/ui'

/** Placeholder cards while the library loads: two rows of the five-column grid. */
const CARD_KEYS = Array.from(
  { length: 10 },
  (_, card) => `library-card-${card}`,
)

export default function Loading() {
  return (
    <div
      aria-label="Loading library"
      className="flex flex-col gap-7 px-4 pt-2 md:px-8 md:py-6"
      role="status"
    >
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5.5">
        {CARD_KEYS.map((key) => (
          <Skeleton className="aspect-[4/5] rounded-[14px]" key={key} />
        ))}
      </div>
    </div>
  )
}
