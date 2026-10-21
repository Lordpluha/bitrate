'use client'

import {
  type Episode,
  useAllSavedEpisodes,
  usePodcastEpisodes,
} from '@/entities/Podcast'
import { useDebouncedValue } from '@/shared/hooks'
import {
  type EpisodeFilter,
  filterSavedEpisodes,
} from '@/views/Podcast/model/filterEpisodes'

const SEARCH_DEBOUNCE_MS = 300

type UseEpisodeResultsInput = {
  filter: EpisodeFilter
  isAuthenticated: boolean
  podcastId: string
  /** The search as typed; Newest sends it to the server once typing pauses. */
  query: string
}

type EpisodeResults = {
  episodes: Episode[]
  /** Paging, only for Newest: Saved already holds the whole library. */
  hasMore: boolean
  isError: boolean
  isLoadingMore: boolean
  isPending: boolean
  /** The previous search's episodes are still shown while the next one loads. */
  isStale: boolean
  loadMore: () => void
  retry: () => void
  savedIds: ReadonlySet<string>
  /** How many episodes match `searchedQuery`, across every page. */
  total: number
  /** The search the shown episodes answer; empty when none. */
  searchedQuery: string
}

/**
 * The podcast page's episode list: Newest pages and searches on the server, Saved narrows the
 * listener's whole saved library in the browser.
 */
export const useEpisodeResults = ({
  filter,
  isAuthenticated,
  podcastId,
  query,
}: UseEpisodeResultsInput): EpisodeResults => {
  const trimmedQuery = query.trim()
  const debouncedQuery = useDebouncedValue({
    delayMs: SEARCH_DEBOUNCE_MS,
    value: trimmedQuery,
  })
  const newestQuery = usePodcastEpisodes({ podcastId, query: debouncedQuery })
  const savedQuery = useAllSavedEpisodes(isAuthenticated)
  const savedEpisodes = savedQuery.data ?? []
  const savedIds = new Set(savedEpisodes.map(({ id }) => id))

  if (filter === 'saved') {
    const episodes = filterSavedEpisodes({
      episodes: savedEpisodes,
      podcastId,
      query: trimmedQuery,
    })
    return {
      episodes,
      hasMore: false,
      isError: savedQuery.isError,
      isLoadingMore: false,
      isPending: savedQuery.isPending,
      isStale: false,
      loadMore: () => {},
      retry: () => void savedQuery.refetch(),
      savedIds,
      searchedQuery: trimmedQuery,
      total: episodes.length,
    }
  }

  return {
    episodes: newestQuery.data?.pages.flatMap(({ data }) => data) ?? [],
    hasMore: newestQuery.hasNextPage,
    isError: newestQuery.isError,
    isLoadingMore: newestQuery.isFetchingNextPage,
    isPending: newestQuery.isPending,
    isStale: newestQuery.isPlaceholderData,
    loadMore: () => void newestQuery.fetchNextPage(),
    retry: () => void newestQuery.refetch(),
    savedIds,
    searchedQuery: debouncedQuery,
    total: newestQuery.data?.pages[0]?.total ?? 0,
  }
}
