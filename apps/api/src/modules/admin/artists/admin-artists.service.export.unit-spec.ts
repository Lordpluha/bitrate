import { beforeEach, describe, expect, it } from '@jest/globals'
import { CSV_BOM } from '@modules/admin/shared'
import { readCsvExport } from '@modules/admin/shared/__tests__/read-csv-export'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { AdminArtistsService } from './admin-artists.service'

const STAFF_ID = 'staff-1'
const HEADER =
  'id,username,email,verified,monthlyListeners,country,emailVerifiedAt,twoFactorEnabled,deletedAt,createdAt\r\n'

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'a1',
  username: 'dj, "ace"',
  email: 'ace@bitrate.app',
  verified: false,
  monthlyListeners: 1200,
  country: null,
  emailVerifiedAt: null,
  twoFactorEnabled: false,
  deletedAt: new Date('2026-02-03T04:05:06.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
})

describe('AdminArtistsService.exportCsv', () => {
  let service: AdminArtistsService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AdminArtistsService(prisma)
  })

  it('writes the approved header, quoting and null/boolean/number formatting', async () => {
    prisma.artist.count.mockResolvedValue(1)
    prisma.artist.findMany.mockResolvedValue([row()] as never)

    const result = await service.exportCsv({}, STAFF_ID)

    expect(await readCsvExport(result.stream)).toBe(
      `${CSV_BOM}${HEADER}a1,"dj, ""ace""",ace@bitrate.app,false,1200,,,false,2026-02-03T04:05:06.000Z,2026-01-01T00:00:00.000Z\r\n`,
    )
  })

  it('applies verified, status, q and sort with the id tie-break', async () => {
    prisma.artist.count.mockResolvedValue(1)
    prisma.artist.findMany.mockResolvedValue([row()] as never)

    await readCsvExport(
      (
        await service.exportCsv(
          { verified: true, status: 'all', q: 'dj', sort: 'monthlyListeners', order: 'desc' },
          STAFF_ID,
        )
      ).stream,
    )

    const expectedWhere: Prisma.ArtistWhereInput = {
      verified: true,
      OR: [
        { username: { contains: 'dj', mode: 'insensitive' } },
        { email: { contains: 'dj', mode: 'insensitive' } },
      ],
    }
    expect(prisma.artist.count).toHaveBeenCalledWith({ where: expectedWhere })
    expect(prisma.artist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expectedWhere,
        orderBy: [{ monthlyListeners: 'desc' }, { id: 'desc' }],
      }),
    )
  })

  it('selects only the approved columns', async () => {
    prisma.artist.count.mockResolvedValue(1)
    prisma.artist.findMany.mockResolvedValue([row()] as never)

    await readCsvExport((await service.exportCsv({}, STAFF_ID)).stream)

    expect(Object.keys(prisma.artist.findMany.mock.calls[0]?.[0]?.select ?? {})).toEqual([
      'id',
      'username',
      'email',
      'verified',
      'monthlyListeners',
      'country',
      'emailVerifiedAt',
      'twoFactorEnabled',
      'deletedAt',
      'createdAt',
    ])
  })

  it('flags truncation above the cap and audits once', async () => {
    prisma.artist.count.mockResolvedValue(50_001)
    prisma.artist.findMany.mockResolvedValue([] as never)

    const result = await service.exportCsv({ q: 'dj' }, STAFF_ID, { requestId: 'r1' })

    expect(result).toMatchObject({ truncated: true, rowCount: 50_000 })
    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1)
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        staffId: STAFF_ID,
        action: 'admin-artists.export',
        entityType: 'admin-artists',
        metadata: {
          filters: { q: 'dj' },
          rowCount: 50_000,
          truncated: true,
          requestId: 'r1',
        },
      }),
    })
  })
})
