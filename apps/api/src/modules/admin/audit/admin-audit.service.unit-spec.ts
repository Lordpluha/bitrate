import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildAuditLog } from './__tests__/fixtures/admin-audit.fixtures'
import { AdminAuditService } from './admin-audit.service'

describe('AdminAuditService', () => {
  let service: AdminAuditService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AdminAuditService(prisma)
  })

  describe('findAll', () => {
    it('resolves a staff actor to their username in one batched lookup', async () => {
      const row = buildAuditLog({ staffId: 'staff-1', userId: null })
      prisma.auditLog.findMany.mockResolvedValue([row] as never)
      prisma.auditLog.count.mockResolvedValue(1)
      prisma.staff.findMany.mockResolvedValue([{ id: 'staff-1', username: 'ops' }] as never)
      prisma.user.findMany.mockResolvedValue([] as never)

      const result = await service.findAll({ page: 1, limit: 20 })

      expect(result.data[0]).toMatchObject({ id: 'audit-1', actorUsername: 'ops' })
      expect(prisma.staff.findMany).toHaveBeenCalledTimes(1)
      expect(prisma.user.findMany).not.toHaveBeenCalled()
    })

    it('resolves a user actor to their username when there is no staff actor', async () => {
      const row = buildAuditLog({ staffId: null, userId: 'user-1' })
      prisma.auditLog.findMany.mockResolvedValue([row] as never)
      prisma.auditLog.count.mockResolvedValue(1)
      prisma.staff.findMany.mockResolvedValue([] as never)
      prisma.user.findMany.mockResolvedValue([{ id: 'user-1', username: 'listener' }] as never)

      const result = await service.findAll({})

      expect(result.data[0]).toMatchObject({ actorUsername: 'listener' })
    })

    it('resolves to null for an anonymous row without a lookup', async () => {
      const row = buildAuditLog({ staffId: null, userId: null })
      prisma.auditLog.findMany.mockResolvedValue([row] as never)
      prisma.auditLog.count.mockResolvedValue(1)

      const result = await service.findAll({})

      expect(result.data[0]).toMatchObject({ actorUsername: null })
      expect(prisma.staff.findMany).not.toHaveBeenCalled()
      expect(prisma.user.findMany).not.toHaveBeenCalled()
    })

    it('resolves to null when the referenced staff record no longer exists', async () => {
      const row = buildAuditLog({ staffId: 'gone', userId: null })
      prisma.auditLog.findMany.mockResolvedValue([row] as never)
      prisma.auditLog.count.mockResolvedValue(1)
      prisma.staff.findMany.mockResolvedValue([] as never)

      const result = await service.findAll({})

      expect(result.data[0]).toMatchObject({ actorUsername: null })
    })

    it('applies the entityType, staffId, and date-range filters', async () => {
      prisma.auditLog.findMany.mockResolvedValue([] as never)
      prisma.auditLog.count.mockResolvedValue(0)

      const from = new Date('2026-01-01')
      const to = new Date('2026-02-01')
      await service.findAll({ entityType: 'admin-artists', staffId: 'staff-1', from, to })

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            entityType: 'admin-artists',
            staffId: 'staff-1',
            createdAt: { gte: from, lte: to },
          },
        }),
      )
    })

    it('returns an empty page for a page beyond the data', async () => {
      prisma.auditLog.findMany.mockResolvedValue([] as never)
      prisma.auditLog.count.mockResolvedValue(0)

      const result = await service.findAll({ page: 5, limit: 20 })

      expect(result).toEqual({ data: [], total: 0, page: 5, limit: 20 })
    })
  })
})
