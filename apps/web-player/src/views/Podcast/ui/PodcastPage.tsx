'use client'

import {
  CollectionSkeleton,
  type SegmentedTab,
  SegmentedTabs,
} from '@shared/ui'
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

const TABS: ReadonlyArray<SegmentedTab<PodcastTab>> = [
  { id: 'episodes', label: 'Episodes' },
  { id: 'about', label: 'About' },
]

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

        <SegmentedTabs
          ariaLabel="Podcast sections"
          onChange={setTab}
          tabs={TABS}
          value={tab}
        />

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
