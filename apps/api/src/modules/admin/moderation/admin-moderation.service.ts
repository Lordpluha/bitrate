import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  type AuditContextValue,
  type CsvExport,
  openCsvExport,
  runBatch,
  writeTakeDownAudit,
} from '@modules/admin/shared'
import { Injectable } from '@nestjs/common'
import type { ModerationReport, ModerationStatus, Prisma } from '@prisma/client'
import type { ADMIN_REPORTS_SORT_FIELDS, UpdateReportDto } from './dtos'
import { ReportNotFoundException, ReportStatusChangedException } from './errors'
import { ADMIN_REPORT_EXPORT_COLUMNS, ADMIN_REPORT_EXPORT_SELECT } from './report-export.columns'

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

/** A reported entity's row, reduced to what the operator needs to link to and judge it. */
type SubjectRow = { id: string; title: string; deletedAt: Date | null; parentId: string | null }

/** Reads one reportable entity by id; `null` when the row no longer exists. */
type SubjectResolver = (prisma: PrismaService, id: string) => Promise<SubjectRow | null>

const TITLE_SELECT = { id: true, title: true, deletedAt: true } as const
const USERNAME_SELECT = { id: true, username: true, deletedAt: true } as const

/** What {@link TITLE_SELECT} reads. */
type TitledRow = { id: string; title: string; deletedAt: Date | null }

/** What {@link USERNAME_SELECT} reads. */
type AccountRow = { id: string; username: string; deletedAt: Date | null }

/** A titled entity (track, album, …) with no parent. */
const titled = (row: TitledRow | null): SubjectRow | null =>
  row && { id: row.id, title: row.title, deletedAt: row.deletedAt, parentId: null }

/** An account (user, artist), shown by its username. */
const account = (row: AccountRow | null): SubjectRow | null =>
  row && { id: row.id, title: row.username, deletedAt: row.deletedAt, parentId: null }

/**
 * How each reportable entity type resolves, keyed by the lower-cased `entityType`. A `Map`, not
 * an object, so a free-text type such as `constructor` can never hit a prototype member.
 */
const SUBJECT_RESOLVERS = new Map<string, SubjectResolver>([
  [
    'track',
    async (prisma, id) =>
      titled(await prisma.track.findUnique({ where: { id }, select: TITLE_SELECT })),
  ],
  [
    'album',
    async (prisma, id) =>
      titled(await prisma.album.findUnique({ where: { id }, select: TITLE_SELECT })),
  ],
  [
    'playlist',
    async (prisma, id) =>
      titled(await prisma.playlist.findUnique({ where: { id }, select: TITLE_SELECT })),
  ],
  [
    'podcast',
    async (prisma, id) =>
      titled(await prisma.podcast.findUnique({ where: { id }, select: TITLE_SELECT })),
  ],
  [
    'artist',
    async (prisma, id) =>
      account(await prisma.artist.findUnique({ where: { id }, select: USERNAME_SELECT })),
  ],
  [
    'user',
    async (prisma, id) =>
      account(await prisma.user.findUnique({ where: { id }, select: USERNAME_SELECT })),
  ],
  [
    'episode',
    async (prisma, id) => {
      const row = await prisma.episode.findUnique({
        where: { id },
        select: { ...TITLE_SELECT, podcastId: true },
      })
      return (
        row && { id: row.id, title: row.title, deletedAt: row.deletedAt, parentId: row.podcastId }
      )
    },
  ],
])

/** The queue's `where` clause, shared by the list and its export. */
function buildWhere({
  status,
  entityType,
}: Pick<ListReportsInput, 'status' | 'entityType'>): Prisma.ModerationReportWhereInput {
  return { ...(status && { status }), ...(entityType && { entityType }) }
}

/** How many sibling reports on the same subject the detail response includes. */
const SIBLING_REPORTS_LIMIT = 20

/** Who advanced a report, so `updateStatus` can write the explicit audit row in its transaction. */
type ReportAdvanceAudit = { staffId: string } & AuditContextValue

const RESOLVED_STATUSES: ModerationStatus[] = ['RESOLVED', 'REJECTED']

