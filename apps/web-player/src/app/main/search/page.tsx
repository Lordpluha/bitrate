import { SearchPage } from '@features/Search'
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Search',
}

export default function Search() {
  return <SearchPage />
}
