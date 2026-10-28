import { z } from 'zod'

/**
 * BullMQ queue that takes an approved release live on Bitrate. Lives in `infra` because both the
 * API (producer and consumer) and the standalone transcode worker (which reports finished
 * conversions) use it.
 */
export const RELEASE_PUBLISHING_QUEUE = 'release-publishing'

/** Job names on the release-publishing queue. */
export const RELEASE_PUBLISHING_JOBS = {
  /** Creates the player tracks of a release and starts their conversion. */
  PUBLISH: 'publish',
  /** One track of a publishing release finished converting, successfully or not. */
  TRACK_SETTLED: 'track-settled',
} as const

const publishJobSchema = z.object({ releaseId: z.uuid() })
const trackSettledJobSchema = z.object({ trackId: z.uuid() })

/** Ids only: the consumer re-reads the release and skips it once it left PUBLISHING. */
export type ReleasePublishJob = z.infer<typeof publishJobSchema>
/** The consumer finds the release through the track's `ReleaseTrack` row. */
export type ReleaseTrackSettledJob = z.infer<typeof trackSettledJobSchema>

export const parseReleasePublishJob = (data: unknown) => publishJobSchema.safeParse(data)
export const parseReleaseTrackSettledJob = (data: unknown) => trackSettledJobSchema.safeParse(data)

/**
 * Retries cover storage and database hiccups while masters are copied; after the last attempt the
 * release becomes PUBLISH_FAILED and Bitrate retries it from the admin.
 */
export const RELEASE_PUBLISHING_JOB_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 10_000 },
  removeOnComplete: { age: 86_400, count: 1_000 },
  removeOnFail: { age: 604_800, count: 1_000 },
}
