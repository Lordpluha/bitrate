import type { ApiSchemas } from '@bitrate/contracts'
import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { z } from 'zod'
import {
  distributionPageSchema,
  releaseDeliverySchema,
} from '../model/delivery.schema'

const WRITE_TIMEOUT_MS = 30_000

const deliveryKeys = {
  all: (artistId: string | undefined) =>
    [...artistMusicKeys.artist(artistId), 'delivery'] as const,
}

async function getReleaseDelivery(id: string, signal: AbortSignal) {
  const result = await clientFetchClient.GET('/api/v1/releases/{id}/delivery', {
    params: { path: { id } },
    signal,
  })
  if (result.response.status === 404)
    throw new Error('This release is no longer available.')
  const parsed = releaseDeliverySchema.safeParse(result.data)
  if (!result.response.ok || !parsed.success || parsed.data.releaseId !== id)
    throw new Error('Could not load the delivery plan. Please try again.')
  return parsed.data
}

async function getDistribution(page: number, signal: AbortSignal) {
  const result = await clientFetchClient.GET('/api/v1/distribution', {
    params: { query: { page, limit: 20 } },
    signal,
  })
  const parsed = distributionPageSchema.safeParse(result.data)
  if (!result.response.ok || !parsed.success || parsed.data.page !== page)
    throw new Error('Could not load distribution. Please try again.')
  return parsed.data
}

export function useReleaseDelivery(artistId: string, id: string) {
  return useQuery({
    queryKey: [...deliveryKeys.all(artistId), 'release', id],
    queryFn: ({ signal }) => getReleaseDelivery(id, signal),
    retry: false,
    staleTime: 0,
  })
}

export function useDistribution(artistId: string, page: number) {
  return useQuery({
    queryKey: [...deliveryKeys.all(artistId), 'list', page],
    queryFn: ({ signal }) => getDistribution(page, signal),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  })
}

const planResultSchema = z.object({
  release: z.object({
    id: z.uuid(),
    updatedAt: z.iso.datetime({ offset: true }),
  }),
  delivery: releaseDeliverySchema,
})

const STALE =
  'This release changed or is no longer a draft. Your choices are kept here; close and reopen the form to review the latest version.'
const UNCONFIRMED =
  'Could not confirm the delivery plan was saved. Close this form and check the release before trying again.'

interface DeliveryPlanRequest {
  id: string
  input: ApiSchemas['UpdateDeliveryPlanDto']
}

/** Never reports success unless the response proves a newer version of this release. */
async function saveDeliveryPlan({ id, input }: DeliveryPlanRequest) {
  const send = () =>
    clientFetchClient.PUT('/api/v1/releases/{id}/delivery-plan', {
      params: { path: { id } },
      body: input,
      signal: AbortSignal.timeout(WRITE_TIMEOUT_MS),
    })
  let result: Awaited<ReturnType<typeof send>>
  try {
    result = await send()
  } catch {
    throw new Error(UNCONFIRMED)
  }
  const { status } = result.response
  if (status === 409) throw new Error(STALE)
  if (status === 404) throw new Error('This release is no longer available.')
  if (status === 400)
    throw new Error('Choose stores and valid countries, then try again.')
  const parsed = planResultSchema.safeParse(result.data)
  if (
    !result.response.ok ||
    !parsed.success ||
    parsed.data.release.id !== id ||
    parsed.data.delivery.releaseId !== id ||
    Date.parse(parsed.data.release.updatedAt) <=
      Date.parse(input.expectedUpdatedAt)
  )
    throw new Error(UNCONFIRMED)
  return parsed.data.delivery
}

/** A saved plan also changes the release version, so the whole artist scope refreshes. */
export function useSaveDeliveryPlan(artistId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveDeliveryPlan,
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: artistMusicKeys.artist(artistId),
      }),
  })
}
