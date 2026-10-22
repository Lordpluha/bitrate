import { cn } from '@bitrate/ui-react'
import { Skeleton } from '@/shared/ui/Skeleton'

type ListSkeletonProps = {
  className?: string
  /** Announced while the list loads, e.g. "Loading friends". */
  label: string
  rows: number
  /** Height of each placeholder row. */
  rowClassName?: string
}

/** Placeholder rows for a list that is still loading. */
export const ListSkeleton = ({
  className,
  label,
  rows,
  rowClassName = 'h-16',
}: ListSkeletonProps) => (
  <div
    aria-label={label}
    className={cn('flex flex-col gap-2', className)}
    role="status"
  >
    {Array.from({ length: rows }, (_, row) => `skeleton-row-${row}`).map(
      (key) => (
        <Skeleton className={cn('rounded-[10px]', rowClassName)} key={key} />
      ),
    )}
  </div>
)
