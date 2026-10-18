'use client'

import { useRecommendationsFeed } from '@/entities/Discovery'
import { usePlayCollection } from '@/features/PlayCollection'
import { MediaRow, mapDiscoveryFeedItem } from '@/features/Search'
import { ErrorState } from '@/shared/ui/ErrorState'

export const RecommendationsFeed = () => {
  const recommendations = useRecommendationsFeed()
  const playCollection = usePlayCollection()

  if (recommendations.isPending) {
    return (
      <div
        aria-label="Loading recommendations"
        className="flex flex-col gap-7"
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
    <div className="flex flex-col gap-7">
      {recommendations.data.sections.map((section) => (
        <MediaRow
          items={section.items.map((item) =>
            mapDiscoveryFeedItem(section.id, item),
          )}
          key={section.id}
          onPlayItem={(item) => {
            if (!item.playKind) return
            void playCollection({
              id: item.id,
              kind: item.playKind,
              title: item.title,
            })
          }}
          title={section.title}
        />
      ))}
    </div>
  )
}
