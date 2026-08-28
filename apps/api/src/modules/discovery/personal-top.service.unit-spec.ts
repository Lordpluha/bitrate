import { beforeEach, describe, expect, it } from '@jest/globals'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { PersonalTopService } from './personal-top.service'

/** Joins every raw query issued in one call into a single searchable string. */
const executedSql = (prisma: PrismaMock) =>
  prisma.queryRaw.mock.calls.map(([query]) => (query as Prisma.Sql).strings.join(' ')).join(' ')

describe('PersonalTopService', () => {
  let service: PersonalTopService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new PersonalTopService(prisma)
  })

  it('returns the total matching ready tracks rather than the current page length', async () => {
    prisma.queryRaw
      .mockResolvedValueOnce([{ id: 'track-2', plays: 7n }] as never)
      .mockResolvedValueOnce([{ total: 41n }] as never)
    prisma.track.findMany.mockResolvedValue([
      { id: 'track-2', title: 'Track', artist: { id: 'artist-1' } },
    ] as never)

    const result = await service.getTopTracks('user-1', 'medium', 3, 20)

    expect(result).toMatchObject({ total: 41, page: 3, limit: 20 })
    expect(result.data).toHaveLength(1)
    expect(executedSql(prisma)).toContain('t."deletedAt" IS NULL')
    expect(executedSql(prisma)).toContain('t."processingStatus" = \'READY\'')
  })

  it('counts only playable tracks belonging to non-deleted artists', async () => {
    prisma.queryRaw
      .mockResolvedValueOnce([{ id: 'artist-1', plays: 9n }] as never)
      .mockResolvedValueOnce([{ total: 27n }] as never)
    prisma.artist.findMany.mockResolvedValue([{ id: 'artist-1', username: 'Artist' }] as never)

    const result = await service.getTopArtists('user-1', 'long', 2, 10)

    expect(result).toMatchObject({ total: 27, page: 2, limit: 10 })
    expect(executedSql(prisma)).toContain('a."deletedAt" IS NULL')
    expect(executedSql(prisma)).toContain('t."processingStatus" = \'READY\'')
  })

  it('drops ranked rows whose entity no longer exists', async () => {
    prisma.queryRaw
      .mockResolvedValueOnce([
        { id: 'track-1', plays: 5n },
        { id: 'track-gone', plays: 3n },
      ] as never)
      .mockResolvedValueOnce([{ total: 2n }] as never)
    prisma.track.findMany.mockResolvedValue([{ id: 'track-1', title: 'Track' }] as never)

    const result = await service.getTopTracks('user-1', 'short')

    expect(result.data).toEqual([{ id: 'track-1', title: 'Track', plays: 5 }])
  })
})
