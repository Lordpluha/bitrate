import { StateMessage } from '@shared/ui'
import { Library } from 'lucide-react'
import type { ReactNode } from 'react'
import { ROUTES } from '@/shared/routes'

/** The design's empty library: nothing saved yet, with a way to go and find music. */
export const LibraryEmptyState = () => (
  <StateMessage
    className="min-h-80"
    description="Save playlists, albums and tracks and they will appear here."
    icon={Library}
    primary={{ href: ROUTES.search(), label: 'Find something to play' }}
    title="Nothing here yet"
  />
)

type LibraryListEmptyAwareProps = {
  children: ReactNode
  isEmpty: boolean
}

export const LibraryListEmptyAware = ({
  children,
  isEmpty,
}: LibraryListEmptyAwareProps) => {
  if (isEmpty) return <LibraryEmptyState />

  return <div className="flex flex-col">{children}</div>
}
