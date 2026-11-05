import type { Prisma } from '@prisma/client'

/** The columns the list, detail and take-down responses share, with the artist's name joined. */
export const ALBUM_ROW_SELECT = {
  id: true,
  title: true,
  cover: true,
  artistId: true,
  artist: { select: { username: true } },
  type: true,
  totalTracks: true,
  releaseDate: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.AlbumSelect

/** The row columns plus the metadata and ordered tracks only the detail page shows. */
export const ALBUM_DETAIL_SELECT = {
  ...ALBUM_ROW_SELECT,
  description: true,
  label: true,
  copyright: true,
  tracks: {
    orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
    select: {
      trackNumber: true,
      discNumber: true,
      track: { select: { id: true, title: true, processingStatus: true, deletedAt: true } },
    },
  },
} as const satisfies Prisma.AlbumSelect
