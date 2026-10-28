import { beforeEach, describe, expect, it } from '@jest/globals'
import { ArtistNotificationCategory, ReleaseStatus } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { ArtistNotificationsService } from './artist-notifications.service'

describe('ArtistNotificationsService.list', () => {
  let service: ArtistNotificationsService
  let prisma: PrismaMock

  const mute = (...mutedInApp: ArtistNotificationCategory[]) => {
    prisma.artist.findFirst.mockResolvedValue({
      notificationState: null,
      notificationPreference: { mutedInApp },
    } as never)
  }

  const releaseWhere = () => {
    const [args] = prisma.release.findMany.mock.calls[0] ?? []
    return JSON.stringify(args?.where)
  }

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    prisma.releaseTask.findMany.mockResolvedValue([])
    prisma.release.findMany.mockResolvedValue([])
    prisma.releaseDelivery.findMany.mockResolvedValue([])
    service = new ArtistNotificationsService(prisma)
  })

  it('queries only released releases when review notifications are muted', async () => {
    mute(ArtistNotificationCategory.REVIEW)

    await service.list('artist-1')

    const where = releaseWhere()
    expect(where).toContain(ReleaseStatus.RELEASED)
    expect(where).not.toContain(ReleaseStatus.REJECTED)
    expect(where).not.toContain(ReleaseStatus.SUBMITTED)
    expect(where).not.toContain(ReleaseStatus.READY)
  })

  it('leaves released releases out of the query when delivery notifications are muted', async () => {
    mute(ArtistNotificationCategory.DELIVERY)

    await service.list('artist-1')

    const where = releaseWhere()
    expect(where).not.toContain(ReleaseStatus.RELEASED)
    expect(where).toContain(ReleaseStatus.REJECTED)
    expect(where).toContain(ReleaseStatus.SUBMITTED)
    expect(where).toContain(ReleaseStatus.READY)
  })

  it('skips the release query when review and delivery are both muted', async () => {
    mute(ArtistNotificationCategory.REVIEW, ArtistNotificationCategory.DELIVERY)

    await service.list('artist-1')

    expect(prisma.release.findMany).not.toHaveBeenCalled()
  })
})

describe('ArtistNotificationsService.list task deadlines', () => {
  const HOUR = 60 * 60 * 1000
  let service: ArtistNotificationsService
  let prisma: PrismaMock
  const now = Date.now()
  const seenAt = new Date(now - HOUR)

  const dueTask = (dueAt: Date, createdAt: Date) => ({
    id: 'task-1',
    title: 'Clear the sample',
    dueAt,
    createdAt,
    release: { id: 'release-1', title: 'Night Signals' },
  })

  const onlyItem = async () => {
    const feed = await service.list('artist-1')
    const [item, ...rest] = feed.data
    if (!item || rest.length > 0)
      throw new Error(`expected one notification, got ${feed.data.length}`)
    return item
  }

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    prisma.artist.findFirst.mockResolvedValue({
      notificationState: { seenAt },
      notificationPreference: null,
    } as never)
    prisma.release.findMany.mockResolvedValue([])
    prisma.releaseDelivery.findMany.mockResolvedValue([])
    service = new ArtistNotificationsService(prisma)
  })

  it('reports a task created after the last read with a deadline within 48 hours as unread', async () => {
    prisma.releaseTask.findMany.mockResolvedValue([
      dueTask(new Date(now + 24 * HOUR), new Date(now - 10 * 60 * 1000)),
    ] as never)

    const item = await onlyItem()

    expect(item.kind).toBe('TASK_DUE_SOON')
    expect(item.unread).toBe(true)
  })

  it('reports a task created after the last read with a past deadline as unread', async () => {
    prisma.releaseTask.findMany.mockResolvedValue([
      dueTask(new Date(now - 2 * HOUR), new Date(now - 10 * 60 * 1000)),
    ] as never)

    const item = await onlyItem()

    expect(item.kind).toBe('TASK_OVERDUE')
    expect(item.unread).toBe(true)
  })

  it('keeps a task that entered the 48-hour window before the last read as read', async () => {
    prisma.releaseTask.findMany.mockResolvedValue([
      dueTask(new Date(now + 24 * HOUR), new Date(now - 72 * HOUR)),
    ] as never)

    const item = await onlyItem()

    expect(item.kind).toBe('TASK_DUE_SOON')
    expect(item.unread).toBe(false)
  })
})
