'use client'

import { BookmarkCheck, BookmarkPlus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import {
  usePodcasts,
  useSavedEpisodes,
  useUnsaveEpisode,
} from '@/entities/Podcast'
import { useAuth } from '@/shared/hooks'
import { ROUTES } from '@/shared/routes'
import { MusicCardLg } from '@/shared/ui'
import { ErrorState } from '@/shared/ui/ErrorState'
import { getEpisodeCoverUrl, getPodcastCoverUrl } from '@/shared/utils/mediaUrl'

const PODCAST_SKELETON_IDS = Array.from(
  { length: 10 },
  (_, index) => `podcast-skeleton-${index + 1}`,
)

export const PodcastsPanel = () => {
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
        aria-label="Loading podcasts"
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
        description="The podcast catalog could not be loaded."
        onRetry={() => void podcastsQuery.refetch()}
        title="Podcasts are unavailable"
      />
    )
  }

  return (
    <div className="space-y-10">
      {isAuthenticated && savedQuery.data?.data.length ? (
        <section aria-labelledby="saved-episodes-title">
          <h2 className="mb-4 text-2xl font-bold" id="saved-episodes-title">
            Your episodes
          </h2>
          <div className="space-y-2">
            {savedQuery.data.data.map((episode) => (
              <div
                className="flex min-w-0 items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface"
                key={episode.id}
              >
                <Image
                  alt=""
                  className="size-14 shrink-0 rounded object-cover"
                  height={56}
                  src={getEpisodeCoverUrl(
                    episode.cover ?? episode.podcast.cover,
                  )}
                  unoptimized
                  width={56}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text">
                    {episode.title}
                  </p>
                  <Link
                    className="truncate text-sm text-text-subdued hover:underline"
                    href={ROUTES.podcast(episode.podcastId)}
                  >
                    {episode.podcast.title}
                  </Link>
                </div>
                <button
                  aria-label={`Remove ${episode.title} from saved episodes`}
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
        <h2 className="mb-4 text-2xl font-bold" id="podcast-catalog-title">
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
          <p className="py-12 text-center text-text-subdued">
            No podcasts have been published yet.
          </p>
        )}
      </section>
    </div>
  )
}
