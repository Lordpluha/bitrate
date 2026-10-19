import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { LISTENING_WINDOW_DAYS, ListeningStatsService } from './listening-stats.service'

const sqlOf = (call: unknown) => {
  const query = call as Prisma.Sql
  return { text: query.strings.join(' '), values: query.values }
}

describe('ListeningStatsService', () => {
  let service: ListeningStatsService
  let prisma: PrismaMock
  const now = new Date('2026-10-14T12:00:00.000Z').getTime()

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    jest.useFakeTimers({ now })
    prisma.$executeRaw.mockResolvedValue(0 as never)
    prisma.$transaction.mockImplementation(
      (ops: unknown) => Promise.all(ops as Promise<unknown>[]) as never,
    )
    service = new ListeningStatsService(prisma)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('recomputes track play counts and popularity from listening history', async () => {
    await service.recompute()

    const track = sqlOf(prisma.$executeRaw.mock.calls[0]?.[0])
    expect(track.text).toContain('UPDATE "Track"')
    expect(track.text).toContain('FROM "ListeningHistory"')
    /* a play is one listener in one hour, the same unit the charts rank by */
    expect(track.text).toContain(
      'COUNT(DISTINCT (h."userId", date_trunc(\'hour\', h."listenedAt")))',
    )
    expect(track.text).toContain('"playCount" = COALESCE(')
    expect(track.text).toContain('"popularity" = COALESCE(')
    expect(track.values).toContainEqual(new Date(now - LISTENING_WINDOW_DAYS * 24 * 60 * 60 * 1000))
  })

  it('recomputes artist monthly listeners as distinct listeners in the window', async () => {
    await service.recompute()

    const artist = sqlOf(prisma.$executeRaw.mock.calls[1]?.[0])
    expect(artist.text).toContain('UPDATE "Artist"')
    expect(artist.text).toContain('COUNT(DISTINCT h."userId")')
    expect(artist.text).toContain('"monthlyListeners" = COALESCE(')
    expect(artist.values).toContainEqual(
      new Date(now - LISTENING_WINDOW_DAYS * 24 * 60 * 60 * 1000),
    )
  })

  it('resets rows without plays to zero and only writes rows whose value changes', async () => {
    await service.recompute()

    for (const [call] of prisma.$executeRaw.mock.calls) {
      const { text } = sqlOf(call)
      /* LEFT JOIN keeps unplayed rows; IS DISTINCT FROM skips rows already up to date */
      expect(text).toContain('LEFT JOIN')
      expect(text).toContain('IS DISTINCT FROM')
    }
  })

  it('runs both updates in one transaction', async () => {
    await service.recompute()

    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(2)
  })
})
