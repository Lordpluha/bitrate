import type { ApiSchemas } from '@bitrate/contracts'
import {
  deliveryDestinations,
  destinationLabels,
} from '@shared/constants/destinations'
import { z } from 'zod'

/** Release tasks were dropped from the workspace; the API may still derive their notices. */
const TASK_KINDS: readonly unknown[] = ['TASK_OVERDUE', 'TASK_DUE_SOON']

const withoutTaskNotices = (items: unknown) =>
  Array.isArray(items)
    ? items.filter(
        (item: unknown) =>
          !(
            typeof item === 'object' &&
            item !== null &&
            'kind' in item &&
            TASK_KINDS.includes(item.kind)
          ),
      )
    : items

const notificationSchema = z.object({
  id: z.string(),
  kind: z.enum([
    'CHANGES_REQUESTED',
    'DELIVERY_FAILED',
    'RELEASE_SUBMITTED',
    'RELEASE_APPROVED',
    'RELEASE_RELEASED',
    'PUBLISH_FAILED',
    'DELIVERY_LIVE',
  ]),
  actionRequired: z.boolean(),
  releaseId: z.uuid(),
  releaseTitle: z.string(),
  destination: z.enum(deliveryDestinations).optional(),
  at: z.iso.datetime({ offset: true }),
  unread: z.boolean(),
})

export type ArtistNotification = z.infer<typeof notificationSchema>

export const notificationListSchema = z.object({
  data: z.preprocess(withoutTaskNotices, z.array(notificationSchema).max(30)),
  unread: z.number().int().nonnegative(),
  seenAt: z.iso.datetime({ offset: true }).nullable(),
}) satisfies z.ZodType<ApiSchemas['ArtistNotificationListEntity']>

/** Copy lives here, not in the API, so the workspace controls wording and later translation. */
export function describeNotification(item: ArtistNotification): string {
  const store = item.destination
    ? destinationLabels[item.destination]
    : 'a store'
  switch (item.kind) {
    case 'CHANGES_REQUESTED':
      return 'The reviewer requested changes'
    case 'DELIVERY_FAILED':
      return `Delivery to ${store} failed`
    case 'RELEASE_SUBMITTED':
      return 'Submitted for Bitrate review'
    case 'RELEASE_APPROVED':
      return 'Approved by Bitrate review'
    case 'RELEASE_RELEASED':
      return 'Live on Bitrate'
    case 'PUBLISH_FAILED':
      return 'Publishing failed — Bitrate has been notified'
    case 'DELIVERY_LIVE':
      return `Live on ${store}`
  }
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
] as const

export function notificationTime(at: string, now = Date.now()): string {
  const diff = Date.parse(at) - now
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms)
      return relative.format(Math.round(diff / ms), unit)
  }
  return 'just now'
}
