import type { ApiSchemas } from '@bitrate/contracts'
import {
  deliveryDestinations,
  destinationLabels,
} from '@shared/constants/destinations'
import type { I18n } from '@shared/i18n'
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

/** Copy lives here, not in the API, so the workspace controls wording in every language. */
export function describeNotification(
  item: ArtistNotification,
  { t }: Pick<I18n, 't'>,
): string {
  const store = item.destination
    ? destinationLabels[item.destination]
    : t('notifications.aStore')
  switch (item.kind) {
    case 'CHANGES_REQUESTED':
      return t('notifications.kind.changesRequested')
    case 'DELIVERY_FAILED':
      return t('notifications.kind.deliveryFailed', { store })
    case 'RELEASE_SUBMITTED':
      return t('notifications.kind.submitted')
    case 'RELEASE_APPROVED':
      return t('notifications.kind.approved')
    case 'RELEASE_RELEASED':
      return t('notifications.kind.released')
    case 'PUBLISH_FAILED':
      return t('notifications.kind.publishFailed')
    case 'DELIVERY_LIVE':
      return t('notifications.kind.deliveryLive', { store })
  }
}

const UNITS = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
] as const

export function notificationTime(
  at: string,
  { t, locale }: Pick<I18n, 't' | 'locale'>,
  now = Date.now(),
): string {
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const diff = Date.parse(at) - now
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms)
      return relative.format(Math.round(diff / ms), unit)
  }
  return t('notifications.justNow')
}
