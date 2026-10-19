import { FindFriendsPage } from '@views/Friends'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find friends',
}

export default function FindFriendsRoute() {
  return <FindFriendsPage />
}
