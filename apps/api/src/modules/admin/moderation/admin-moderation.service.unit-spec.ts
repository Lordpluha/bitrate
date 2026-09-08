import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { AdminModerationService } from './admin-moderation.service'
import { ReportNotFoundException } from './errors'

const REPORT = {
  id: 'report-1',
  reporterId: 'user-1',
  entityType: 'track',
  entityId: 'track-1',
  reason: 'spam',
  details: null,
  status: 'OPEN',
  resolvedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AdminModerationService', () => {
  let service: AdminModerationService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AdminModerationService(prisma)
  })

  describe('findAll', () => {
    it('returns a paginated page filtered by status', async () => {
      prisma.moderationReport.findMany.mockResolvedValue([REPORT] as never)
      prisma.moderationReport.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 2, limit: 5, status: 'OPEN' })

      expect(result).toEqual({ data: [REPORT], total: 1, page: 2, limit: 5 })
      expect(prisma.moderationReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'OPEN' }, skip: 5, take: 5 }),
      )
    })
  })

  describe('findById', () => {
    it('throws ReportNotFoundException when the report does not exist', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(ReportNotFoundException)
    })

    it('returns the report when found', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue(REPORT as never)

      await expect(service.findById('report-1')).resolves.toEqual(REPORT)
    })
  })

  describe('updateStatus', () => {
    it('throws ReportNotFoundException when the report does not exist', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue(null)

      await expect(service.updateStatus('missing', { status: 'RESOLVED' })).rejects.toThrow(
        ReportNotFoundException,
      )
    })

    it('sets resolvedAt when moving to a terminal status', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue(REPORT as never)
      prisma.moderationReport.update.mockResolvedValue({
        ...REPORT,
        status: 'RESOLVED',
        resolvedAt: new Date(),
      } as never)

      await service.updateStatus('report-1', { status: 'RESOLVED' })

      expect(prisma.moderationReport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'report-1' },
          data: expect.objectContaining({ status: 'RESOLVED' }),
        }),
      )
      const call = prisma.moderationReport.update.mock.calls[0]?.[0]
      expect(call?.data.resolvedAt).toBeInstanceOf(Date)
    })

    it('clears resolvedAt when moving back to a non-terminal status', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue({
        ...REPORT,
        status: 'RESOLVED',
        resolvedAt: new Date(),
      } as never)
      prisma.moderationReport.update.mockResolvedValue(REPORT as never)

      await service.updateStatus('report-1', { status: 'REVIEWING' })

      const call = prisma.moderationReport.update.mock.calls[0]?.[0]
      expect(call?.data.resolvedAt).toBeNull()
    })
  })
})
