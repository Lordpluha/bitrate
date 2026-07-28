'use client'

import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listeningHistoryResponseSchema } from './historyResponse.schema'

export type { ListeningHistoryEntry } from './historyResponse.schema'

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

      return listeningHistoryResponseSchema.parse(data)
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
