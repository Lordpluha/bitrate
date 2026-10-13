import { LibraryPage } from '@views/Library'
import type { Metadata } from 'next'
import { Suspense } from 'react'
export const metadata: Metadata = {
  title: 'Your Library',
}

export default function LibraryRoute() {
  /* LibraryPage reads the URL with useSearchParams: the boundary keeps the rest of the page prerendered */
  return (
    <Suspense fallback={null}>
      <LibraryPage />
    </Suspense>
  )
}
