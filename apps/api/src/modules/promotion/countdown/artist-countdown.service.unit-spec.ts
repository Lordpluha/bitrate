import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { ArtistCountdownService } from './artist-countdown.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const NOW = new Date('2026-12-01T12:00:00Z')
const SOON = new Date('2026-12-10T18:00:00Z')
const LATER = new Date('2027-01-20T18:00:00Z')

const release = (id: string, scheduledAt: Date, countdownOffsets: number[]) => ({
  id,
  title: `Release ${id}`,
  cover: `covers/${id}.webp`,
  scheduledAt,
  promotionPlans: [{ steps: countdownOffsets.map((offsetDays) => ({ offsetDays })) }],
})

describe('ArtistCountdownService', () => {
  let prisma: PrismaMock
  let service: ArtistCountdownService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new ArtistCountdownService(prisma)
  })

  it('reads only unpublished, future releases of an artist with promotion on', async () => {
    prisma.release.findMany.mockResolvedValue([])
    await expect(service.countdown(ARTIST, NOW)).resolves.toEqual({ countdown: null })
    expect(prisma.release.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ownerArtistId: ARTIST,
          deletedAt: null,
          publishedAt: null,
          scheduledAt: { gt: NOW },
          owner: { deletedAt: null, promotionEnabled: true },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
    )
  })

  it('shows the soonest release whose approved countdown has started', async () => {
    prisma.release.findMany.mockResolvedValue([
      release('a', SOON, [-14]),
      release('b', LATER, [-60]),
    ] as never)
    await expect(service.countdown(ARTIST, NOW)).resolves.toEqual({
      countdown: {
        releaseId: 'a',
        title: 'Release a',
        cover: 'covers/a.webp',
        releaseAt: SOON,
      },
    })
  })

  it('waits for the countdown day, and skips releases without an approved countdown', async () => {
    prisma.release.findMany.mockResolvedValue([
      release('a', SOON, [-3]),
      release('b', LATER, []),
    ] as never)
    await expect(service.countdown(ARTIST, NOW)).resolves.toEqual({ countdown: null })
  })

  it('reads the approved countdown steps of the newest plan version only', async () => {
    prisma.release.findMany.mockResolvedValue([])
    await service.countdown(ARTIST, NOW)
    expect(prisma.release.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          promotionPlans: {
            orderBy: { version: 'desc' },
            take: 1,
            select: {
              steps: {
                where: { kind: 'COUNTDOWN', state: { in: ['APPROVED', 'EDITED', 'DONE'] } },
                select: { offsetDays: true },
              },
            },
          },
        }),
      }),
    )
  })
})
