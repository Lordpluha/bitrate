'use client'

import { useRecommendationsFeed } from '@/entities/Discovery'
import { MediaRow, mapDiscoveryFeedItem } from '@/features/Search'
import { ErrorState } from '@/shared/ui/ErrorState'

export const RecommendationsFeed = () => {
  const recommendations = useRecommendationsFeed()

  if (recommendations.isPending) {
    return (
      <div
        aria-label="Loading recommendations"
        className="space-y-8"
        role="status"
      >
        <div className="h-56 animate-pulse rounded-md bg-surface" />
        <div className="h-56 animate-pulse rounded-md bg-surface" />
      </div>
    )
  }

  if (recommendations.isError) {
    return (
      <ErrorState
        description="Your recommendations could not be loaded."
        onRetry={() => void recommendations.refetch()}
        title="Recommendations are unavailable"
      />
    )
  }

  return (
    <div className="space-y-8">
      {recommendations.data.sections.map((section) => (
        <MediaRow
          items={section.items.map((item) =>
            mapDiscoveryFeedItem(section.id, item),
          )}
          key={section.id}
          title={section.title}
        />
      ))}
    </div>
  )
}
