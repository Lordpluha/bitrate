'use client'

import { useSearchParams } from 'next/navigation'
import { useUsers } from '@/entities/User'
import { useSearch } from '@/features/Search/api/client'
import {
  browseCategories,
  searchTypes,
} from '@/features/Search/model/search.constants'
import { BrowseCategoryGrid } from '@/features/Search/ui/BrowseCategoryGrid'
import { CategoryPage } from '@/features/Search/ui/CategoryPage'
import { SearchQueryState } from '@/features/Search/ui/SearchQueryState'

export const SearchPage = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const categoryTitle = searchParams.get('category')?.trim() ?? ''
  const category = browseCategories.find(
    (item) => item.title.toLowerCase() === categoryTitle.toLowerCase(),
  )
  const { data, isFetching } = useSearch({
    limit: 8,
    query,
    types: searchTypes,
  })
  const { data: usersData, isFetching: areUsersFetching } = useUsers({
    limit: 4,
    username: query,
  })

  const tracks = data?.tracks ?? []
  const albums = data?.albums ?? []
  const playlists = data?.playlists ?? []
  const users = usersData ?? []
  const hasQuery = query.length > 0

  if (category && !hasQuery) {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar">
        <CategoryPage category={category} />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="px-4 py-6 sm:px-6 sm:py-10 xl:py-14">
        <div className="mx-auto w-full max-w-[1200px]">
          {hasQuery ? (
            <SearchQueryState
              data={{ albums, playlists, tracks }}
              isFetching={isFetching || areUsersFetching}
              query={query}
              users={users}
            />
          ) : (
            <BrowseCategoryGrid />
          )}
        </div>
      </div>
    </div>
  )
}
