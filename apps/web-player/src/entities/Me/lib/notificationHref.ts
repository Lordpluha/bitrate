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

/**
 * Where a notification leads, or null when it has no target (or a payload we cannot read).
 * Profiles link by id: the payload keeps the username from when it was sent, which may
 * have changed since; the profile page redirects an id to the current username.
 */
export const getNotificationHref = ({
  payload,
  type,
}: GetNotificationHrefInput): string | null => {
  if (type === 'FOLLOW') {
    const parsed = followPayloadSchema.safeParse(payload)
    return parsed.success ? ROUTES.userById(parsed.data.actorId) : null
  }
  if (type === 'NEW_RELEASE') {
    const parsed = newReleasePayloadSchema.safeParse(payload)
    return parsed.success ? ROUTES.artistById(parsed.data.artistId) : null
  }
  if (type === 'FRIEND_REQUEST') return ROUTES.friendRequests
  if (type === 'FRIEND_ACCEPTED') return ROUTES.friends
  return null
}
