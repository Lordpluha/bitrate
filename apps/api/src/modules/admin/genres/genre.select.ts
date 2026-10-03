import type { Prisma } from '@prisma/client'

/** Genre fields plus the reference counts the operator needs before deleting. */
export const ADMIN_GENRE_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  color: true,
  cover: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { tracks: true, albums: true, artists: true } },
} as const satisfies Prisma.GenreSelect
