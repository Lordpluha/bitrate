import { RecentsPage } from '@views/Recents'
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Recently played',
}

export default function RecentsRoute() {
  return <RecentsPage />
}
