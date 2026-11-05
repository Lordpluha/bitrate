import { type AdminResourceStatus, statusWhere } from '@modules/admin/shared'
import type { Prisma } from '@prisma/client'

/** Filters the operator playlist list narrows by. */
export type PlaylistListFilters = { status?: AdminResourceStatus; ownerId?: string; q?: string }

/**
 * The playlist list's `where` clause. Public playlists only: private playlists are user content,
 * never an operator moderation surface.
 */
export const playlistListWhere = ({ status, ownerId, q }: PlaylistListFilters) =>
  ({
    isPublic: true,
    ...statusWhere(status),
    ...(ownerId && { userId: ownerId }),
    ...(q && { title: { contains: q, mode: 'insensitive' } }),
  }) satisfies Prisma.PlaylistWhereInput
