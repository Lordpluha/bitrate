import { type AdminResourceStatus, statusWhere } from '@modules/admin/shared'
import type { Prisma } from '@prisma/client'

/** Filters the operator album list narrows by. */
export type AlbumListFilters = { status?: AdminResourceStatus; artistId?: string; q?: string }

/** The album list's `where` clause, shared by listing and counting. */
export const albumListWhere = ({ status, artistId, q }: AlbumListFilters) =>
  ({
    ...statusWhere(status),
    ...(artistId && { artistId }),
    ...(q && { title: { contains: q, mode: 'insensitive' } }),
  }) satisfies Prisma.AlbumWhereInput
