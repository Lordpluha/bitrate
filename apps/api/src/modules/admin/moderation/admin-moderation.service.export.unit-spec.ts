import { beforeEach, describe, expect, it } from '@jest/globals'
import { CSV_BOM } from '@modules/admin/shared'
import { readCsvExport } from '@modules/admin/shared/__tests__/read-csv-export'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { AdminModerationService } from './admin-moderation.service'

const STAFF_ID = 'staff-1'
const HEADER = 'id,status,entityType,entityId,reason,details,reporterId,resolvedAt,createdAt\r\n'

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'r1',
  status: 'RESOLVED',
  entityType: 'track',
  entityId: 't1',
  reason: 'spam',
  details: 'line1\nline2',
  reporterId: 'u1',
  resolvedAt: new Date('2026-02-03T04:05:06.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
})

describe('AdminModerationService.exportCsv', () => {
  let service: AdminModerationService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AdminModerationService(prisma)
  })

  it('writes the approved header and quotes multi-line details', async () => {
    prisma.moderationReport.count.mockResolvedValue(1)
    prisma.moderationReport.findMany.mockResolvedValue([row()] as never)

    const result = await service.exportCsv({}, STAFF_ID)

    expect(await readCsvExport(result.stream)).toBe(
      `${CSV_BOM}${HEADER}r1,RESOLVED,track,t1,spam,"line1\nline2",u1,2026-02-03T04:05:06.000Z,2026-01-01T00:00:00.000Z\r\n`,
    )
  })

  it('guards a reason that starts with a formula character', async () => {
    prisma.moderationReport.count.mockResolvedValue(1)
    prisma.moderationReport.findMany.mockResolvedValue([
      row({ reason: '@cmd', details: null }),
    ] as never)

    const text = await readCsvExport((await service.exportCsv({}, STAFF_ID)).stream)

    expect(text).toContain(",'@cmd,,u1,")
  })

  it('applies status, entityType and sort with the id tie-break across batches', async () => {
    prisma.moderationReport.count.mockResolvedValue(1)
    prisma.moderationReport.findMany.mockResolvedValue([row()] as never)

    await readCsvExport(
      (
        await service.exportCsv(
          { status: 'OPEN', entityType: 'track', sort: 'status', order: 'asc' },
          STAFF_ID,
        )
      ).stream,
    )

    const where: Prisma.ModerationReportWhereInput = { status: 'OPEN', entityType: 'track' }
    expect(prisma.moderationReport.count).toHaveBeenCalledWith({ where })
    expect(prisma.moderationReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where,
        orderBy: [{ status: 'asc' }, { id: 'asc' }],
        skip: 0,
      }),
    )
  })

  it('defaults to newest first with an id tie-break', async () => {
    prisma.moderationReport.count.mockResolvedValue(1)
    prisma.moderationReport.findMany.mockResolvedValue([row()] as never)

    await readCsvExport((await service.exportCsv({}, STAFF_ID)).stream)

    expect(prisma.moderationReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }),
    )
  })

  it('selects only the approved columns', async () => {
    prisma.moderationReport.count.mockResolvedValue(1)
    prisma.moderationReport.findMany.mockResolvedValue([row()] as never)

    await readCsvExport((await service.exportCsv({}, STAFF_ID)).stream)

    expect(Object.keys(prisma.moderationReport.findMany.mock.calls[0]?.[0]?.select ?? {})).toEqual([
      'id',
      'status',
      'entityType',
      'entityId',
      'reason',
      'details',
      'reporterId',
      'resolvedAt',
      'createdAt',
    ])
  })

  it('flags truncation above the cap and writes one audit row', async () => {
    prisma.moderationReport.count.mockResolvedValue(50_001)
    prisma.moderationReport.findMany.mockResolvedValue([] as never)

    const result = await service.exportCsv({ status: 'OPEN' }, STAFF_ID, { ipAddress: '1.2.3.4' })

    expect(result).toMatchObject({ truncated: true, rowCount: 50_000 })
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'admin-moderation.export',
        entityType: 'admin-moderation',
        ipAddress: '1.2.3.4',
        metadata: { filters: { status: 'OPEN' }, rowCount: 50_000, truncated: true },
      }),
    })
  })
})
