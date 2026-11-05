import { type AdminResourceStatus, statusWhere } from '@modules/admin/shared'
import type { Prisma } from '@prisma/client'

/** Filters the operator artist list narrows by. */
export type ArtistListFilters = { verified?: boolean; status?: AdminResourceStatus; q?: string }

/** The artist list's `where` clause, shared by listing and counting. */
export const artistListWhere = ({ verified, status, q }: ArtistListFilters) =>
  ({
    ...statusWhere(status),
    ...(verified !== undefined && { verified }),
    ...(q && {
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    }),
  }) satisfies Prisma.ArtistWhereInput
