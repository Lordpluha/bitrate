import { FriendRequestsPage } from '@views/Friends'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Friend requests',
}

export default function FriendRequestsRoute() {
  return <FriendRequestsPage />
}
