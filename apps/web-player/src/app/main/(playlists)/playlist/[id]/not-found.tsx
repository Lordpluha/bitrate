import { ROUTES } from '@shared/routes'
import { StateMessage } from '@shared/ui'
import { Music } from 'lucide-react'

export default function PlaylistNotFound() {
  return (
    <StateMessage
      description="This playlist may have been removed, or the link is incorrect."
      icon={Music}
      primary={{ href: ROUTES.main, label: 'Back to home' }}
      title="Playlist not found"
    />
  )
}
