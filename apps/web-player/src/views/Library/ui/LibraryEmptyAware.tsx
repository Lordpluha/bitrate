import { cn } from '@spotify/ui-react'
import type { ReactNode } from 'react'

type LibraryEmptyAwareProps = {
  children: ReactNode
  className?: string
  isEmpty: boolean
}

const LibraryEmptyState = () => (
  <div className="rounded-lg bg-surface p-6 text-text-subdued">
    Nothing here yet.
  </div>
)

export const LibraryGridEmptyAware = ({
  children,
  className,
  isEmpty,
}: LibraryEmptyAwareProps) => {
  if (isEmpty) return <LibraryEmptyState />

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-1 xl:grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] xl:gap-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

export const LibraryListEmptyAware = ({
  children,
  isEmpty,
}: LibraryEmptyAwareProps) => {
  if (isEmpty) return <LibraryEmptyState />

  return <div className="space-y-1">{children}</div>
}
