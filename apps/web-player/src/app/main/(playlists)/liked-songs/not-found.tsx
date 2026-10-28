import { ROUTES } from '@shared/routes'
import { StateMessage } from '@shared/ui'
import { Heart } from 'lucide-react'

export default function LikedSongsNotFound() {
  return (
    <StateMessage
      description="You haven't liked any songs yet. Start exploring and like your favorite tracks!"
      icon={Heart}
      primary={{ href: ROUTES.main, label: 'Back to home' }}
      title="No liked songs found"
    />
  )
}
