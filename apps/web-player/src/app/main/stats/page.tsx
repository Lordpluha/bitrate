import { StatsPage } from '@views/Stats'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your listening',
}

export default function StatsRoute() {
  return <StatsPage />
}
