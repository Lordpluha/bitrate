'use client'

import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import type { ApiSchemas } from '@spotify/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

type Track = Pick<
  ApiSchemas['TrackEntity'],
  'id' | 'title' | 'cover' | 'duration' | 'artistId'
>

export type ListeningHistoryEntry = {
  id: string
  listenedAt: string
  trackId: string
  track: Track & {
    artist?: {
      id: string
      username: string
      avatar: string | null
    }
  }
}

type UseHistoryParams = {
  page?: number
  limit?: number
}

export const useListeningHistory = ({
  page = 1,
  limit = 20,
}: UseHistoryParams = {}) =>
  useQuery({
    queryKey: apiQueryKeys.history.list({ page, limit }),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/history',
        {
          params: {
            query: { page, limit },
          },
        },
      )

      ensureOkResponse(response, 'Failed to fetch listening history')

      return (Array.isArray(data) ? data : []) as ListeningHistoryEntry[]
    },
  })

export const useRecordListeningHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (trackId: string) => {
      const { response } = await clientFetchClient.POST(
        '/api/v1/history/tracks/{trackId}',
        {
          params: {
            path: { trackId },
          },
        },
      )

      ensureOkResponse(response, 'Failed to record listening history')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: apiQueryKeys.history.all,
      })
    },
  })
}

export const useRemoveListeningHistoryTrack = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (trackId: string) => {
      const { response } = await clientFetchClient.DELETE(
        '/api/v1/history/tracks/{trackId}',
        {
          params: {
            path: { trackId },
          },
        },
      )

      ensureOkResponse(
        response,
        'Failed to remove track from listening history',
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: apiQueryKeys.history.all,
      })
    },
  })
}

export const useClearListeningHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { response } = await clientFetchClient.DELETE('/api/v1/history')

      ensureOkResponse(response, 'Failed to clear listening history')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: apiQueryKeys.history.all,
      })
    },
  })
}
