import { z } from 'zod'

/** BullMQ queue that turns domain events into notification rows. */
export const NOTIFICATIONS_QUEUE = 'notifications'

/** Job names on the notifications queue. */
export const NOTIFICATION_JOBS = {
  FOLLOW: 'follow',
  FRIEND_REQUEST: 'friend-request',
  FRIEND_ACCEPTED: 'friend-accepted',
  NEW_RELEASE: 'new-release',
  RELEASE_PUBLISHED: 'release-published',
} as const

const followJobSchema = z.object({ followerId: z.uuid(), followingId: z.uuid() })
const newReleaseJobSchema = z.object({ trackId: z.uuid() })
const releasePublishedJobSchema = z.object({ albumId: z.uuid() })
const friendRequestJobSchema = z.object({ requestId: z.uuid() })
const friendAcceptedJobSchema = z.object({ accepterId: z.uuid(), requesterId: z.uuid() })

/** Someone started following a user. Ids only: the consumer re-reads the rows. */
export type FollowNotificationJob = z.infer<typeof followJobSchema>
/** A track was published for the first time. */
export type NewReleaseNotificationJob = z.infer<typeof newReleaseJobSchema>
/** A whole release went live on Bitrate as this album; followers hear about it once. */
export type ReleasePublishedNotificationJob = z.infer<typeof releasePublishedJobSchema>
/** Someone sent a friend request; the consumer re-reads it and skips it once it is gone. */
export type FriendRequestNotificationJob = z.infer<typeof friendRequestJobSchema>
/** `accepterId` accepted the request `requesterId` had sent. */
export type FriendAcceptedNotificationJob = z.infer<typeof friendAcceptedJobSchema>

export const parseFollowJob = (data: unknown) => followJobSchema.safeParse(data)
export const parseNewReleaseJob = (data: unknown) => newReleaseJobSchema.safeParse(data)
export const parseReleasePublishedJob = (data: unknown) => releasePublishedJobSchema.safeParse(data)
export const parseFriendRequestJob = (data: unknown) => friendRequestJobSchema.safeParse(data)
export const parseFriendAcceptedJob = (data: unknown) => friendAcceptedJobSchema.safeParse(data)

/** Retries for transient failures; payloads that can never succeed are dropped by the consumer. */
export const NOTIFICATION_JOB_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 2_000 },
  removeOnComplete: { age: 86_400, count: 1_000 },
  removeOnFail: { age: 604_800, count: 1_000 },
}
