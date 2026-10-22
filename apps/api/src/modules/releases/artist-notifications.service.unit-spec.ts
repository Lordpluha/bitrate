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
