'use client'

import { cn } from '@bitrate/ui-react'
import { CollectionSkeleton, StateMessage } from '@shared/ui'
import { MediaImage } from '@shared/ui/MediaImage'
import { Info, Podcast, SearchIcon, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  useAllSavedEpisodes,
  usePodcast,
  useSaveEpisode,
  useUnsaveEpisode,
} from '@/entities/Podcast'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { useAuth } from '@/shared/hooks'
import { ROUTES } from '@/shared/routes'
import { ErrorState } from '@/shared/ui/ErrorState'
import { getPodcastCoverUrl } from '@/shared/utils/mediaUrl'
import {
  type EpisodeFilter,
  filterEpisodes,
} from '@/views/Podcast/model/filterEpisodes'
import { EpisodeRow } from '@/views/Podcast/ui/EpisodeRow'

type PodcastPageProps = {
  podcastId: string
}

type PodcastTab = 'about' | 'episodes'

const chipClassName = (isActive: boolean) =>
  cn(
    'flex h-8 items-center rounded-full border px-3.5 text-[13px] text-foreground transition-colors',
    isActive
      ? 'border-primary bg-primary font-semibold text-primary-foreground'
      : 'border-border hover:bg-surface',
  )

const tabClassName = (isActive: boolean) =>
  cn(
    'h-9 rounded-md px-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-secondary text-foreground'
      : 'text-muted-foreground hover:bg-surface hover:text-foreground',
  )

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    showApiSuccessToast('Link copied to clipboard')
  } catch (error) {
    showApiErrorToast(error, 'Failed to copy link')
  }
}

/**
 * The design's podcast show: cover, title, publisher and facts, then Episodes (Newest / Saved
 * filters and search) and About. Following, progress and playback of episodes are concepts and
 * wait for the backend.
 */
export const PodcastPage = ({ podcastId }: PodcastPageProps) => {
  const { isAuthenticated } = useAuth()
  const podcastQuery = usePodcast(podcastId, 1, 50)
  const savedQuery = useAllSavedEpisodes(isAuthenticated)
  const saveEpisode = useSaveEpisode()
  const unsaveEpisode = useUnsaveEpisode()
  const [tab, setTab] = useState<PodcastTab>('episodes')
  const [filter, setFilter] = useState<EpisodeFilter>('newest')
  const [query, setQuery] = useState('')
  const savedIds = useMemo(
    () => new Set(savedQuery.data?.map((episode) => episode.id) ?? []),
    [savedQuery.data],
  )

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
  const episodes = filterEpisodes({
    episodes: podcast.episodes.data,
    filter,
    query,
    savedIds,
  })
  const facts = [
    `${podcast.episodes.total} ${podcast.episodes.total === 1 ? 'episode' : 'episodes'}`,
  ]

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-5 px-4 pt-2 pb-3 md:gap-7 md:px-8 md:py-6">
        <header className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3.5 md:flex-row md:items-end md:gap-7">
            <MediaImage
              alt=""
              className="size-55 shrink-0 rounded-xl object-cover shadow-2xl md:size-58"
              fallback="playlist"
              height={232}
              priority
              src={getPodcastCoverUrl(podcast.cover)}
              unoptimized
              width={232}
            />
            <div className="flex w-full min-w-0 flex-col gap-1 md:gap-2">
              <p className="text-xs font-semibold tracking-[1.2px] text-muted-foreground uppercase">
                Podcast
              </p>
              <h1 className="break-words text-2xl leading-[1.15] font-semibold md:text-[54px] md:leading-[1.05] md:font-bold">
                {podcast.title}
              </h1>
              <p className="text-sm font-semibold text-foreground">
                {podcast.publisher}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                <span>{facts.join(' · ')}</span>
                {podcast.language ? (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-foreground uppercase">
                    {podcast.language}
                  </span>
                ) : null}
                {podcast.explicit ? (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
                    Explicit
                  </span>
                ) : null}
              </div>
              {podcast.description ? (
                <p className="line-clamp-3 max-w-180 text-sm text-muted-foreground">
                  {podcast.description}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label={`Share ${podcast.title}`}
              className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              onClick={() => void copyLink()}
              type="button"
            >
              <Share2 aria-hidden="true" size={18} />
            </button>
          </div>
        </header>

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

        {tab === 'about' ? (
          <section className="flex w-full max-w-160 flex-col gap-4 rounded-[14px] border border-border bg-card p-6">
            <h2 className="text-base font-semibold">About</h2>
            {podcast.description ? (
              <p className="text-sm text-muted-foreground">
                {podcast.description}
              </p>
            ) : null}
            <dl className="flex flex-col divide-y divide-border text-sm">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">Publisher</dt>
                <dd className="font-semibold">{podcast.publisher}</dd>
              </div>
              {podcast.language ? (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">Language</dt>
                  <dd className="font-semibold uppercase">
                    {podcast.language}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">Content</dt>
                <dd className="font-semibold">
                  {podcast.explicit ? 'Explicit' : 'Clean'}
                </dd>
              </div>
            </dl>
          </section>
        ) : (
          <section aria-label="Episodes" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  aria-pressed={filter === 'newest'}
                  className={chipClassName(filter === 'newest')}
                  onClick={() => setFilter('newest')}
                  type="button"
                >
                  Newest
                </button>
                {isAuthenticated ? (
                  <button
                    aria-pressed={filter === 'saved'}
                    className={chipClassName(filter === 'saved')}
                    onClick={() => setFilter('saved')}
                    type="button"
                  >
                    Saved
                  </button>
                ) : null}
              </div>
              <label className="relative w-full md:w-65">
                <span className="sr-only">Search episodes</span>
                <SearchIcon
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  className="h-9 w-full rounded-md border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search episodes"
                  type="search"
                  value={query}
                />
              </label>
            </div>

            {query.trim() ? (
              <p className="text-[13px] text-muted-foreground" role="status">
                {episodes.length}{' '}
                {episodes.length === 1 ? 'episode' : 'episodes'} for “
                {query.trim()}”
              </p>
            ) : null}

            {podcast.episodes.data.length === 0 ? (
              <StateMessage
                className="min-h-80"
                description="New episodes will appear here."
                icon={Podcast}
                title="No episodes have been published yet."
              />
            ) : episodes.length === 0 ? (
              <StateMessage
                className="min-h-60"
                icon={Podcast}
                title={
                  filter === 'saved'
                    ? 'No saved episodes from this show yet.'
                    : 'No episodes match your search.'
                }
              />
            ) : (
              <div className="flex flex-col">
                {episodes.map((episode) => {
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
                })}
              </div>
            )}

            {isAuthenticated ? null : (
              <div className="flex items-start gap-2.5 rounded-[10px] border border-info-border bg-info-surface px-4 py-3 text-[13px] text-info-text">
                <Info
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                  size={16}
                />
                <p>
                  <span className="font-semibold">
                    Save episodes for later.{' '}
                  </span>
                  <Link
                    className="underline hover:no-underline"
                    href={ROUTES.auth.login}
                  >
                    Log in
                  </Link>{' '}
                  to keep episodes in Your episodes and pick up where you left
                  off.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
