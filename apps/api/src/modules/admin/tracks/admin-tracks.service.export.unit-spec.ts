import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { CSV_BOM } from '@modules/admin/shared'
import { readCsvExport } from '@modules/admin/shared/__tests__/read-csv-export'
import type { TrackUploadService } from '@modules/tracks'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'

/** `TrackUploadService` pulls in `music-metadata`, which cannot be resolved under Jest. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

import { buildTrackWithArtist } from './__tests__/fixtures/admin-tracks.fixtures'
import { AdminTracksService } from './admin-tracks.service'

const STAFF_ID = 'staff-1'
const HEADER =
  'id,title,artistId,artistUsername,processingStatus,processingError,processingAttempts,processingFinishedAt,deletedAt,createdAt\r\n'

describe('AdminTracksService.exportCsv', () => {
  let service: AdminTracksService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AdminTracksService(prisma, {
      reprocess: jest.fn(),
    } as unknown as TrackUploadService)
  })

  it('writes the approved header and the artist username from the join', async () => {
    const track = buildTrackWithArtist(
      {
        id: 't1',
        title: '-evil',
        artistId: 'a1',
        processingStatus: 'FAILED',
        processingError: 'bad, codec',
        processingAttempts: 2,
        processingFinishedAt: new Date('2026-02-03T04:05:06.000Z'),
        deletedAt: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      'dj-ace',
    )
    prisma.track.count.mockResolvedValue(1)
    prisma.track.findMany.mockResolvedValue([track] as never)

    const result = await service.exportCsv({ sort: 'title', order: 'asc' }, STAFF_ID)

    expect(await readCsvExport(result.stream)).toBe(
      `${CSV_BOM}${HEADER}t1,'-evil,a1,dj-ace,FAILED,"bad, codec",2,2026-02-03T04:05:06.000Z,,2026-01-01T00:00:00.000Z\r\n`,
    )
  })

  it('applies filters and the chosen sort with the id tie-break', async () => {
    prisma.track.count.mockResolvedValue(1)
    prisma.track.findMany.mockResolvedValue([buildTrackWithArtist({ id: 't1' }, 'dj')] as never)

    await readCsvExport(
      (
        await service.exportCsv(
          { processingStatus: 'FAILED', status: 'all', q: 'x', sort: 'title', order: 'desc' },
          STAFF_ID,
        )
      ).stream,
    )

    const where: Prisma.TrackWhereInput = {
      processingStatus: 'FAILED',
      title: { contains: 'x', mode: 'insensitive' },
    }
    expect(prisma.track.count).toHaveBeenCalledWith({ where })
    expect(prisma.track.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where,
        orderBy: [{ title: 'desc' }, { id: 'desc' }],
        skip: 0,
      }),
    )
    expect(prisma.queryRaw).not.toHaveBeenCalled()
  })

  it('follows the list’s attention-first order when no sort is given, page by page', async () => {
    const failed = buildTrackWithArtist({ id: 'track-failed' }, 'dj-failed')
    const ready = buildTrackWithArtist({ id: 'track-ready' }, 'dj-ready')
    prisma.track.count.mockResolvedValue(2)
    prisma.queryRaw.mockResolvedValue([{ id: 'track-failed' }, { id: 'track-ready' }] as never)
    // findMany does not preserve `IN` order — return reversed to prove the SQL order is kept.
    prisma.track.findMany.mockResolvedValue([ready, failed] as never)

    const text = await readCsvExport((await service.exportCsv({}, STAFF_ID)).stream)

    const lines = text.split('\r\n').filter(Boolean)
    expect(lines[1]).toMatch(/^track-failed,/)
    expect(lines[2]).toMatch(/^track-ready,/)
    const sql = (prisma.queryRaw.mock.calls[0]?.[0] as Prisma.Sql).strings.join(' ')
    expect(sql).toContain('CASE "processingStatus" WHEN \'FAILED\'')
    expect(sql).toContain('"id" DESC')
  })

  it('flags truncation above the cap and writes one audit row', async () => {
    prisma.track.count.mockResolvedValue(50_001)
    prisma.track.findMany.mockResolvedValue([] as never)

    const result = await service.exportCsv({ sort: 'title', status: 'all' }, STAFF_ID)

    expect(result).toMatchObject({ truncated: true, rowCount: 50_000 })
    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1)
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'admin-tracks.export',
        entityType: 'admin-tracks',
        metadata: {
          filters: { status: 'all', sort: 'title' },
          rowCount: 50_000,
          truncated: true,
        },
      }),
    })
  })
})
