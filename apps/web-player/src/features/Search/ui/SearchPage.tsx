'use client'

import { useSearchParams } from 'next/navigation'
import { useBrowseCategories } from '@/entities/Discovery'
import { useUsers } from '@/entities/User'
import { useSearch } from '@/features/Search/api/client'
import { searchTypes } from '@/features/Search/model/search.constants'
import type { MediaCardItem } from '@/features/Search/model/types'
import { BrowseCategoryGrid } from '@/features/Search/ui/BrowseCategoryGrid'
import { CategoryPage } from '@/features/Search/ui/CategoryPage'
import { SearchQueryState } from '@/features/Search/ui/SearchQueryState'

type SearchPageProps = {
  /** Starts a playable card (album, playlist, track) in place. */
  onPlayItem?: (item: MediaCardItem) => void
}

export const SearchPage = ({ onPlayItem }: SearchPageProps) => {
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
      <div className="flex h-full flex-1 flex-col overflow-y-auto custom-scrollbar">
        <CategoryPage category={category} onPlayItem={onPlayItem} />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto custom-scrollbar">
      <div className="flex flex-1 flex-col px-4 pt-2 pb-3 md:px-8 md:py-6">
        <div className="flex w-full flex-1 flex-col">
          {hasQuery ? (
            <SearchQueryState
              data={{
                albums,
                artists,
                playlists,
                topResult: data?.topResult ?? null,
                tracks,
              }}
              hasError={searchQuery.isError || usersQuery.isError}
              isFetching={searchQuery.isFetching || usersQuery.isFetching}
              onPlayItem={onPlayItem}
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
