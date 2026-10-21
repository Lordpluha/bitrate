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
    cover: true,
    masterOwnerType: true,
    writersConfirmedAt: true,
    accuracyConfirmedAt: true,
    trackDrafts: {
      where: { ownerArtistId, deletedAt: null },
      select: { id: true, isrc: true, audioKey: true },
    },
    tracks: {
      where: { track: { deletedAt: null } },
      select: { track: { select: { id: true, isrc: true } } },
    },
    contributors: { select: { id: true, roles: true } },
    splits: { select: { rightType: true, shareBasisPoints: true } },
  }) as const satisfies Prisma.ReleaseSelect

/** The artist's release workspace: summary, rights, latest review and bounded child lists. */
export const releaseWorkspaceSelect = (ownerArtistId: string) => {
  const activeDrafts = { ownerArtistId, deletedAt: null }
  const activeTracks = { track: { deletedAt: null } }
  return {
    ...RELEASE_SUMMARY_SELECT,
    cover: true,
    isDemo: true,
    masterOwnerType: true,
    masterOwnerName: true,
    writersConfirmedAt: true,
    accuracyConfirmedAt: true,
    submittedAt: true,
    owner: { select: { username: true } },
    reviews: {
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: {
        decision: true,
        message: true,
        requiredChanges: true,
        recommendations: true,
        createdAt: true,
      },
    },
    trackDrafts: {
      where: activeDrafts,
      take: 50,
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        title: true,
        version: true,
        status: true,
        duration: true,
        isDemo: true,
        isrc: true,
        audioKey: true,
        audioFileName: true,
        audioSizeBytes: true,
      },
    },
    tracks: {
      where: activeTracks,
      take: 50,
      orderBy: { position: 'asc' },
      select: {
        position: true,
        track: { select: { id: true, title: true, duration: true, isrc: true } },
      },
    },
    contributors: {
      take: 50,
      orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
      select: RELEASE_CONTRIBUTOR_SELECT,
    },
    splits: {
      take: 100,
      orderBy: [{ rightType: 'asc' }, { contributorId: 'asc' }],
      select: { contributorId: true, rightType: true, shareBasisPoints: true },
    },
    _count: {
      select: {
        trackDrafts: { where: activeDrafts },
        tracks: { where: activeTracks },
        contributors: true,
      },
    },
  } as const satisfies Prisma.ReleaseSelect
}

export type ReleaseWorkspaceRecord = Prisma.ReleaseGetPayload<{
  select: ReturnType<typeof releaseWorkspaceSelect>
}>

export type ReadinessRecord = Prisma.ReleaseGetPayload<{
  select: ReturnType<typeof releaseReadinessSelect>
}>

/** Published catalogue tracks already have processed audio; drafts need an uploaded master. */
export function readinessFromRecord(record: ReadinessRecord) {
  return {
    ...record,
    tracks: [
      ...record.trackDrafts.map(({ id, isrc, audioKey }) => ({ id, isrc, hasAudio: !!audioKey })),
      ...record.tracks.map(({ track }) => ({ ...track, hasAudio: true })),
    ],
  }
}
