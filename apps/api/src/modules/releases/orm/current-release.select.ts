import type { Prisma } from '@prisma/client'

export const CURRENT_RELEASE_SELECT = {
  id: true,
  title: true,
  type: true,
  status: true,
  cover: true,
  scheduledAt: true,
  updatedAt: true,
  trackDrafts: {
    where: { deletedAt: null, audioKey: { not: null } },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    take: 1,
    select: { id: true, title: true, duration: true, waveform: true },
  },
} as const satisfies Prisma.ReleaseSelect
