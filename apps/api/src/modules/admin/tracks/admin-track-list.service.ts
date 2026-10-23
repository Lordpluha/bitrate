import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { AuditContextValue, CsvExport } from '@modules/admin/shared'
import { openCsvExport, statusWhere } from '@modules/admin/shared'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  type AdminTrackRow,
  type AdminTracksSortField,
  type ListTracksInput,
  TRACK_ROW_SELECT,
  type TrackListFilters,
  toAdminTrackRow,
} from './admin-tracks.select'
import { ADMIN_TRACK_EXPORT_COLUMNS } from './track-export.columns'

/**
 * Lists and exports the operator-facing track pipeline queue.
 *
 * Listing defaults to surfacing problems first — `FAILED`, then the longest-stuck
 * `PROCESSING` rows, then everything else — because this screen exists for stuck
 * uploads, not an alphabetical catalog browse. That ordering can't be expressed as a
 * plain Prisma `orderBy`, so it's resolved with a small raw-SQL `CASE` query that
 * only ever selects ids; the actual rows are hydrated back through normal Prisma
 * `findMany` + `select`, keeping the raw-SQL surface (and its blast radius) minimal.
 */
@Injectable()
export class AdminTrackListService {
  constructor(private readonly prisma: PrismaService) {}

  /** Builds the shared Prisma `where` clause for counting. */
  private buildWhere({ processingStatus, status, q }: TrackListFilters) {
    return {
      ...statusWhere(status),
      ...(processingStatus && { processingStatus }),
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
    } satisfies Prisma.TrackWhereInput
  }

  /** Builds the matching raw-SQL `WHERE` fragment for the ordered id query. */
  private buildRawWhere({ processingStatus, status = 'active', q }: TrackListFilters) {
    const deletedFragment =
      status === 'all'
        ? Prisma.empty
        : status === 'deactivated'
          ? Prisma.sql`AND "deletedAt" IS NOT NULL`
          : Prisma.sql`AND "deletedAt" IS NULL`

    return Prisma.sql`
      WHERE TRUE
        ${deletedFragment}
        ${processingStatus ? Prisma.sql`AND "processingStatus" = ${processingStatus}::"TrackProcessingStatus"` : Prisma.empty}
        ${q ? Prisma.sql`AND title ILIKE ${`%${q}%`}` : Prisma.empty}
    `
  }

  /**
   * Lists tracks, paginated. Problem-first by default via the raw-SQL `CASE`
   * query described above; choosing a `sort` replaces that attention-first ordering with a
   * plain Prisma `orderBy` on the chosen field instead — the two orderings are never merged.
   *
   * Within the `PROCESSING` group, ordering by `COALESCE("processingStartedAt", "updatedAt")`
   * rather than `processingStartedAt` alone matters: a track a worker never dequeued has
   * `processingStartedAt: null` forever, and `NULLS LAST` would sink exactly the rows this
   * screen exists to surface — the ones stuck before they ever started — to the bottom of their
   * own group. `updatedAt` is bumped by the same create/reprocess writes that would otherwise
   * set `processingStartedAt`, so it stands in as "how long has this been sitting" for a row
   * that never got that far.
   */
  async findAll({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    processingStatus,
    status,
    q,
    sort,
    order,
  }: ListTracksInput) {
    if (sort) return this.findAllSorted({ page, limit, processingStatus, status, q, sort, order })

    const where = this.buildWhere({ processingStatus, status, q })
    const rawWhere = this.buildRawWhere({ processingStatus, status, q })
    const skip = (page - 1) * limit

    const [rows, total] = await Promise.all([
      this.findAttentionFirstPage(rawWhere, skip, limit),
      this.prisma.track.count({ where }),
    ])

    return { data: rows, total, page, limit }
  }

  /**
   * One page of the attention-first order, hydrated. `id DESC` closes the ordering so equal rows
   * keep a fixed place — paging by offset (the list and the CSV export both do) never repeats or
   * skips a row.
   */
  private async findAttentionFirstPage(
    rawWhere: Prisma.Sql,
    skip: number,
    take: number,
  ): Promise<AdminTrackRow[]> {
    const orderedIds = await this.prisma.queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT id FROM "Track"
      ${rawWhere}
      ORDER BY
        CASE "processingStatus" WHEN 'FAILED' THEN 0 WHEN 'PROCESSING' THEN 1 ELSE 2 END,
        COALESCE("processingStartedAt", "updatedAt") ASC,
        "createdAt" DESC,
        "id" DESC
      OFFSET ${skip} LIMIT ${take}
    `)
    return this.hydrateOrdered(orderedIds.map((row) => row.id))
  }

  /**
   * Streams every track matching the list's filters and ordering as CSV (capped, see
   * `CSV_EXPORT_MAX_ROWS`). Without `sort` it follows the list's attention-first order through the
   * same raw-SQL page query; with `sort` the same Prisma `orderBy` plus id tie-break — so the file
   * equals the rows the list shows across all pages. One batch is held at a time.
   */
  async exportCsv(
    { processingStatus, status, q, sort, order }: TrackListFilters,
    staffId: string,
    auditContext: AuditContextValue = {},
  ): Promise<CsvExport> {
    const where = this.buildWhere({ processingStatus, status, q })
    const total = await this.prisma.track.count({ where })
    const rawWhere = this.buildRawWhere({ processingStatus, status, q })

    return openCsvExport<AdminTrackRow>({
      prisma: this.prisma,
      resource: 'admin-tracks',
      staffId,
      filters: { processingStatus, status, q, sort, order },
      auditContext,
      columns: ADMIN_TRACK_EXPORT_COLUMNS,
      total,
      fetchPage: (skip, take) =>
        sort
          ? this.findSortedPage(where, { sort, order }, skip, take)
          : this.findAttentionFirstPage(rawWhere, skip, take),
    })
  }

  /** The `sort`-driven path: a plain Prisma query, ordered by the chosen field with `id` as
   * the stable tie-break — no raw SQL, no attention-first ordering. */
  private async findAllSorted({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    processingStatus,
    status,
    q,
    sort,
    order,
  }: ListTracksInput) {
    const where = this.buildWhere({ processingStatus, status, q })
    const [data, total] = await Promise.all([
      this.findSortedPage(where, { sort, order }, (page - 1) * limit, limit),
      this.prisma.track.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /** One page in the chosen field's order plus the `id` tie-break; the list and export share it. */
  private async findSortedPage(
    where: Prisma.TrackWhereInput,
    sort: SortInput<AdminTracksSortField>,
    skip: number,
    take: number,
  ): Promise<AdminTrackRow[]> {
    const tracks = await this.prisma.track.findMany({
      where,
      select: TRACK_ROW_SELECT,
      orderBy: buildSortOrderBy<Prisma.TrackOrderByWithRelationInput>(sort, [
        { createdAt: 'desc' },
        { id: 'desc' },
      ]),
      skip,
      take,
    })
    return tracks.map(toAdminTrackRow)
  }

  /** Fetches full rows for the given ids and restores the id order raw SQL computed. */
  private async hydrateOrdered(ids: string[]): Promise<AdminTrackRow[]> {
    if (ids.length === 0) return []

    const tracks = await this.prisma.track.findMany({
      where: { id: { in: ids } },
      select: TRACK_ROW_SELECT,
    })
    const byId = new Map(tracks.map((track) => [track.id, track]))

    return ids.flatMap((id) => {
      const track = byId.get(id)
      return track ? [toAdminTrackRow(track)] : []
    })
  }
}
