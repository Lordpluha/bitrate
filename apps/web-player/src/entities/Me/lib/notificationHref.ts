import { ROUTES } from '@shared/routes'
import { z } from 'zod'
import type { NotificationResponse } from '../api/client/me.schemas'

/** Payloads the API writes for each notification type (`modules/notifications`). */
const followPayloadSchema = z.object({ actorId: z.string() })
const newReleasePayloadSchema = z.object({
  artistId: z.string(),
  trackId: z.string(),
})

type GetNotificationHrefInput = Pick<NotificationResponse, 'payload' | 'type'>

/** Where a notification leads, or null when it has no target (or a payload we cannot read). */
export const getNotificationHref = ({
  payload,
  type,
}: GetNotificationHrefInput): string | null => {
  if (type === 'FOLLOW') {
    const parsed = followPayloadSchema.safeParse(payload)
    return parsed.success ? ROUTES.user(parsed.data.actorId) : null
  }
  if (type === 'NEW_RELEASE') {
    const parsed = newReleasePayloadSchema.safeParse(payload)
    return parsed.success ? ROUTES.artist(parsed.data.artistId) : null
  }
  return null
}
