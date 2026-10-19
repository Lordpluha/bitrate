import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

const destinations = [
  'SPOTIFY',
  'APPLE_MUSIC',
  'YOUTUBE_MUSIC',
  'AMAZON_MUSIC',
  'DEEZER',
  'TIDAL',
] as const

const destinationLabels: Record<(typeof destinations)[number], string> = {
  SPOTIFY: 'Spotify',
  APPLE_MUSIC: 'Apple Music',
  YOUTUBE_MUSIC: 'YouTube Music',
  AMAZON_MUSIC: 'Amazon Music',
  DEEZER: 'Deezer',
  TIDAL: 'TIDAL',
}

const notificationSchema = z.object({
  id: z.string(),
  kind: z.enum([
    'TASK_OVERDUE',
    'TASK_DUE_SOON',
    'CHANGES_REQUESTED',
    'DELIVERY_FAILED',
    'RELEASE_SUBMITTED',
    'RELEASE_APPROVED',
    'RELEASE_RELEASED',
    'DELIVERY_LIVE',
  ]),
  actionRequired: z.boolean(),
  releaseId: z.uuid(),
  releaseTitle: z.string(),
  taskTitle: z.string().optional(),
  destination: z.enum(destinations).optional(),
  at: z.iso.datetime({ offset: true }),
  unread: z.boolean(),
})

export type ArtistNotification = z.infer<typeof notificationSchema>

export const notificationListSchema = z.object({
  data: z.array(notificationSchema).max(30),
  unread: z.number().int().nonnegative(),
  seenAt: z.iso.datetime({ offset: true }).nullable(),
}) satisfies z.ZodType<ApiSchemas['ArtistNotificationListEntity']>

/** Copy lives here, not in the API, so the workspace controls wording and later translation. */
export function describeNotification(item: ArtistNotification): string {
  const store = item.destination
    ? destinationLabels[item.destination]
    : 'a store'
  switch (item.kind) {
    case 'TASK_OVERDUE':
      return `“${item.taskTitle ?? 'A task'}” is overdue`
    case 'TASK_DUE_SOON':
      return `“${item.taskTitle ?? 'A task'}” is due within two days`
    case 'CHANGES_REQUESTED':
      return 'The reviewer requested changes'
    case 'DELIVERY_FAILED':
      return `Delivery to ${store} failed`
    case 'RELEASE_SUBMITTED':
      return 'Submitted for Bitrate review'
    case 'RELEASE_APPROVED':
      return 'Approved by Bitrate review'
    case 'RELEASE_RELEASED':
      return 'Released'
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
