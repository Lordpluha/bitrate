import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal } from '@shared/api/writeTimeout'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type PromotionPlan,
  promotionPlanSchema,
} from '../model/promotion.schema'
import { promotionKeys } from './promotionKeys'
import { isPlanNotFound, readPromotion } from './promotionRequest'

/** Generation runs in the background; the plan is re-read this often while it does. */
export const PLAN_POLL_MS = 3_000

/** True while the server is still writing the plan or a step of it. */
export const isPlanBusy = (plan: PromotionPlan | null | undefined) =>
  plan?.status === 'GENERATING' ||
  Boolean(plan?.steps.some((s) => s.regenerating))

/** The release's latest plan version, or null before the first generation. */
export function usePromotionPlan(
  artistId: string,
  releaseId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: promotionKeys.plan(artistId, releaseId),
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artists/me/releases/{releaseId}/promotion/plans/latest',
        { params: { path: { releaseId } }, signal },
      )
      if (result.response.status === 404 && isPlanNotFound(result.error))
        return null
      return readPromotion(
        result,
        promotionPlanSchema,
        'promotion.error.loadPlan',
      )
    },
    refetchInterval: (query) =>
      isPlanBusy(query.state.data) ? PLAN_POLL_MS : false,
    enabled,
    staleTime: 0,
  })
}

/** A plan write answers with the whole plan; it replaces the cached one, and the calendar refreshes. */
function usePlanWrite<Request>(
  artistId: string,
  releaseId: string,
  write: (request: Request) => Promise<PromotionPlan>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: write,
    retry: false,
    onSuccess: async (plan) => {
      queryClient.setQueryData(promotionKeys.plan(artistId, releaseId), plan)
      await queryClient.invalidateQueries({
        queryKey: promotionKeys.calendar(artistId),
      })
      await queryClient.invalidateQueries({
        queryKey: promotionKeys.allowance(artistId),
      })
    },
  })
}

/** Starts a new plan version; approved and edited steps carry over. */
export function useRequestPlan(artistId: string, releaseId: string) {
  return usePlanWrite(artistId, releaseId, async () => {
    const result = await clientFetchClient.POST(
      '/api/v1/artists/me/releases/{releaseId}/promotion/plans',
      { params: { path: { releaseId } }, signal: writeSignal() },
    )
    return readPromotion(
      result,
      promotionPlanSchema,
      'promotion.error.generate',
    )
  })
}

export interface StepUpdate {
  stepId: string
  input: ApiSchemas['UpdatePromotionStepDto']
}

/** Approve, edit, reject or finish one step. */
export function useUpdateStep(artistId: string, releaseId: string) {
  return usePlanWrite(
    artistId,
    releaseId,
    async ({ stepId, input }: StepUpdate) => {
      const result = await clientFetchClient.PATCH(
        '/api/v1/artists/me/releases/{releaseId}/promotion/steps/{stepId}',
        {
          params: { path: { releaseId, stepId } },
          body: input,
          signal: writeSignal(),
        },
      )
      return readPromotion(
        result,
        promotionPlanSchema,
        'promotion.error.updateStep',
      )
    },
  )
}

export interface StepRegeneration {
  stepId: string
  hint?: string
}

/** Asks for a new suggestion for one step, optionally with a hint. */
export function useRegenerateStep(artistId: string, releaseId: string) {
  return usePlanWrite(
    artistId,
    releaseId,
    async ({ stepId, hint }: StepRegeneration) => {
      const result = await clientFetchClient.POST(
        '/api/v1/artists/me/releases/{releaseId}/promotion/steps/{stepId}/regenerate',
        {
          params: { path: { releaseId, stepId } },
          body: hint ? { hint } : {},
          signal: writeSignal(),
        },
      )
      return readPromotion(
        result,
        promotionPlanSchema,
        'promotion.error.regenerate',
      )
    },
  )
}
