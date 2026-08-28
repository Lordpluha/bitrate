'use client'

import { cn } from '@spotify/ui-react'
import { BookmarkCheck, BookmarkPlus } from 'lucide-react'
import Image from 'next/image'
import { useMemo } from 'react'
import {
  type Episode,
  useAllSavedEpisodes,
  usePodcast,
  useSaveEpisode,
  useUnsaveEpisode,
} from '@/entities/Podcast'
import { useAuth } from '@/shared/hooks'
import { ErrorState } from '@/shared/ui/ErrorState'
import { getEpisodeCoverUrl, getPodcastCoverUrl } from '@/shared/utils/mediaUrl'

type PodcastPageProps = {
  podcastId: string
}

const formatDuration = (duration: number | null) => {
  if (!duration) return null
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const EpisodeRow = ({
  episode,
  isSaved,
  onToggleSaved,
}: {
  episode: Episode
  isSaved: boolean
  onToggleSaved?: () => void
}) => (
  <article className="flex gap-4 border-b border-white/10 py-5 last:border-0">
    <Image
      alt=""
      className="size-24 shrink-0 rounded-md object-cover sm:size-28"
      height={112}
      src={getEpisodeCoverUrl(episode.cover)}
      unoptimized
      width={112}
    />
    <div className="min-w-0 flex-1">
      <h2 className="font-bold text-text">{episode.title}</h2>
      {episode.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-text-subdued">
          {episode.description}
        </p>
      ) : null}
      <div className="mt-3 flex items-center gap-3 text-xs text-text-subdued">
        {episode.releaseDate ? (
          <time dateTime={episode.releaseDate}>
            {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
              new Date(episode.releaseDate),
            )}
          </time>
        ) : null}
        {formatDuration(episode.duration) ? (
          <span>{formatDuration(episode.duration)}</span>
        ) : null}
      </div>
    </div>
    {onToggleSaved ? (
      <button
        aria-label={`${isSaved ? 'Remove' : 'Save'} ${episode.title}`}
        className={cn(
          'self-center rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          isSaved ? 'text-accent' : 'text-text-subdued hover:text-text',
        )}
        onClick={onToggleSaved}
        type="button"
      >
        {isSaved ? (
          <BookmarkCheck aria-hidden="true" size={24} />
        ) : (
          <BookmarkPlus aria-hidden="true" size={24} />
        )}
      </button>
    ) : null}
  </article>
)

export const PodcastPage = ({ podcastId }: PodcastPageProps) => {
  const { isAuthenticated } = useAuth()
  const podcastQuery = usePodcast(podcastId, 1, 50)
  const savedQuery = useAllSavedEpisodes(isAuthenticated)
  const saveEpisode = useSaveEpisode()
  const unsaveEpisode = useUnsaveEpisode()
  const savedIds = useMemo(
    () => new Set(savedQuery.data?.map((episode) => episode.id) ?? []),
    [savedQuery.data],
  )

  if (podcastQuery.isPending) {
    return <div className="h-full animate-pulse bg-background-secondary" />
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
    <div className="h-full overflow-y-auto bg-background-secondary custom-scrollbar">
      <header className="flex flex-col gap-6 bg-linear-to-b from-surface to-background-secondary px-5 pb-8 pt-12 sm:flex-row sm:items-end sm:px-8">
        <Image
          alt={`${podcast.title} cover`}
          className="aspect-square w-full max-w-55 rounded-md object-cover shadow-2xl"
          height={220}
          src={getPodcastCoverUrl(podcast.cover)}
          unoptimized
          width={220}
        />
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase">Podcast</p>
          <h1 className="mt-2 text-4xl font-black text-text sm:text-5xl lg:text-6xl">
            {podcast.title}
          </h1>
          <p className="mt-3 font-semibold text-text">{podcast.publisher}</p>
          {podcast.description ? (
            <p className="mt-3 max-w-180 text-sm text-text-subdued">
              {podcast.description}
            </p>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-240 px-5 py-8 sm:px-8">
        <h2 className="mb-2 text-2xl font-bold text-text">All episodes</h2>
        {podcast.episodes.data.length ? (
          podcast.episodes.data.map((episode) => {
            const isSaved = savedIds.has(episode.id)
            return (
              <EpisodeRow
                episode={episode}
                isSaved={isSaved}
                key={episode.id}
                onToggleSaved={
                  isAuthenticated
                    ? () =>
                        isSaved
                          ? unsaveEpisode.mutate(episode.id)
                          : saveEpisode.mutate(episode.id)
                    : undefined
                }
              />
            )
          })
        ) : (
          <p className="py-16 text-center text-text-subdued">
            No episodes have been published yet.
          </p>
        )}
      </section>
    </div>
  )
}
