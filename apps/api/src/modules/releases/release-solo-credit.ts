import { type Prisma, ReleaseCreditRole, ReleaseRightType } from '@prisma/client'
import { FULL_SHARE_BASIS_POINTS } from './release-readiness'
import { RELEASE_CONTRIBUTOR_SELECT } from './releases.select'

/** Everything a solo artist does on a release: performs, writes the music and the lyrics. */
const SOLO_ROLES = [
  ReleaseCreditRole.PERFORMER,
  ReleaseCreditRole.COMPOSER,
  ReleaseCreditRole.LYRICIST,
] as const satisfies readonly ReleaseCreditRole[]

export interface CreditedArtist {
  id: string
  username: string
}

/**
 * Credits the owning artist as the only participant with 100% of every right, so a solo
 * release needs no credit or split work. Collaborators are added and shares re-divided later.
 */
export async function creditArtistAlone(
  tx: Prisma.TransactionClient,
  releaseId: string,
  artist: CreditedArtist,
) {
  const participant = await tx.releaseContributor.create({
    data: { releaseId, artistId: artist.id, displayName: artist.username, roles: [...SOLO_ROLES] },
    select: RELEASE_CONTRIBUTOR_SELECT,
  })
  await tx.releaseSplit.createMany({
    data: Object.values(ReleaseRightType).map((rightType) => ({
      releaseId,
      contributorId: participant.id,
      rightType,
      shareBasisPoints: FULL_SHARE_BASIS_POINTS,
    })),
  })
  return participant
}
