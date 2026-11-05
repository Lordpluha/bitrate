import type { Prisma } from '@prisma/client'

/** Prisma's include shape for hydrating an {@link AdminTrackDetail}. */
export const DETAIL_INCLUDE = {
  artist: { select: { username: true } },
  audioFiles: { select: { id: true, format: true, bitrate: true, codec: true, size: true } },
  artists: { include: { artist: { select: { username: true } } } },
  genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
  albums: { include: { album: { select: { id: true, title: true } } } },
} satisfies Prisma.TrackInclude

export type TrackWithDetail = Prisma.TrackGetPayload<{ include: typeof DETAIL_INCLUDE }>
