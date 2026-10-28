'use client'

import { CollectionHeader, Skeleton, StateMessage } from '@shared/ui'
import { Music } from 'lucide-react'
import {
  type BrowseCategoryResponse,
  useCategoryPlaylists,
  useCharts,
} from '@/entities/Discovery'
import {
  mapDiscoveryPlaylist,
  mapDiscoveryTrack,
} from '@/features/Search/lib/mapDiscoveryFeed'
import type { MediaCardItem } from '@/features/Search/model/types'
import { MediaRow } from '@/features/Search/ui/MediaRow'
import { ErrorState } from '@/shared/ui/ErrorState'

type CategoryPageProps = {
  category: BrowseCategoryResponse
  onPlayItem?: (item: MediaCardItem) => void
}

const CATEGORY_SECTION_SKELETON_IDS = [
  'category-section-skeleton-1',
  'category-section-skeleton-2',
  'category-section-skeleton-3',
] as const

export const CategoryPage = ({ category, onPlayItem }: CategoryPageProps) => {
  const playlistsQuery = useCategoryPlaylists(category.slug, 1, 20)
  /* this genre's own chart; the category shows nothing that is not about it */
  const chartsQuery = useCharts({ genre: category.slug, limit: 20 })

  if (playlistsQuery.isPending || chartsQuery.isPending) {
    return (
      <div
        aria-label={`Loading ${category.name}`}
        className="flex flex-1 flex-col gap-7 px-4 pt-2 pb-3 md:px-8 md:py-6"
        role="status"
      >
        <Skeleton className="h-40 rounded-2xl md:h-65" />
        {CATEGORY_SECTION_SKELETON_IDS.map((skeletonId) => (
          <Skeleton className="h-56 rounded-[14px]" key={skeletonId} />
        ))}
      </div>
    )
  }

  if (playlistsQuery.isError || chartsQuery.isError) {
    return (
      <ErrorState
        description="This category could not be loaded from the server."
        onRetry={() => {
          void Promise.all([playlistsQuery.refetch(), chartsQuery.refetch()])
        }}
        title={`${category.name} is unavailable`}
      />
    )
  }

  const playlistItems = playlistsQuery.data.data.map(mapDiscoveryPlaylist)
  const chartItems = chartsQuery.data.data.map(mapDiscoveryTrack)
  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-2 pb-3 md:gap-7 md:px-8 md:py-6">
      <CollectionHeader
        meta={[
          category.description ?? `Popular ${category.name} · Featured charts`,
        ]}
        title={category.name}
        type="Category"
        washColor={category.color ?? undefined}
      />
      <MediaRow
        items={playlistItems}
        onPlayItem={onPlayItem}
        title={`Popular ${category.name}`}
      />
      <MediaRow
        items={chartItems}
        onPlayItem={onPlayItem}
        title={`Top ${category.name} tracks`}
      />
      {playlistItems.length === 0 && chartItems.length === 0 ? (
        <StateMessage
          className="min-h-80"
          description="Playlists and tracks appear here as people add and play them."
          icon={Music}
          title={`Nothing in ${category.name} yet`}
        />
      ) : null}
    </div>
  )
}
