'use client'

import {
  CollectionSkeleton,
  type SegmentedTab,
  SegmentedTabs,
} from '@shared/ui'
import { useState } from 'react'
import { usePodcast } from '@/entities/Podcast'
import { useAuth } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
import { ErrorState } from '@/shared/ui/ErrorState'
import { EpisodesSection } from '@/views/Podcast/ui/EpisodesSection'
import { PodcastAbout } from '@/views/Podcast/ui/PodcastAbout'
import { PodcastHeader } from '@/views/Podcast/ui/PodcastHeader'

type PodcastPageProps = {
  podcastId: string
}

type PodcastTab = 'about' | 'episodes'

/**
 * The design's podcast show: cover, title, publisher and facts, then Episodes (Newest / Saved
 * filters and search) and About. Following, progress and playback of episodes are concepts and
 * wait for the backend.
 */
export const PodcastPage = ({ podcastId }: PodcastPageProps) => {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  /** Only the show and its unfiltered episode total; the Episodes tab pages the episodes. */
  const podcastQuery = usePodcast(podcastId, 1, 1)
  const [tab, setTab] = useState<PodcastTab>('episodes')

  if (podcastQuery.isPending) {
    return (
      <div className="h-full overflow-hidden px-4 pt-2 md:px-8 md:py-6">
        <CollectionSkeleton label={t('podcast.loading')} />
      </div>
    )
  }

  if (podcastQuery.isError) {
    return (
      <ErrorState
        description={t('podcast.notFoundDescription')}
        onRetry={() => void podcastQuery.refetch()}
        title={t('podcast.notFound')}
      />
    )
  }

  const podcast = podcastQuery.data
  const tabs: SegmentedTab<PodcastTab>[] = [
    { id: 'episodes', label: t('podcast.episodes') },
    { id: 'about', label: t('podcast.about') },
  ]

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto custom-scrollbar">
      <div className="flex flex-1 flex-col gap-5 px-4 pt-2 pb-3 md:gap-7 md:px-8 md:py-6">
        <PodcastHeader podcast={podcast} />

        <SegmentedTabs
          ariaLabel={t('podcast.sections')}
          onChange={setTab}
          tabs={tabs}
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
