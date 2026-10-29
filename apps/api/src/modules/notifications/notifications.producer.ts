import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import type { Queue } from 'bullmq'
import {
  type FollowNotificationJob,
  type FriendAcceptedNotificationJob,
  type FriendRequestNotificationJob,
  type NewReleaseNotificationJob,
  NOTIFICATION_JOB_OPTIONS,
  NOTIFICATION_JOBS,
  NOTIFICATIONS_QUEUE,
  type ReleasePublishedNotificationJob,
} from './notifications.queue'

/** Enqueues notification work; used by the API (follows) and the transcode worker (releases). */
@Injectable()
export class NotificationsProducer {
  constructor(@InjectQueue(NOTIFICATIONS_QUEUE) private readonly queue: Queue) {}

  /** A user started following another user. */
  async followed(job: FollowNotificationJob) {
    await this.queue.add(NOTIFICATION_JOBS.FOLLOW, job, NOTIFICATION_JOB_OPTIONS)
  }

  /** A friend request was sent; one job per request however often this is called. */
  async friendRequested(job: FriendRequestNotificationJob) {
    await this.queue.add(NOTIFICATION_JOBS.FRIEND_REQUEST, job, {
      ...NOTIFICATION_JOB_OPTIONS,
      jobId: `friend-request-${job.requestId}`,
    })
  }

  /** A friend request was accepted. */
  async friendAccepted(job: FriendAcceptedNotificationJob) {
    await this.queue.add(NOTIFICATION_JOBS.FRIEND_ACCEPTED, job, NOTIFICATION_JOB_OPTIONS)
  }

  /** A track was published for the first time; one job per track however often this is called. */
  async trackPublished(job: NewReleaseNotificationJob) {
    await this.queue.add(NOTIFICATION_JOBS.NEW_RELEASE, job, {
      ...NOTIFICATION_JOB_OPTIONS,
      jobId: `new-release-${job.trackId}`,
    })
  }

  /** A release went live; one job per album however often this is called. */
  async releasePublished(job: ReleasePublishedNotificationJob) {
    await this.queue.add(NOTIFICATION_JOBS.RELEASE_PUBLISHED, job, {
      ...NOTIFICATION_JOB_OPTIONS,
      jobId: `release-published-${job.albumId}`,
    })
  }
}