/** Handles the operator-facing moderation report queue. */
@Injectable()
export class AdminModerationService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lists reports, paginated and optionally filtered by status/entity type. */
  async findAll({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    status,
    entityType,
    sort,
    order,
  }: ListReportsInput) {
    const where = buildWhere({ status, entityType })
    const orderBy = buildSortOrderBy<Prisma.ModerationReportOrderByWithRelationInput>(
      { sort, order },
      [{ createdAt: 'desc' }, { id: 'desc' }],
    )
    const [data, total] = await Promise.all([
      this.prisma.moderationReport.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.moderationReport.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /**
   * Streams every report matching the queue's filters and sort as CSV (capped, see
   * `CSV_EXPORT_MAX_ROWS`), using the list's `where` and ordering so the file equals the rows
   * the queue shows across all pages. Batches page by offset; one batch is held at a time.
   */
  async exportCsv(
    { status, entityType, sort, order }: Omit<ListReportsInput, 'page' | 'limit'>,
    staffId: string,
    auditContext: AuditContextValue = {},
  ): Promise<CsvExport> {
    const where = buildWhere({ status, entityType })
    const orderBy = buildSortOrderBy<Prisma.ModerationReportOrderByWithRelationInput>(
      { sort, order },
      [{ createdAt: 'desc' }, { id: 'desc' }],
    )
    const total = await this.prisma.moderationReport.count({ where })

    return openCsvExport({
      prisma: this.prisma,
      resource: 'admin-moderation',
      staffId,
      filters: { status, entityType, sort, order },
      auditContext,
      columns: ADMIN_REPORT_EXPORT_COLUMNS,
      total,
      fetchPage: (skip, take) =>
        this.prisma.moderationReport.findMany({
          where,
          select: ADMIN_REPORT_EXPORT_SELECT,
          orderBy,
          skip,
          take,
        }),
    })
  }

  /** Finds one report, resolving the reported subject and its sibling reports. */
  async findById(id: string) {
    const report = await this.prisma.moderationReport.findFirst({ where: { id } })
    if (!report) throw new ReportNotFoundException(id)

    const [subject, siblingReports] = await Promise.all([
      this.resolveSubject(report.entityType, report.entityId),
      this.findSiblingReports(report),
    ])

    return { ...report, subject, siblingReports }
  }

  /**
   * Moves a report to a new status, setting/clearing `resolvedAt` to match.
   * With `audit`, the update and an explicit per-report audit row share one transaction — the
   * batch route passes it because it opts out of the interceptor's request-level row. That write
   * is guarded on the status just read, so the audited `before` is the status actually replaced:
   * a concurrent change in between is a 409, never an audit row recording a stale transition.
   */
  async updateStatus(id: string, dto: UpdateReportDto, audit?: ReportAdvanceAudit) {
    const existing = await this.prisma.moderationReport.findFirst({
      where: { id },
      select: { status: true },
    })
    if (!existing) throw new ReportNotFoundException(id)

    const data = {
      status: dto.status,
      resolvedAt: RESOLVED_STATUSES.includes(dto.status) ? new Date() : null,
    }
    if (!audit) return await this.prisma.moderationReport.update({ where: { id }, data })

    const { staffId, ...auditContext } = audit
    return await this.prisma.$transaction(async (tx) => {
      const [updated] = await tx.moderationReport.updateManyAndReturn({
        where: { id, status: existing.status },
        data,
      })
      if (!updated) throw new ReportStatusChangedException(id)
      await writeTakeDownAudit({
        tx,
        entityType: 'admin-moderation',
        entityId: id,
        action: 'admin-moderation.update',
        staffId,
        before: { status: existing.status },
        after: { status: updated.status },
        ...auditContext,
      })
      return updated
    })
  }

  /** Moves every report to `status` independently via {@link updateStatus}; per-id results. */
  advanceMany(
    ids: readonly string[],
    status: ModerationStatus,
    staffId: string,
    auditContext: AuditContextValue = {},
  ) {
    return runBatch(ids, (id) => this.updateStatus(id, { status }, { staffId, ...auditContext }))
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
    const row = await SUBJECT_RESOLVERS.get(kind)?.(this.prisma, entityId)
    return row ? { kind, ...row } : null
  }
}
