import { cn } from '@bitrate/ui-react'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('artist-skeleton rounded-md', className)}
    />
  )
}
