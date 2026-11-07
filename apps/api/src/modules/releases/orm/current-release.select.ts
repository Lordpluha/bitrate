import type { Prisma } from '@prisma/client'
import { SOURCE_AVAILABILITY_SELECT } from '../compilation-source'

export const CURRENT_RELEASE_SELECT = {
  id: true,
  title: true,
  type: true,
  status: true,
  cover: true,
  scheduledAt: true,
  updatedAt: true,
  trackDrafts: {
    where: {
      deletedAt: null,
      OR: [
        { audioKey: { not: null } },
        {
          sourceTrack: {
            deletedAt: null,
            moderationBlockedAt: null,
            publishedAt: { not: null },
            processingStatus: 'READY',
          },
        },
      ],
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    take: 1,
    select: {
      id: true,
      title: true,
      duration: true,
      waveform: true,
      sourceTrack: { select: { ...SOURCE_AVAILABILITY_SELECT, title: true, duration: true } },
    },
  },
} as const satisfies Prisma.ReleaseSelect
