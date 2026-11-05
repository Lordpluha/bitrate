import type { Prisma } from '@prisma/client'

/**
 * An album listeners may open: not deleted and published. `publishedAt` stays null until its
 * release goes live and again while the release is offline. Admin reads skip this filter.
 */
export const PUBLIC_ALBUM_WHERE = {
  deletedAt: null,
  publishedAt: { not: null },
} as const satisfies Prisma.AlbumWhereInput
