import { Skeleton } from '@shared/ui'

export default function Loading() {
  return (
    <div
      aria-label="Loading profile"
      className="flex h-full flex-col gap-7 px-4 pt-2 md:px-8 md:py-6"
      role="status"
    >
      <div className="flex items-end gap-7 md:py-7">
        <Skeleton className="size-22 rounded-full md:size-45" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-1/2 md:h-16" />
        </div>
      </div>
      <Skeleton className="h-64 rounded-[14px]" />
    </div>
  )
}
