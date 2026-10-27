'use client'

import { MediaImage } from '@shared/ui/MediaImage'
import { BookmarkCheck, BookmarkPlus, Podcast } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import {
  usePodcasts,
  useSavedEpisodes,
  useUnsaveEpisode,
} from '@/entities/Podcast'
import { useAuth } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { MusicCardLg, StateMessage } from '@/shared/ui'
import { ErrorState } from '@/shared/ui/ErrorState'
import { getEpisodeCoverUrl, getPodcastCoverUrl } from '@/shared/utils/mediaUrl'

const PODCAST_SKELETON_IDS = Array.from(
  { length: 10 },
  (_, index) => `podcast-skeleton-${index + 1}`,
)

export const PodcastsPanel = () => {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const podcastsQuery = usePodcasts(1, 20)
  const savedQuery = useSavedEpisodes(1, 8, isAuthenticated)
  const unsaveEpisode = useUnsaveEpisode()
  const savedEpisodeIds = useMemo(
    () => new Set(savedQuery.data?.data.map((episode) => episode.id) ?? []),
    [savedQuery.data],
  )

  if (podcastsQuery.isPending) {
    return (
      <div
        aria-label={t('main.loadingPodcasts')}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        role="status"
      >
        {PODCAST_SKELETON_IDS.map((id) => (
          <div
            className="aspect-square animate-pulse rounded-md bg-surface"
            key={id}
          />
        ))}
      </div>
    )
  }

  if (podcastsQuery.isError) {
    return (
      <ErrorState
        description={t('main.podcastsFailed')}
        onRetry={() => void podcastsQuery.refetch()}
        title={t('main.podcastsUnavailable')}
      />
    )
  }

  return (
    <div className="space-y-10">
      {isAuthenticated && savedQuery.data?.data.length ? (
        <section aria-labelledby="saved-episodes-title">
          <h2
            className="mb-4 text-[22px] leading-[1.25] font-semibold text-foreground"
            id="saved-episodes-title"
          >
            {t('main.yourEpisodes')}
          </h2>
          <div className="space-y-2">
            {savedQuery.data.data.map((episode) => (
              <div
                className="flex min-w-0 items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface"
                key={episode.id}
              >
                <MediaImage
                  alt=""
                  className="size-14 shrink-0 rounded object-cover"
                  fallback="playlist"
                  height={56}
                  src={getEpisodeCoverUrl(
                    episode.cover ?? episode.podcast.cover,
                  )}
                  unoptimized
                  width={56}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {episode.title}
                  </p>
                  <Link
                    className="truncate text-sm text-muted-foreground hover:underline"
                    href={ROUTES.podcast(episode.podcastId)}
                  >
                    {episode.podcast.title}
                  </Link>
                </div>
                <button
                  aria-label={t('main.removeSavedEpisode', {
                    title: episode.title,
                  })}
                  className="rounded-full p-2 text-accent hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  disabled={unsaveEpisode.isPending}
                  onClick={() => unsaveEpisode.mutate(episode.id)}
                  type="button"
                >
                  {savedEpisodeIds.has(episode.id) ? (
                    <BookmarkCheck aria-hidden="true" size={22} />
                  ) : (
                    <BookmarkPlus aria-hidden="true" size={22} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="podcast-catalog-title">
        <h2
          className="mb-4 text-[22px] leading-[1.25] font-semibold text-foreground"
          id="podcast-catalog-title"
        >
          Podcasts &amp; shows
        </h2>
        {podcastsQuery.data.data.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {podcastsQuery.data.data.map((podcast) => (
              <MusicCardLg
                description={`${podcast.publisher} • ${podcast._count?.episodes ?? 0} episodes`}
                href={ROUTES.podcast(podcast.id)}
                id={podcast.id}
                imageUrl={getPodcastCoverUrl(podcast.cover)}
                key={podcast.id}
                name={podcast.title}
              />
            ))}
          </div>
        ) : (
          <StateMessage
            description={t('main.podcasts.empty')}
            icon={Podcast}
            title={t('main.podcasts.title')}
          />
        )}
      </section>
    </div>
  )
}
