import { describe, expect, it, jest } from '@jest/globals'
import { type Job, UnrecoverableError } from 'bullmq'
import { NotificationsConsumer } from './notifications.consumer'
import { NOTIFICATION_JOBS } from './notifications.queue'
import type { NotificationsService } from './notifications.service'

const ids = { a: '0199d0c1-6c2a-7b3e-9a4f-1c2d3e4f5a6b', b: '0199d0c1-6c2a-7b3e-9a4f-1c2d3e4f5a6c' }
const makeService = () =>
  ({
    notifyFollow: jest.fn(async () => undefined),
    notifyNewRelease: jest.fn(async () => undefined),
  }) as unknown as jest.Mocked<NotificationsService>

describe('NotificationsConsumer', () => {
  it('writes a follow notification for a follow job', async () => {
    const service = makeService()
    await new NotificationsConsumer(service).process({
      name: NOTIFICATION_JOBS.FOLLOW,
      data: { followerId: ids.a, followingId: ids.b },
    } as Job)

    expect(service.notifyFollow).toHaveBeenCalledWith({ followerId: ids.a, followingId: ids.b })
  })

  it('fans a release out for a new-release job', async () => {
    const service = makeService()
    await new NotificationsConsumer(service).process({
      name: NOTIFICATION_JOBS.NEW_RELEASE,
      data: { trackId: ids.a },
    } as Job)

    expect(service.notifyNewRelease).toHaveBeenCalledWith({ trackId: ids.a })
  })

  it('stops retrying a malformed payload', async () => {
    const service = makeService()
    await expect(
      new NotificationsConsumer(service).process({
        name: NOTIFICATION_JOBS.FOLLOW,
        data: { followerId: 'x' },
      } as Job),
    ).rejects.toBeInstanceOf(UnrecoverableError)
    expect(service.notifyFollow).not.toHaveBeenCalled()
  })
})
