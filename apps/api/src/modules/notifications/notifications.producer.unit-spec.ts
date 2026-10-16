import { describe, expect, it, jest } from '@jest/globals'
import type { Queue } from 'bullmq'
import { NotificationsProducer } from './notifications.producer'
import { NOTIFICATION_JOBS } from './notifications.queue'

const makeQueue = () => ({ add: jest.fn(async () => ({})) }) as unknown as jest.Mocked<Queue>

describe('NotificationsProducer', () => {
  it('enqueues a follow with retries', async () => {
    const queue = makeQueue()
    await new NotificationsProducer(queue).followed({ followerId: 'a', followingId: 'b' })

    expect(queue.add).toHaveBeenCalledWith(
      NOTIFICATION_JOBS.FOLLOW,
      { followerId: 'a', followingId: 'b' },
      expect.objectContaining({ attempts: 5 }),
    )
  })

  it('enqueues one release job per track', async () => {
    const queue = makeQueue()
    await new NotificationsProducer(queue).trackPublished({ trackId: 't1' })

    expect(queue.add).toHaveBeenCalledWith(
      NOTIFICATION_JOBS.NEW_RELEASE,
      { trackId: 't1' },
      expect.objectContaining({ jobId: 'new-release-t1' }),
    )
  })
})
