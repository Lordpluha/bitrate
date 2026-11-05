import { statusWhere } from '@modules/admin/shared'
import { Prisma } from '@prisma/client'
import type { TrackListFilters } from '../admin-tracks.types'

/** The track list's Prisma `where` clause, for counting and export. */
export const trackListWhere = ({ processingStatus, status, q }: TrackListFilters) =>
  ({
    ...statusWhere(status),
    ...(processingStatus && { processingStatus }),
    ...(q && { title: { contains: q, mode: 'insensitive' } }),
  }) satisfies Prisma.TrackWhereInput

/** {@link trackListWhere} as a raw-SQL `WHERE` fragment, for the ordered id query. */
export function trackListRawWhere({ processingStatus, status = 'active', q }: TrackListFilters) {
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
