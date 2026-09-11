import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { ModerationStatus } from '@prisma/client'
import type { UpdateReportDto } from './dtos'
import { ReportNotFoundException } from './errors'

/** Input for listing moderation reports. */
type ListReportsInput = { page?: number; limit?: number; status?: ModerationStatus }

const RESOLVED_STATUSES: ModerationStatus[] = ['RESOLVED', 'REJECTED']

/** Handles the operator-facing moderation report queue. */
@Injectable()
export class AdminModerationService {
  constructor(private readonly prisma: PrismaService) {}

  /** Runs the find all operation, paginated and optionally filtered by status. */
  async findAll({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, status }: ListReportsInput) {
    const where = status ? { status } : {}
    const [data, total] = await Promise.all([
      this.prisma.moderationReport.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.moderationReport.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /** Runs the find by id operation. */
  async findById(id: string) {
    const report = await this.prisma.moderationReport.findFirst({ where: { id } })
    if (!report) throw new ReportNotFoundException(id)
    return report
  }

  /** Runs the update status operation. Sets/clears `resolvedAt` to match the new status. */
  async updateStatus(id: string, dto: UpdateReportDto) {
    const existing = await this.prisma.moderationReport.findFirst({ where: { id } })
    if (!existing) throw new ReportNotFoundException(id)

    return await this.prisma.moderationReport.update({
      where: { id },
      data: {
        status: dto.status,
        resolvedAt: RESOLVED_STATUSES.includes(dto.status) ? new Date() : null,
      },
    })
  }
}
