import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal } from '@shared/api/writeTimeout'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  aiAllowanceSchema,
  promotionProfileSchema,
} from '../model/promotion.schema'
import { promotionKeys } from './promotionKeys'
import { readPromotion } from './promotionRequest'

/** The artist's promotion profile, or null before it is set up. */
export function usePromotionProfile(artistId: string, enabled = true) {
  return useQuery({
    queryKey: promotionKeys.profile(artistId),
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artists/me/promotion-profile',
        { signal },
      )
      if (result.response.status === 404) return null
      return readPromotion(
        result,
        promotionProfileSchema,
        'promotion.error.loadProfile',
      )
    },
    enabled,
    staleTime: 30_000,
  })
}

export function useSavePromotionProfile(artistId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ApiSchemas['PromotionProfileDto']) => {
      const result = await clientFetchClient.PUT(
        '/api/v1/artists/me/promotion-profile',
        { body: input, signal: writeSignal() },
      )
      return readPromotion(
        result,
        promotionProfileSchema,
        'promotion.error.saveProfile',
      )
    },
    retry: false,
    onSuccess: (profile) =>
      queryClient.setQueryData(promotionKeys.profile(artistId), profile),
  })
}

/** This month's AI spend, its ceiling, and whether promotion is on for the artist. */
export function useAiAllowance(artistId: string) {
  return useQuery({
    queryKey: promotionKeys.allowance(artistId),
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artists/me/promotion/allowance',
        { signal },
      )
      return readPromotion(
        result,
        aiAllowanceSchema,
        'promotion.error.loadAllowance',
      )
    },
    staleTime: 30_000,
  })
}
