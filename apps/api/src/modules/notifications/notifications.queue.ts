import { z } from 'zod'

/** BullMQ queue that turns domain events into notification rows. */
export const NOTIFICATIONS_QUEUE = 'notifications'

/** Job names on the notifications queue. */
export const NOTIFICATION_JOBS = {
  FOLLOW: 'follow',
  NEW_RELEASE: 'new-release',
} as const

const followJobSchema = z.object({ followerId: z.uuid(), followingId: z.uuid() })
const newReleaseJobSchema = z.object({ trackId: z.uuid() })

/** Someone started following a user. Ids only: the consumer re-reads the rows. */
export type FollowNotificationJob = z.infer<typeof followJobSchema>
/** A track was published for the first time. */
export type NewReleaseNotificationJob = z.infer<typeof newReleaseJobSchema>

export const parseFollowJob = (data: unknown) => followJobSchema.safeParse(data)
export const parseNewReleaseJob = (data: unknown) => newReleaseJobSchema.safeParse(data)

/** Retries for transient failures; payloads that can never succeed are dropped by the consumer. */
export const NOTIFICATION_JOB_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 2_000 },
  removeOnComplete: { age: 86_400, count: 1_000 },
  removeOnFail: { age: 604_800, count: 1_000 },
}
