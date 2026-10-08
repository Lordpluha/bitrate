import { type ReleaseCreditRole, type ReleaseMasterOwner, ReleaseRightType } from '@prisma/client'

/** 10,000 basis points is 100%; each right type must be fully allocated before submission. */
export const FULL_SHARE_BASIS_POINTS = 10_000

export interface ReleaseReadinessInput {
  upc: string | null
  masterOwnerType: ReleaseMasterOwner | null
  writersConfirmedAt: Date | null
  accuracyConfirmedAt: Date | null
  tracks: { id: string; isrc: string | null }[]
  contributors: { id: string; roles: ReleaseCreditRole[] }[]
  splits: { rightType: ReleaseRightType; shareBasisPoints: number }[]
}

type ReleaseBlocker =
  | { code: 'NO_TRACKS' }
  | { code: 'MASTER_OWNER_MISSING' }
  | { code: 'WRITERS_NOT_CONFIRMED' }
  | { code: 'ACCURACY_NOT_CONFIRMED' }
  | { code: 'CONTRIBUTOR_ROLES_MISSING'; contributorId: string }
  | { code: 'SPLITS_INCOMPLETE'; rightType: ReleaseRightType; totalBasisPoints: number }

/** Identifiers can be assigned later by a distributor, so they never block submission. */
type ReleaseNotice = { code: 'UPC_MISSING' } | { code: 'ISRC_MISSING'; trackId: string }

export interface ReleaseReadiness {
  blockers: ReleaseBlocker[]
  notices: ReleaseNotice[]
}

/** Lists what still prevents submitting a release for Bitrate review. */
export function releaseReadiness(input: ReleaseReadinessInput): ReleaseReadiness {
  const blockers: ReleaseBlocker[] = []
  if (input.tracks.length === 0) blockers.push({ code: 'NO_TRACKS' })
  if (!input.masterOwnerType) blockers.push({ code: 'MASTER_OWNER_MISSING' })
  if (!input.writersConfirmedAt) blockers.push({ code: 'WRITERS_NOT_CONFIRMED' })
  if (!input.accuracyConfirmedAt) blockers.push({ code: 'ACCURACY_NOT_CONFIRMED' })
  for (const contributor of input.contributors) {
    if (contributor.roles.length === 0) {
      blockers.push({ code: 'CONTRIBUTOR_ROLES_MISSING', contributorId: contributor.id })
    }
  }
  for (const rightType of Object.values(ReleaseRightType)) {
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
