'use client'

import { cn } from '@bitrate/ui-react'
import { CollectionSkeleton } from '@shared/ui'
import { useState } from 'react'
import { usePodcast } from '@/entities/Podcast'
import { useAuth } from '@/shared/hooks'
import { ErrorState } from '@/shared/ui/ErrorState'
import { EpisodesSection } from '@/views/Podcast/ui/EpisodesSection'
import { PodcastAbout } from '@/views/Podcast/ui/PodcastAbout'
import { PodcastHeader } from '@/views/Podcast/ui/PodcastHeader'

type PodcastPageProps = {
  podcastId: string
}

type PodcastTab = 'about' | 'episodes'

const tabClassName = (isActive: boolean) =>
  cn(
    'h-9 rounded-md px-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-secondary text-foreground'
      : 'text-muted-foreground hover:bg-surface hover:text-foreground',
  )

/**
 * The design's podcast show: cover, title, publisher and facts, then Episodes (Newest / Saved
 * filters and search) and About. Following, progress and playback of episodes are concepts and
 * wait for the backend.
 */
export const PodcastPage = ({ podcastId }: PodcastPageProps) => {
  const { isAuthenticated } = useAuth()
  /** Only the show and its unfiltered episode total; the Episodes tab pages the episodes. */
  const podcastQuery = usePodcast(podcastId, 1, 1)
  const [tab, setTab] = useState<PodcastTab>('episodes')

  if (podcastQuery.isPending) {
    return (
      <div className="h-full overflow-hidden px-4 pt-2 md:px-8 md:py-6">
        <CollectionSkeleton label="Loading podcast" />
      </div>
    )
  }

  if (podcastQuery.isError) {
    return (
      <ErrorState
        description="This podcast may have been removed or is temporarily unavailable."
        onRetry={() => void podcastQuery.refetch()}
        title="Podcast not found"
      />
    )
  }

  const podcast = podcastQuery.data

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-5 px-4 pt-2 pb-3 md:gap-7 md:px-8 md:py-6">
        <PodcastHeader podcast={podcast} />

        <div
          aria-label="Podcast sections"
          className="flex gap-1"
          role="tablist"
        >
          {(['episodes', 'about'] as const).map((id) => (
            <button
              aria-selected={tab === id}
              className={tabClassName(tab === id)}
              key={id}
              onClick={() => setTab(id)}
              role="tab"
              type="button"
            >
              {id === 'episodes' ? 'Episodes' : 'About'}
            </button>
          ))}
        </div>

        {tab === 'about' ? <PodcastAbout podcast={podcast} /> : null}
        {/* Hidden, not unmounted, so the chosen filter and search survive a visit to About. */}
        <div hidden={tab !== 'episodes'}>
          <EpisodesSection
            isAuthenticated={isAuthenticated}
            podcast={podcast}
          />
        </div>
      </div>
    </div>
  )
}
