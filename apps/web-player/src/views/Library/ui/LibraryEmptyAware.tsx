import { StateMessage } from '@shared/ui'
import { LibraryBig } from 'lucide-react'
import { ROUTES } from '@/shared/routes'

/** The design's empty library: nothing saved yet, with a way to create the first playlist. */
export const LibraryEmptyState = () => (
  <StateMessage
    className="min-h-80"
    description="Playlists you create and albums you save will show up here."
    icon={LibraryBig}
    primary={{ href: ROUTES.createPlaylist, label: 'Create playlist' }}
    title="Nothing here yet."
  />
)
