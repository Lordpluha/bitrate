import { ChartsPage } from '@views/Charts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Charts',
}

export default function ChartsRoute() {
  return <ChartsPage />
}
