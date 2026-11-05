import type { Prisma } from '@prisma/client'

/** What turning a release into catalogue tracks reads. */
export const PUBLISH_SOURCE_SELECT = {
  ownerArtistId: true,
  cover: true,
  trackDrafts: {
    where: { deletedAt: null },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    select: {
      title: true,
      duration: true,
      isrc: true,
      audioKey: true,
      audioContentType: true,
    },
  },
  contributors: { orderBy: { id: 'asc' }, select: { artistId: true } },
  tracks: {
    select: { position: true, track: { select: { id: true, processingStatus: true } } },
  },
} satisfies Prisma.ReleaseSelect
