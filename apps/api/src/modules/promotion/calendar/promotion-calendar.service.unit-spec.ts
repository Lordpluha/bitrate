import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { PromotionCalendarService } from './promotion-calendar.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const RELEASE = 'b0000000-0000-7000-8000-000000000001'
const DATE = new Date('2026-12-10T18:00:00Z')

const step = (id: string, offsetDays: number, state = 'APPROVED') => ({
  id,
  offsetDays,
  phase: offsetDays < 0 ? 'PRE' : 'POST',
  kind: 'POST',
  channels: ['INSTAGRAM'],
  title: `Step ${id}`,
  state,
  aiGenerated: true,
})

describe('PromotionCalendarService', () => {
  let prisma: PrismaMock
  let service: PromotionCalendarService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new PromotionCalendarService(prisma)
  })

  it('lists the dated steps of each latest plan inside the window, soonest first', async () => {
    prisma.release.findMany.mockResolvedValue([
      {
        id: RELEASE,
        title: 'Afterglow',
        cover: 'covers/a.webp',
        scheduledAt: DATE,
        promotionPlans: [{ steps: [step('s2', 3), step('s1', -7), step('s3', -27)] }],
      },
    ] as never)
    const from = new Date('2026-11-20T00:00:00Z')
    const to = new Date('2026-12-20T00:00:00Z')
    const entries = await service.calendar(ARTIST, from, to)

    expect(prisma.release.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerArtistId: ARTIST, deletedAt: null, scheduledAt: { not: null } },
      }),
    )
    expect(entries.map((entry) => [entry.stepId, entry.dueAt.toISOString()])).toEqual([
      ['s1', '2026-12-03T18:00:00.000Z'],
      ['s2', '2026-12-13T18:00:00.000Z'],
    ])
    expect(entries[0]).toMatchObject({
      releaseId: RELEASE,
      releaseTitle: 'Afterglow',
      cover: 'covers/a.webp',
      title: 'Step s1',
      state: 'APPROVED',
    })
  })

  it('reads only steps that are not rejected, from the newest version', async () => {
    prisma.release.findMany.mockResolvedValue([] as never)
    await service.calendar(ARTIST, new Date(), new Date())
    expect(prisma.release.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          promotionPlans: expect.objectContaining({
            orderBy: { version: 'desc' },
            take: 1,
            select: {
              steps: expect.objectContaining({ where: { state: { not: 'REJECTED' } } }),
            },
          }),
        }),
      }),
    )
  })
})
