import { beforeEach, describe, expect, it, type jest } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { HistoryService } from './history.service'

describe('HistoryService', () => {
  let prisma: PrismaMock
  let service: HistoryService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new HistoryService(prisma)
  })

  it('counts distinct playable tracks without loading every group', async () => {
    ;(
      prisma.listeningHistory.groupBy as unknown as jest.Mock<() => Promise<unknown>>
    ).mockResolvedValue([
      { trackId: 'track-2', _max: { listenedAt: new Date('2026-08-02') } },
      { trackId: 'track-1', _max: { listenedAt: new Date('2026-08-01') } },
    ])
    prisma.queryRaw.mockResolvedValue([{ total: 42n }] as never)
    prisma.listeningHistory.findMany.mockResolvedValue([
      { id: 'h1', trackId: 'track-1' },
      { id: 'h2', trackId: 'track-2' },
    ] as never)

    const result = await service.getHistory('user-1', 2, 20)

    expect(result.total).toBe(42)
    expect(result.data.map(({ trackId }) => trackId)).toEqual(['track-2', 'track-1'])
    expect(prisma.listeningHistory.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          track: { processingStatus: 'READY', deletedAt: null },
        },
        skip: 20,
        take: 20,
      }),
    )
  })

  it('keeps the real total on an empty page and skips the entry lookup', async () => {
    ;(
      prisma.listeningHistory.groupBy as unknown as jest.Mock<() => Promise<unknown>>
    ).mockResolvedValue([])
    prisma.queryRaw.mockResolvedValue([{ total: 7n }] as never)

    await expect(service.getHistory('user-1', 3, 20)).resolves.toEqual({
      data: [],
      total: 7,
      page: 3,
      limit: 20,
    })
    expect(prisma.listeningHistory.findMany).not.toHaveBeenCalled()
  })
})
