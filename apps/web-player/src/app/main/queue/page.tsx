import { QueuePage } from '@views/Queue'
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Queue',
}

export default function QueueRoute() {
  return <QueuePage />
}
