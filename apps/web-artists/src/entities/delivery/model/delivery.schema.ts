import type { ApiSchemas } from '@bitrate/contracts'
import {
  deliveryDestinations,
  destinationLabels,
} from '@shared/constants/destinations'
import { releaseStatuses } from '@shared/constants/releaseStatuses'
import { z } from 'zod'

const availabilities = [
  'NOT_CONNECTED',
  'UNAVAILABLE',
  'NOT_SENT',
  'PENDING',
  'LIVE',
  'FAILED',
  'TAKEN_DOWN',
] as const

export type DestinationAvailability = (typeof availabilities)[number]

/** Every label says plainly whether anything was sent. */
export const availabilityLabels = {
  NOT_CONNECTED: 'Not connected',
  UNAVAILABLE: 'Unavailable',
  NOT_SENT: 'Not sent',
  PENDING: 'Pending',
  LIVE: 'Live',
  FAILED: 'Failed',
  TAKEN_DOWN: 'Taken down',
} satisfies Record<DestinationAvailability, string>

export const releaseDeliverySchema = z.object({
  releaseId: z.uuid(),
  title: z.string(),
  status: z.enum(releaseStatuses),
  cover: z.string().nullable(),
  updatedAt: z.iso.datetime({ offset: true }),
  partner: z.object({ connected: z.boolean(), name: z.string().nullable() }),
  territories: z.object({
    mode: z.enum(['WORLDWIDE', 'SELECTED']),
    countries: z.array(z.string().length(2)),
  }),
  destinations: z.array(
    z.object({
      destination: z.enum(deliveryDestinations),
      planned: z.boolean(),
      availability: z.enum(availabilities),
      message: z.string().nullable(),
      updatedAt: z.iso.datetime({ offset: true }).nullable(),
    }),
  ),
  sent: z.boolean(),
}) satisfies z.ZodType<ApiSchemas['ReleaseDeliveryEntity']>

export type ReleaseDelivery = z.infer<typeof releaseDeliverySchema>

export const distributionPageSchema = z.object({
  data: z.array(releaseDeliverySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
})

export function plannedSummary(delivery: ReleaseDelivery): string {
  const planned = delivery.destinations.filter((item) => item.planned)
  if (planned.length === 0) return 'No stores planned'
  return planned.map((item) => destinationLabels[item.destination]).join(', ')
}

export function territorySummary(delivery: ReleaseDelivery): string {
  if (delivery.territories.mode === 'WORLDWIDE') return 'Worldwide'
  const count = delivery.territories.countries.length
  return `${count} ${count === 1 ? 'country' : 'countries'}`
}
