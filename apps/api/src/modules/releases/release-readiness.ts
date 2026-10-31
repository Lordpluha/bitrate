import { type ReleaseCreditRole, type ReleaseMasterOwner, ReleaseRightType } from '@prisma/client'

/** 10,000 basis points is 100%; each split right must be fully allocated before submission. */
export const FULL_SHARE_BASIS_POINTS = 10_000

/**
 * The rights artists split on a release: the master only. Publishing (COMPOSITION) stays in
 * the schema for existing rows but is neither required nor created.
 */
export const SPLIT_RIGHT_TYPES = [
  ReleaseRightType.RECORDING,
] as const satisfies readonly ReleaseRightType[]

export interface ReleaseReadinessInput {
  upc: string | null
  cover: string | null
  masterOwnerType: ReleaseMasterOwner | null
  tracks: { id: string; isrc: string | null; hasAudio: boolean }[]
  contributors: { id: string; roles: ReleaseCreditRole[] }[]
  splits: { rightType: ReleaseRightType; shareBasisPoints: number }[]
}

type ReleaseBlocker =
  | { code: 'NO_TRACKS' }
  | { code: 'COVER_MISSING' }
  | { code: 'TRACK_AUDIO_MISSING'; trackId: string }
  | { code: 'MASTER_OWNER_MISSING' }
  | { code: 'CONTRIBUTOR_ROLES_MISSING'; contributorId: string }
  | { code: 'SPLITS_INCOMPLETE'; rightType: ReleaseRightType; totalBasisPoints: number }

/** Identifiers can be assigned later by a distributor, so they never block submission. */
type ReleaseNotice = { code: 'UPC_MISSING' } | { code: 'ISRC_MISSING'; trackId: string }

export interface ReleaseReadiness {
  blockers: ReleaseBlocker[]
  notices: ReleaseNotice[]
}

/**
 * Lists what still prevents submitting a release for Bitrate review. Accuracy is not checked:
 * submitting is the artist's confirmation that the checked data is accurate.
 */
export function releaseReadiness(input: ReleaseReadinessInput): ReleaseReadiness {
  const blockers: ReleaseBlocker[] = []
  if (input.tracks.length === 0) blockers.push({ code: 'NO_TRACKS' })
  if (!input.cover) blockers.push({ code: 'COVER_MISSING' })
  for (const track of input.tracks) {
    if (!track.hasAudio) blockers.push({ code: 'TRACK_AUDIO_MISSING', trackId: track.id })
  }
  if (!input.masterOwnerType) blockers.push({ code: 'MASTER_OWNER_MISSING' })
  for (const contributor of input.contributors) {
    if (contributor.roles.length === 0) {
      blockers.push({ code: 'CONTRIBUTOR_ROLES_MISSING', contributorId: contributor.id })
    }
  }
  for (const rightType of SPLIT_RIGHT_TYPES) {
    const totalBasisPoints = splitTotal(input.splits, rightType)
    if (totalBasisPoints !== FULL_SHARE_BASIS_POINTS) {
      blockers.push({ code: 'SPLITS_INCOMPLETE', rightType, totalBasisPoints })
    }
  }

  const notices: ReleaseNotice[] = input.upc ? [] : [{ code: 'UPC_MISSING' }]
  for (const track of input.tracks) {
    if (!track.isrc) notices.push({ code: 'ISRC_MISSING', trackId: track.id })
  }
  return { blockers, notices }
}

function splitTotal(splits: ReleaseReadinessInput['splits'], rightType: ReleaseRightType): number {
  return splits
    .filter((split) => split.rightType === rightType)
    .reduce((total, split) => total + split.shareBasisPoints, 0)
}
