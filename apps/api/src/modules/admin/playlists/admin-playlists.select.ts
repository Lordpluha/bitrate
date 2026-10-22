import type { Prisma } from '@prisma/client'

/** How many tracks the detail page shows; `trackCount` carries the full total. */
const DETAIL_TRACK_LIMIT = 50

/** The columns the list, detail and mutation responses share, with owner and track count joined. */
export const PLAYLIST_ROW_SELECT = {
  id: true,
  title: true,
  cover: true,
  userId: true,
  user: { select: { username: true } },
  isPublic: true,
  followersCount: true,
  _count: { select: { tracks: true } },
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.PlaylistSelect

/** The row columns plus the metadata and first tracks only the detail page shows. */
export const PLAYLIST_DETAIL_SELECT = {
  ...PLAYLIST_ROW_SELECT,
  description: true,
  collaborative: true,
  tracks: {
    orderBy: { position: 'asc' },
    take: DETAIL_TRACK_LIMIT,
    select: { position: true, track: { select: { id: true, title: true } } },
  },
} as const satisfies Prisma.PlaylistSelect

export type PlaylistRowRecord = Prisma.PlaylistGetPayload<{ select: typeof PLAYLIST_ROW_SELECT }>
export type PlaylistDetailRecord = Prisma.PlaylistGetPayload<{
  select: typeof PLAYLIST_DETAIL_SELECT
}>
