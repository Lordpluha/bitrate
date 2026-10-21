'use client'

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { clientFetchClient } from '@/shared/api/client'
import { ensureOkResponse } from '@/shared/api/errors'
import { apiQueryKeys } from '@/shared/api/queryKeys'
import {
  podcastDetailSchema,
  podcastsSchema,
  type SavedEpisode,
  savedEpisodesSchema,
} from './podcast.schemas'

const SAVED_EPISODES_PAGE_SIZE = 100

const fetchSavedEpisodesPage = async (page: number, limit: number) => {
  const { data, response } = await clientFetchClient.GET(
    '/api/v1/me/episodes',
    { params: { query: { limit, page } } },
  )
  ensureOkResponse(response, 'Failed to load saved episodes')
  return savedEpisodesSchema.parse(data)
}

const dedupeSavedEpisodes = (episodes: SavedEpisode[]) =>
  Array.from(new Map(episodes.map((episode) => [episode.id, episode])).values())

export const usePodcasts = (page = 1, limit = 20, query?: string) =>
  useQuery({
    queryKey: apiQueryKeys.podcasts.list(page, limit, query),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/podcasts',
        { params: { query: { limit, page, q: query } } },
      )
      ensureOkResponse(response, 'Failed to load podcasts')
      return podcastsSchema.parse(data)
    },
    staleTime: 5 * 60 * 1000,
  })

export const usePodcast = (id: string, page = 1, limit = 20) =>
  useQuery({
    queryKey: apiQueryKeys.podcasts.detail(id, page, limit),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/podcasts/{id}',
        { params: { path: { id }, query: { limit, page } } },
      )
      ensureOkResponse(response, 'Failed to load podcast')
      return podcastDetailSchema.parse(data)
    },
    enabled: id.length > 0,
    staleTime: 5 * 60 * 1000,
  })

const PODCAST_EPISODES_PAGE_SIZE = 20

type UsePodcastEpisodesInput = {
  podcastId: string
  /** Trimmed server-side title/description search; empty lists every episode. */
  query: string
}

/**
 * A podcast's episodes, newest release first, one server page at a time. The previous search's
 * pages stay on screen while the next one loads.
 */
export const usePodcastEpisodes = ({
  podcastId,
  query,
}: UsePodcastEpisodesInput) =>
  useInfiniteQuery({
    queryKey: [
      ...apiQueryKeys.podcasts.all,
      'episodes',
      { podcastId, query, limit: PODCAST_EPISODES_PAGE_SIZE },
    ] as const,
    queryFn: async ({ pageParam }) => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/podcasts/{id}',
        {
          params: {
            path: { id: podcastId },
            query: {
              limit: PODCAST_EPISODES_PAGE_SIZE,
              page: pageParam,
              q: query || undefined,
            },
          },
        },
      )
      ensureOkResponse(response, 'Failed to load episodes')
      return podcastDetailSchema.parse(data).episodes
    },
    initialPageParam: 1,
    getNextPageParam: ({ limit, page, total }) =>
      page * limit < total ? page + 1 : undefined,
    enabled: podcastId.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

export const useSavedEpisodes = (page = 1, limit = 20, enabled = true) =>
  useQuery({
    queryKey: apiQueryKeys.podcasts.savedEpisodes(page, limit),
    queryFn: () => fetchSavedEpisodesPage(page, limit),
    enabled,
    staleTime: 60 * 1000,
  })

/** Every saved episode: the first page tells the total, the rest load in parallel. */
export const getAllSavedEpisodes = async () => {
  const firstPage = await fetchSavedEpisodesPage(1, SAVED_EPISODES_PAGE_SIZE)
  const pageCount = Math.ceil(firstPage.total / firstPage.limit)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      fetchSavedEpisodesPage(index + 2, SAVED_EPISODES_PAGE_SIZE),
    ),
  )

  return dedupeSavedEpisodes(
    [firstPage, ...remainingPages].flatMap(({ data }) => data),
  )
}

/** Loads every saved-episode page for relationship checks and library merging. */
export const useAllSavedEpisodes = (enabled = true) =>
  useQuery({
    queryKey: apiQueryKeys.podcasts.savedEpisodesAll,
    queryFn: getAllSavedEpisodes,
    enabled,
    staleTime: 60 * 1000,
  })

/** Prefix of `apiQueryKeys.podcasts.savedEpisodes(…)` and `savedEpisodesAll`. */
const SAVED_EPISODES_KEY = ['podcasts', 'saved-episodes'] as const

type SavedEpisodeMutationInput<TVariables> = {
  /** The saved library as it should look once the request succeeds. */
  applyOptimistic: (
    episodes: SavedEpisode[],
    variables: TVariables,
  ) => SavedEpisode[]
  request: (variables: TVariables) => Promise<void>
}

/**
 * Updates the cached saved library at once, rolls it back if the request fails, and then
 * refetches only the saved-episode queries.
 */
const useSavedEpisodeMutation = <TVariables>({
  applyOptimistic,
  request,
}: SavedEpisodeMutationInput<TVariables>) => {
  const queryClient = useQueryClient()
  const savedKey = apiQueryKeys.podcasts.savedEpisodesAll

  return useMutation({
    mutationFn: request,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: savedKey })
      const previous = queryClient.getQueryData<SavedEpisode[]>(savedKey)
      if (previous) {
        queryClient.setQueryData(savedKey, applyOptimistic(previous, variables))
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(savedKey, context.previous)
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: SAVED_EPISODES_KEY }),
  })
}

/** Saves an episode; the variable is the library entry to show until the server confirms it. */
export const useSaveEpisode = () =>
  useSavedEpisodeMutation<SavedEpisode>({
    applyOptimistic: (episodes, episode) => [
      episode,
      ...episodes.filter(({ id }) => id !== episode.id),
    ],
    request: async ({ id }) => {
      const { response } = await clientFetchClient.PUT(
        '/api/v1/me/episodes/{id}',
        { params: { path: { id } } },
      )
      ensureOkResponse(response, 'Failed to save episode')
    },
  })

export const useUnsaveEpisode = () =>
  useSavedEpisodeMutation<string>({
    applyOptimistic: (episodes, episodeId) =>
      episodes.filter(({ id }) => id !== episodeId),
    request: async (id) => {
      const { response } = await clientFetchClient.DELETE(
        '/api/v1/me/episodes/{id}',
        { params: { path: { id } } },
      )
      ensureOkResponse(response, 'Failed to remove saved episode')
    },
  })
