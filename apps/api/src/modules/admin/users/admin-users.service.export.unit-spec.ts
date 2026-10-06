import { beforeEach, describe, expect, it } from '@jest/globals'
import { CSV_BOM, CSV_EXPORT_MAX_ROWS } from '@modules/admin/shared'
import { readCsvExport } from '@modules/admin/shared/__tests__/read-csv-export'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { AdminUsersService } from './admin-users.service'

const STAFF_ID = 'staff-1'
const HEADER =
  'id,username,email,emailVerifiedAt,twoFactorEnabled,lockedUntil,deletedAt,createdAt\r\n'

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'u1',
  username: 'listener',
  email: 'listener@bitrate.app',
  emailVerifiedAt: new Date('2026-01-02T03:04:05.000Z'),
  twoFactorEnabled: true,
  lockedUntil: null,
  deletedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
})

describe('AdminUsersService.exportCsv', () => {
  let service: AdminUsersService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AdminUsersService(prisma)
  })

  it('writes the exact approved header and formats dates, booleans and nulls', async () => {
    prisma.user.count.mockResolvedValue(1)
    prisma.user.findMany.mockResolvedValue([row()] as never)

    const result = await service.exportCsv({}, STAFF_ID)
    const text = await readCsvExport(result.stream)

    expect(text).toBe(
      `${CSV_BOM}${HEADER}u1,listener,listener@bitrate.app,2026-01-02T03:04:05.000Z,true,,,2026-01-01T00:00:00.000Z\r\n`,
    )
    expect(result).toMatchObject({ truncated: false, rowCount: 1 })
  })

  it('applies the list filters and sort, with the id tie-break, across every batch', async () => {
    prisma.user.count.mockResolvedValue(2)
    prisma.user.findMany.mockResolvedValue([row()] as never)

    const result = await service.exportCsv(
      { status: 'deactivated', q: 'ann', sort: 'username', order: 'asc' },
      STAFF_ID,
    )
    await readCsvExport(result.stream)

    const expectedWhere: Prisma.UserWhereInput = {
      deletedAt: { not: null },
      OR: [
        { username: { contains: 'ann', mode: 'insensitive' } },
        { email: { contains: 'ann', mode: 'insensitive' } },
      ],
    }
    expect(prisma.user.count).toHaveBeenCalledWith({ where: expectedWhere })
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expectedWhere,
        orderBy: [{ username: 'asc' }, { id: 'asc' }],
        skip: 0,
      }),
    )
  })

  it('defaults to active rows ordered newest first with an id tie-break', async () => {
    prisma.user.count.mockResolvedValue(1)
    prisma.user.findMany.mockResolvedValue([row()] as never)

    const result = await service.exportCsv({}, STAFF_ID)
    await readCsvExport(result.stream)

    expect(prisma.user.count).toHaveBeenCalledWith({ where: { deletedAt: null } })
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }),
    )
  })

  it('never selects columns outside the approved set', async () => {
    prisma.user.count.mockResolvedValue(1)
    prisma.user.findMany.mockResolvedValue([row()] as never)

    await readCsvExport((await service.exportCsv({}, STAFF_ID)).stream)

    const select = prisma.user.findMany.mock.calls[0]?.[0]?.select
    expect(Object.keys(select ?? {})).toEqual([
      'id',
      'username',
      'email',
      'emailVerifiedAt',
      'twoFactorEnabled',
      'lockedUntil',
      'deletedAt',
      'createdAt',
    ])
  })

  it('neutralises a username that starts with a formula character', async () => {
    prisma.user.count.mockResolvedValue(1)
    prisma.user.findMany.mockResolvedValue([row({ username: '=HYPERLINK("x")' })] as never)

    const text = await readCsvExport((await service.exportCsv({}, STAFF_ID)).stream)

    expect(text).toContain(`"'=HYPERLINK(""x"")"`)
  })

  it('caps at 50 000 rows, flags truncation and stops fetching', async () => {
    prisma.user.count.mockResolvedValue(CSV_EXPORT_MAX_ROWS + 5)
    prisma.user.findMany.mockImplementation((async (args: { take: number }) =>
      Array.from({ length: args.take }, () => row())) as never)

    const result = await service.exportCsv({}, STAFF_ID)
    const text = await readCsvExport(result.stream)

    expect(result).toMatchObject({ truncated: true, rowCount: CSV_EXPORT_MAX_ROWS })
    expect(text.split('\r\n').filter(Boolean)).toHaveLength(CSV_EXPORT_MAX_ROWS + 1)
  })

  it('writes one audit row with the filter summary and row count', async () => {
    prisma.user.count.mockResolvedValue(3)
    prisma.user.findMany.mockResolvedValue([] as never)

    await service.exportCsv({ status: 'all', q: 'ann', sort: 'email', order: 'desc' }, STAFF_ID, {
      requestId: 'req-1',
      ipAddress: '10.0.0.1',
    })

    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1)
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        staffId: STAFF_ID,
        action: 'admin-users.export',
        entityType: 'admin-users',
        entityId: null,
        ipAddress: '10.0.0.1',
        metadata: {
          filters: { status: 'all', q: 'ann', sort: 'email', order: 'desc' },
          rowCount: 3,
          truncated: false,
          requestId: 'req-1',
        },
      },
    })
  })
})
