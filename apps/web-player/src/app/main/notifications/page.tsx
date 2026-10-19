import { NotificationsPage } from '@views/Notifications'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default function NotificationsRoute() {
  return <NotificationsPage />
}
