'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientFetchClient } from '@/shared/api/client'
import { ensureOkResponse } from '@/shared/api/errors'
import { apiQueryKeys } from '@/shared/api/queryKeys'
import {
  podcastDetailSchema,
  podcastsSchema,
  savedEpisodesSchema,
} from './podcast.schemas'

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
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/me/episodes',
        { params: { query: { limit, page } } },
      )
      ensureOkResponse(response, 'Failed to load saved episodes')
      return savedEpisodesSchema.parse(data)
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
