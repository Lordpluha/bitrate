import { PUBLIC_TRACK_WHERE } from '@modules/tracks/orm'
import type { Prisma } from '@prisma/client'

/**
 * Loads an album's playable tracks in running order.
 *
 * Shared by the list and detail queries so both always project the same shape.
 */
export const ALBUM_TRACKS_INCLUDE = {
  tracks: {
    where: { track: PUBLIC_TRACK_WHERE },
    include: { track: true },
    orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
  },
} satisfies Prisma.AlbumInclude
