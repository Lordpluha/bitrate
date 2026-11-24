import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { NotificationsService } from './notifications.service'

const LIVE = new Date('2026-12-10T18:00:00Z')
const album = {
  id: 'al1',
  title: 'Afterglow',
  publishedAt: LIVE,
  artist: { id: 'ar1', username: 'Mira Sol' },
  tracks: [{ track: { id: 't1', title: 'Night Signal' } }],
}

describe('NotificationsService.notifyReleasePublished', () => {
  let service: NotificationsService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new NotificationsService(prisma)
    prisma.album.findFirst.mockResolvedValue(album as never)
    prisma.userFollowedArtist.findMany.mockResolvedValue([{ userId: 'u1' }] as never)
    prisma.notification.findMany.mockResolvedValue([])
  })

  const payloadOf = () => {
    const call = prisma.notification.createMany.mock.calls[0]?.[0] as {
      data: { payload: Record<string, unknown> }[]
    }
    return call.data[0]?.payload
  }

  it('adds the follower message the artist approved before the release went live', async () => {
    prisma.promotionPlan.findFirst.mockResolvedValue({
      steps: [{ body: 'Thank you for waiting!', aiGenerated: true }],
    } as never)
    await service.notifyReleasePublished({ albumId: 'al1' })
    expect(prisma.promotionPlan.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { release: { albumId: 'al1' } } }),
    )
    expect(payloadOf()).toEqual({
      trackId: 't1',
      trackTitle: 'Night Signal',
      albumId: 'al1',
      albumTitle: 'Afterglow',
      artistMessage: 'Thank you for waiting!',
      artistMessageAiGenerated: true,
      artistId: 'ar1',
      artistName: 'Mira Sol',
    })
  })

  it('sends the notification unchanged without an approved message', async () => {
    prisma.promotionPlan.findFirst.mockResolvedValue(null)
    await service.notifyReleasePublished({ albumId: 'al1' })
    expect(payloadOf()).toEqual({
      trackId: 't1',
      trackTitle: 'Night Signal',
      albumId: 'al1',
      albumTitle: 'Afterglow',
      artistId: 'ar1',
      artistName: 'Mira Sol',
    })
  })
})
