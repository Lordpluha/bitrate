'use client'

import { useSearchParams } from 'next/navigation'
import { useBrowseCategories } from '@/entities/Discovery'
import { useUsers } from '@/entities/User'
import { useSearch } from '@/features/Search/api/client'
import { searchTypes } from '@/features/Search/model/search.constants'
import { BrowseCategoryGrid } from '@/features/Search/ui/BrowseCategoryGrid'
import { CategoryPage } from '@/features/Search/ui/CategoryPage'
import { SearchQueryState } from '@/features/Search/ui/SearchQueryState'

export const SearchPage = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const categoryTitle = searchParams.get('category')?.trim() ?? ''
  const { data: categoryData } = useBrowseCategories()
  const category = categoryData?.data.find(
    (item) =>
      item.slug.toLowerCase() === categoryTitle.toLowerCase() ||
      item.name.toLowerCase() === categoryTitle.toLowerCase(),
  )
  const searchQuery = useSearch({
    limit: 8,
    query,
    types: searchTypes,
  })
  const usersQuery = useUsers({
    limit: 4,
    username: query,
  })

  const data = searchQuery.data
  const tracks = data?.tracks ?? []
  const artists = data?.artists ?? []
  const albums = data?.albums ?? []
  const playlists = data?.playlists ?? []
  const users = usersQuery.data ?? []
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
        <div className="mx-auto w-full max-w-300">
          {hasQuery ? (
            <SearchQueryState
              data={{ albums, artists, playlists, tracks }}
              hasError={searchQuery.isError || usersQuery.isError}
              isFetching={searchQuery.isFetching || usersQuery.isFetching}
              onRetry={() => {
                void Promise.all([searchQuery.refetch(), usersQuery.refetch()])
              }}
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
