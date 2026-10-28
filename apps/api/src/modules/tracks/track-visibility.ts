import { Prisma } from '@prisma/client'

/**
 * A track listeners may find and play: converted, not deleted and published.
 *
 * `publishedAt` stays null while the track's release is still publishing or is offline, so a
 * release goes live all at once. Tracks uploaded outside a release default to their creation
 * time. Admin reads deliberately skip this filter.
 */
export const PUBLIC_TRACK_WHERE = {
  processingStatus: 'READY',
  deletedAt: null,
  publishedAt: { not: null },
} as const satisfies Prisma.TrackWhereInput

/**
 * {@link PUBLIC_TRACK_WHERE} without the conversion check, for reads that explain a track still
 * converting with their own message.
 */
export const LISTED_TRACK_WHERE = {
  deletedAt: null,
  publishedAt: { not: null },
} as const satisfies Prisma.TrackWhereInput

/** {@link PUBLIC_TRACK_WHERE} for raw queries that alias the track table as `t`. */
export const PUBLIC_TRACK_SQL = Prisma.sql`t."processingStatus" = 'READY' AND t."deletedAt" IS NULL AND t."publishedAt" IS NOT NULL`
