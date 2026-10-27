'use client'

import { Button } from '@bitrate/ui-react'
import { FilterChips, SearchField, Skeleton, StateMessage } from '@shared/ui'
import { Info, Podcast } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { PodcastDetail } from '@/entities/Podcast'
import { useToggleSavedEpisode } from '@/features/SaveEpisode'
import { ROUTES } from '@/shared/routes'
import type { EpisodeFilter } from '@/views/Podcast/model/filterEpisodes'
import { useEpisodeResults } from '@/views/Podcast/model/useEpisodeResults'
import { EpisodeRow } from '@/views/Podcast/ui/EpisodeRow'

type EpisodesSectionProps = {
  isAuthenticated: boolean
  podcast: PodcastDetail
}

const EpisodeListSkeleton = () => (
  <div
    aria-busy="true"
    aria-label="Loading episodes"
    className="flex flex-col"
    role="status"
  >
    {[0, 1, 2].map((row) => (
      <div className="flex items-start gap-4 py-4" key={row}>
        <Skeleton className="size-18 shrink-0 rounded-md" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
    ))}
  </div>
)

const LoginHint = () => (
  <div className="flex items-start gap-2.5 rounded-[10px] border border-info-border bg-info-surface px-4 py-3 text-[13px] text-info-text">
    <Info aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
    <p>
      <span className="font-semibold">Save episodes for later. </span>
      <Link className="underline hover:no-underline" href={ROUTES.auth.login}>
        Log in
      </Link>{' '}
      to keep episodes in Your episodes and pick up where you left off.
    </p>
  </div>
)

/** The Episodes tab: Newest / Saved chips, search, the episode list with paging, and saving. */
export const EpisodesSection = ({
  isAuthenticated,
  podcast,
}: EpisodesSectionProps) => {
  const [filter, setFilter] = useState<EpisodeFilter>('newest')
  const [query, setQuery] = useState('')
  const results = useEpisodeResults({
    filter,
    isAuthenticated,
    podcastId: podcast.id,
    query,
  })
  const toggleSaved = useToggleSavedEpisode({ podcast })

  const renderList = () => {
    if (podcast.episodes.total === 0) {
      return (
        <StateMessage
          className="min-h-80"
          description="New episodes will appear here."
          icon={Podcast}
          title="No episodes have been published yet."
        />
      )
    }
    if (results.isPending) return <EpisodeListSkeleton />
    if (results.isError) {
      return (
        <StateMessage
          className="min-h-60"
          description="Check your connection and try again."
          icon={Podcast}
          primary={{ label: 'Try again', onClick: results.retry }}
          title="Episodes couldn’t load."
          tone="error"
        />
      )
    }
    if (results.episodes.length === 0) {
      return (
        <StateMessage
          className="min-h-60"
          icon={Podcast}
          title={
            filter === 'saved' && !query.trim()
              ? 'No saved episodes from this show yet.'
              : 'No episodes match your search.'
          }
        />
      )
    }

    return (
      <div aria-busy={results.isStale} className="flex flex-col">
        {results.episodes.map((episode) => {
          const isSaved = results.savedIds.has(episode.id)
          return (
            <EpisodeRow
              episode={episode}
              isSaved={isSaved}
              key={episode.id}
              onToggleSaved={
                isAuthenticated
                  ? () => toggleSaved({ episode, isSaved })
                  : undefined
              }
            />
          )
        })}
      </div>
    )
  }

  return (
    <section aria-label="Episodes" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          ariaLabel="Episodes"
          chips={
            isAuthenticated
              ? [
                  { id: 'newest', label: 'Newest' },
                  { id: 'saved', label: 'Saved' },
                ]
              : [{ id: 'newest', label: 'Newest' }]
          }
          onChange={setFilter}
          value={filter}
        />
        <SearchField
          className="w-full md:w-65"
          label="Search episodes"
          onChange={setQuery}
          placeholder="Search episodes"
          value={query}
        />
      </div>

      {results.searchedQuery && !results.isPending && !results.isError ? (
        <p className="text-[13px] text-muted-foreground" role="status">
          {results.total} {results.total === 1 ? 'episode' : 'episodes'} for “
          {results.searchedQuery}”
        </p>
      ) : null}

      {renderList()}

      {results.hasMore ? (
        <Button
          className="self-center"
          disabled={results.isLoadingMore}
          onClick={results.loadMore}
          variant="outline"
        >
          {results.isLoadingMore ? 'Loading episodes…' : 'Load more episodes'}
        </Button>
      ) : null}

      {isAuthenticated ? null : <LoginHint />}
    </section>
  )
}
