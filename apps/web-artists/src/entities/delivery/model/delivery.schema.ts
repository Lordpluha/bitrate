import type { ApiSchemas } from '@bitrate/contracts'
import {
  deliveryDestinations,
  destinationLabels,
} from '@shared/constants/destinations'
import { releaseStatuses } from '@shared/constants/releaseStatuses'
import type { I18n, TranslationKey } from '@shared/i18n'
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

/** Every label says plainly whether anything was sent. Catalog keys; render with `t()`. */
export const availabilityLabels = {
  NOT_CONNECTED: 'delivery.availability.notConnected',
  UNAVAILABLE: 'delivery.availability.unavailable',
  NOT_SENT: 'delivery.availability.notSent',
  PENDING: 'delivery.availability.pending',
  LIVE: 'delivery.availability.live',
  FAILED: 'delivery.availability.failed',
  TAKEN_DOWN: 'delivery.availability.takenDown',
} satisfies Record<DestinationAvailability, TranslationKey>

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

export function plannedSummary(
  delivery: ReleaseDelivery,
  { t }: Pick<I18n, 't'>,
): string {
  const planned = delivery.destinations.filter((item) => item.planned)
  if (planned.length === 0) return t('delivery.noStores')
  return planned.map((item) => destinationLabels[item.destination]).join(', ')
}

export function territorySummary(
  delivery: ReleaseDelivery,
  { t, tp }: Pick<I18n, 't' | 'tp'>,
): string {
  if (delivery.territories.mode === 'WORLDWIDE') return t('delivery.worldwide')
  return tp({
    count: delivery.territories.countries.length,
    key: 'delivery.countries',
  })
}
