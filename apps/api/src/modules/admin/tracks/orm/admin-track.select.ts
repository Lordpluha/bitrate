import type { Prisma } from '@prisma/client'

/** The columns an {@link AdminTrackRow} is built from — not every `Track` column. */
export const TRACK_ROW_SELECT = {
  id: true,
  title: true,
  artistId: true,
  artist: { select: { username: true } },
  cover: true,
  processingStatus: true,
  processingError: true,
  processingAttempts: true,
  processingStartedAt: true,
  processingFinishedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.TrackSelect

/** What the state pre-checks read. */
export const DELETED_AT_SELECT = { deletedAt: true } as const satisfies Prisma.TrackSelect

export type TrackRowRecord = Prisma.TrackGetPayload<{ select: typeof TRACK_ROW_SELECT }>
