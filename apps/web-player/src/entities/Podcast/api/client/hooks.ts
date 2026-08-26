'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export const dedupeSavedEpisodes = (episodes: SavedEpisode[]) =>
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

export const useSavedEpisodes = (page = 1, limit = 20, enabled = true) =>
  useQuery({
    queryKey: apiQueryKeys.podcasts.savedEpisodes(page, limit),
    queryFn: () => fetchSavedEpisodesPage(page, limit),
    enabled,
    staleTime: 60 * 1000,
  })

/** Loads every saved-episode page for relationship checks and library merging. */
export const useAllSavedEpisodes = (enabled = true) =>
  useQuery({
    queryKey: apiQueryKeys.podcasts.savedEpisodesAll,
    queryFn: async () => {
      const episodes: SavedEpisode[] = []
      let page = 1
      let total = 0

      do {
        const result = await fetchSavedEpisodesPage(
          page,
          SAVED_EPISODES_PAGE_SIZE,
        )
        episodes.push(...result.data)
        total = result.total

        if (result.data.length === 0) break
        page += 1
      } while ((page - 1) * SAVED_EPISODES_PAGE_SIZE < total)

      return dedupeSavedEpisodes(episodes)
    },
    enabled,
    staleTime: 60 * 1000,
  })

const useEpisodeMutation = (method: 'PUT' | 'DELETE') => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (episodeId: string) => {
      const request =
        method === 'PUT'
          ? clientFetchClient.PUT('/api/v1/me/episodes/{id}', {
              params: { path: { id: episodeId } },
            })
          : clientFetchClient.DELETE('/api/v1/me/episodes/{id}', {
              params: { path: { id: episodeId } },
            })
      const { response } = await request
      ensureOkResponse(response, 'Failed to update saved episode')
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.podcasts.all }),
  })
}

export const useSaveEpisode = () => useEpisodeMutation('PUT')
export const useUnsaveEpisode = () => useEpisodeMutation('DELETE')
