import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { ModerationReport, ModerationStatus, Prisma } from '@prisma/client'
import type { ADMIN_REPORTS_SORT_FIELDS, UpdateReportDto } from './dtos'
import { ReportNotFoundException } from './errors'

/** One of the moderation queue's allowed sort fields. */
type AdminReportsSortField = (typeof ADMIN_REPORTS_SORT_FIELDS)[number]

/** Input for listing moderation reports. */
type ListReportsInput = {
  page?: number
  limit?: number
  status?: ModerationStatus
  entityType?: string
} & SortInput<AdminReportsSortField>

/** The reported entity, resolved to what the operator needs to link to and judge it. `null`
 * when the entity type is unrecognised or the row no longer exists — never a 500. */
type ModerationSubject = {
  kind: string
  id: string
  title: string
  deletedAt: Date | null
  parentId: string | null
} | null

/** How many sibling reports on the same subject the detail response includes. */
const SIBLING_REPORTS_LIMIT = 20

const RESOLVED_STATUSES: ModerationStatus[] = ['RESOLVED', 'REJECTED']

/** Handles the operator-facing moderation report queue. */
@Injectable()
export class AdminModerationService {
  constructor(private readonly prisma: PrismaService) {}

  /** Runs the find all operation, paginated and optionally filtered by status/entity type. */
  async findAll({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    status,
    entityType,
    sort,
    order,
  }: ListReportsInput) {
    const where = {
      ...(status && { status }),
      ...(entityType && { entityType }),
    } satisfies Prisma.ModerationReportWhereInput
    const orderBy = buildSortOrderBy({ sort, order }, [{ createdAt: 'desc' }, { id: 'desc' }])
    const [data, total] = await Promise.all([
      this.prisma.moderationReport.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy as unknown as Prisma.ModerationReportOrderByWithRelationInput[],
      }),
      this.prisma.moderationReport.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /** Runs the find by id operation, resolving the reported subject and its sibling reports. */
  async findById(id: string) {
    const report = await this.prisma.moderationReport.findFirst({ where: { id } })
    if (!report) throw new ReportNotFoundException(id)

    const [subject, siblingReports] = await Promise.all([
      this.resolveSubject(report.entityType, report.entityId),
      this.findSiblingReports(report),
    ])

    return { ...report, subject, siblingReports }
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

  /** Other reports naming the same `entityType`/`entityId`, newest first, bounded. */
  private findSiblingReports(report: ModerationReport): Promise<ModerationReport[]> {
    return this.prisma.moderationReport.findMany({
      where: {
        entityType: report.entityType,
        entityId: report.entityId,
        id: { not: report.id },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: SIBLING_REPORTS_LIMIT,
    })
  }

  /**
   * Resolves a report's `entityType`/`entityId` to the entity it names, so the operator can
   * link straight to it and see whether it's already been taken down. Never throws: an
   * unrecognised `entityType` or a row that no longer exists both resolve to `null`.
   */
  private async resolveSubject(entityType: string, entityId: string): Promise<ModerationSubject> {
    const kind = entityType.toLowerCase()

    switch (kind) {
      case 'track': {
        const row = await this.prisma.track.findUnique({
          where: { id: entityId },
          select: { id: true, title: true, deletedAt: true },
        })
        return row
          ? { kind, id: row.id, title: row.title, deletedAt: row.deletedAt, parentId: null }
          : null
      }
      case 'album': {
        const row = await this.prisma.album.findUnique({
          where: { id: entityId },
          select: { id: true, title: true, deletedAt: true },
        })
        return row
          ? { kind, id: row.id, title: row.title, deletedAt: row.deletedAt, parentId: null }
          : null
      }
      case 'playlist': {
        const row = await this.prisma.playlist.findUnique({
          where: { id: entityId },
          select: { id: true, title: true, deletedAt: true },
        })
        return row
          ? { kind, id: row.id, title: row.title, deletedAt: row.deletedAt, parentId: null }
          : null
      }
      case 'artist': {
        const row = await this.prisma.artist.findUnique({
          where: { id: entityId },
          select: { id: true, username: true, deletedAt: true },
        })
        return row
          ? { kind, id: row.id, title: row.username, deletedAt: row.deletedAt, parentId: null }
          : null
      }
      case 'podcast': {
        const row = await this.prisma.podcast.findUnique({
          where: { id: entityId },
          select: { id: true, title: true, deletedAt: true },
        })
        return row
          ? { kind, id: row.id, title: row.title, deletedAt: row.deletedAt, parentId: null }
          : null
      }
      case 'episode': {
        const row = await this.prisma.episode.findUnique({
          where: { id: entityId },
          select: { id: true, title: true, deletedAt: true, podcastId: true },
        })
        return row
          ? {
              kind,
              id: row.id,
              title: row.title,
              deletedAt: row.deletedAt,
              parentId: row.podcastId,
            }
          : null
      }
      case 'user': {
        const row = await this.prisma.user.findUnique({
          where: { id: entityId },
          select: { id: true, username: true, deletedAt: true },
        })
        return row
          ? { kind, id: row.id, title: row.username, deletedAt: row.deletedAt, parentId: null }
          : null
      }
      default:
        return null
    }
  }
}
