import { LibraryPage } from '@views/Library'
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Your Library',
}

export default function LibraryRoute() {
  return <LibraryPage />
}
