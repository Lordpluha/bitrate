'use client'

import {
  type BrowseCategoryResponse,
  useCategoryPlaylists,
  useCharts,
  useRecommendationsFeed,
} from '@/entities/Discovery'
import {
  mapDiscoveryFeedItem,
  mapDiscoveryPlaylist,
  mapDiscoveryTrack,
} from '@/features/Search/lib/mapDiscoveryFeed'
import { MediaRow } from '@/features/Search/ui/MediaRow'
import { ErrorState } from '@/shared/ui/ErrorState'

type CategoryPageProps = {
  category: BrowseCategoryResponse
}

const CATEGORY_SECTION_SKELETON_IDS = [
  'category-section-skeleton-1',
  'category-section-skeleton-2',
  'category-section-skeleton-3',
] as const

export const CategoryPage = ({ category }: CategoryPageProps) => {
  const playlistsQuery = useCategoryPlaylists(category.slug, 1, 20)
  const chartsQuery = useCharts('global', 1, 20)
  const feedQuery = useRecommendationsFeed()

  if (
    playlistsQuery.isPending ||
    chartsQuery.isPending ||
    feedQuery.isPending
  ) {
    return (
      <div
        aria-label={`Loading ${category.name}`}
        className="min-h-full animate-pulse bg-background-secondary"
        role="status"
      >
        <div className="h-72 bg-surface" />
        <div className="mx-auto max-w-290 space-y-10 px-6 py-8">
          {CATEGORY_SECTION_SKELETON_IDS.map((skeletonId) => (
            <div className="h-56 rounded-lg bg-surface" key={skeletonId} />
          ))}
        </div>
      </div>
    )
  }

  if (playlistsQuery.isError || chartsQuery.isError || feedQuery.isError) {
    return (
      <ErrorState
        description="This category could not be loaded from the server."
        onRetry={() => {
          void Promise.all([
            playlistsQuery.refetch(),
            chartsQuery.refetch(),
            feedQuery.refetch(),
          ])
        }}
        title={`${category.name} is unavailable`}
      />
    )
  }

  const playlistItems = playlistsQuery.data.data.map(mapDiscoveryPlaylist)
  const chartItems = chartsQuery.data.data.map(mapDiscoveryTrack)
  const feedSections = feedQuery.data.sections.map((section) => ({
    ...section,
    items: section.items.map((item) => mapDiscoveryFeedItem(section.id, item)),
  }))
  const color = category.color ?? 'var(--color-surface)'

  return (
    <div
      className="min-h-full bg-background-secondary"
      style={{
        background: `linear-gradient(180deg, ${color} 0px, color-mix(in oklab, ${color} 72%, var(--color-background-secondary)) 260px, var(--color-background-secondary) 520px)`,
      }}
    >
      <section className="flex min-h-56 items-end px-4 pb-8 pt-20 sm:min-h-64 sm:px-6 sm:pb-10 sm:pt-24 lg:min-h-75">
        <div className="mx-auto w-full max-w-290">
          <h1 className="text-4xl font-black tracking-normal text-white sm:text-5xl lg:text-7xl">
            {category.name}
          </h1>
          {category.description ? (
            <p className="mt-3 max-w-160 text-sm text-white/75 sm:text-base">
              {category.description}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto w-full max-w-290 space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-8">
        <MediaRow items={playlistItems} title={`Popular ${category.name}`} />
        {feedSections.map((section) => (
          <MediaRow
            items={section.items}
            key={section.id}
            title={section.title}
          />
        ))}
        <MediaRow items={chartItems} title="Featured charts" />
      </div>
    </div>
  )
}
