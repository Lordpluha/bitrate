import { FriendsPage } from '@views/Friends'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Friends',
}

export default function FriendsRoute() {
  return <FriendsPage />
}
