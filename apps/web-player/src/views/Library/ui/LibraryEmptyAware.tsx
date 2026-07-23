import type { ReactNode } from 'react'

type LibraryEmptyAwareProps = {
  children: ReactNode
  isEmpty: boolean
}

const LibraryEmptyState = () => (
  <div className="rounded-lg bg-surface p-6 text-text-subdued">
    Nothing here yet.
  </div>
)

export const LibraryGridEmptyAware = ({
  children,
  isEmpty,
}: LibraryEmptyAwareProps) => {
  if (isEmpty) return <LibraryEmptyState />

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
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
