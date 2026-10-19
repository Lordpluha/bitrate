import { ActivityPage } from '@views/Activity'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Activity',
}

export default function ActivityRoute() {
  return <ActivityPage />
}
