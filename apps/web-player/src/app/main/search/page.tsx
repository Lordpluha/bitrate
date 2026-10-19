import { SearchView } from '@views/Search'
import type { Metadata } from 'next'
import { Suspense } from 'react'
export const metadata: Metadata = {
  title: 'Search',
}

export default function Search() {
  /* SearchPage reads the URL with useSearchParams: the boundary keeps the rest of the page prerendered */
  return (
    <Suspense fallback={null}>
      <SearchView />
    </Suspense>
  )
}
