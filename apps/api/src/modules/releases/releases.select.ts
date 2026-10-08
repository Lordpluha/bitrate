import type { Prisma } from '@prisma/client'

export const RELEASE_SUMMARY_SELECT = {
  id: true,
  title: true,
  type: true,
  status: true,
  upc: true,
  scheduledAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ReleaseSelect

export const RELEASE_CONTRIBUTOR_SELECT = {
  id: true,
  displayName: true,
  roles: true,
} as const satisfies Prisma.ReleaseContributorSelect

/** Everything the submission rules read; unbounded so a check never misses a credit or track. */
export const releaseReadinessSelect = (ownerArtistId: string) =>
  ({
    status: true,
    updatedAt: true,
    upc: true,
    masterOwnerType: true,
    writersConfirmedAt: true,
    accuracyConfirmedAt: true,
    trackDrafts: {
      where: { ownerArtistId, deletedAt: null },
      select: { id: true, isrc: true },
    },
    tracks: {
      where: { track: { deletedAt: null } },
      select: { track: { select: { id: true, isrc: true } } },
    },
    contributors: { select: { id: true, roles: true } },
    splits: { select: { rightType: true, shareBasisPoints: true } },
  }) as const satisfies Prisma.ReleaseSelect
