import { PrismaService } from '@infra/prisma/prisma.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { AddReleaseContributorDto } from './dtos/add-release-contributor.dto'
import type { ReleaseDraftVersionDto } from './dtos/release-media.dto'
import type { ReplaceReleaseSplitsDto } from './dtos/replace-release-splits.dto'
import type { UpdateReleaseContributorDto } from './dtos/update-release-contributor.dto'
import type { UpdateReleaseRightsDto } from './dtos/update-release-rights.dto'
import { RELEASE_ERRORS } from './errors'
import { lockOwnedDraft } from './release-draft-lock'
import { type CreditedArtist, creditArtistAlone } from './release-solo-credit'
import { RELEASE_CONTRIBUTOR_SELECT, RELEASE_SUMMARY_SELECT } from './releases.select'

/** A credit change invalidates both rights confirmations. */
const CLEARED_CONFIRMATIONS = {
  writersConfirmedAt: null,
  accuracyConfirmedAt: null,
} as const satisfies Prisma.ReleaseUpdateManyMutationInput

/** A credit as the API returns it: identity, name and roles, never its release or artist link. */
type ReleaseParticipant = Prisma.ReleaseContributorGetPayload<{
  select: typeof RELEASE_CONTRIBUTOR_SELECT
}>

/** Projects a credit onto the wire shape, whatever else the row carries. */
const toParticipant = ({ id, displayName, roles }: ReleaseParticipant): ReleaseParticipant => ({
  id,
  displayName,
  roles,
})

/** Credits, rights confirmations and royalty splits of an owned draft release. */
@Injectable()
export class ReleaseCreditsService {
  constructor(private readonly prisma: PrismaService) {}

  addContributor(ownerArtistId: string, id: string, input: AddReleaseContributorDto) {
    return this.prisma.$transaction(async (tx) => {
      const release = await lockOwnedDraft(
        tx,
        ownerArtistId,
        id,
        input.expectedUpdatedAt,
        CLEARED_CONFIRMATIONS,
      )
      const participant = await tx.releaseContributor.create({
        data: { releaseId: id, displayName: input.displayName, roles: input.roles },
        select: RELEASE_CONTRIBUTOR_SELECT,
      })
      return { release, participant: toParticipant(participant) }
    })
  }

  async contributor(ownerArtistId: string, id: string, contributorId: string) {
    const record = await this.prisma.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: {
        ...RELEASE_SUMMARY_SELECT,
        contributors: { where: { id: contributorId }, take: 1, select: RELEASE_CONTRIBUTOR_SELECT },
      },
    })
    if (!record) throw new NotFoundException(RELEASE_ERRORS.CREDIT_NOT_FOUND)
    const { contributors, ...release } = record
    const participant = contributors[0]
    if (!participant) throw new NotFoundException(RELEASE_ERRORS.CREDIT_NOT_FOUND)
    return { release, participant: toParticipant(participant) }
  }

  updateContributor(
    ownerArtistId: string,
    id: string,
    contributorId: string,
    input: UpdateReleaseContributorDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const release = await lockOwnedDraft(
        tx,
        ownerArtistId,
        id,
        input.expectedUpdatedAt,
        CLEARED_CONFIRMATIONS,
      )
      const [participant] = await tx.releaseContributor.updateManyAndReturn({
        where: { id: contributorId, releaseId: id },
        data: { displayName: input.displayName, roles: input.roles },
        select: RELEASE_CONTRIBUTOR_SELECT,
      })
      if (!participant) throw new NotFoundException(RELEASE_ERRORS.CREDIT_NOT_FOUND)
      return { release, participant: toParticipant(participant) }
    })
  }

  /** Restores the solo credit on a draft left without credits, such as one made before it existed. */
  creditSelf(owner: CreditedArtist, id: string, input: ReleaseDraftVersionDto) {
    return this.prisma.$transaction(async (tx) => {
      const release = await lockOwnedDraft(
        tx,
        owner.id,
        id,
        input.expectedUpdatedAt,
        CLEARED_CONFIRMATIONS,
      )
      // Existing credits carry shares the artist divided on purpose; never overwrite them.
      if ((await tx.releaseContributor.count({ where: { releaseId: id } })) > 0) {
        throw new ConflictException(RELEASE_ERRORS.CREDITS_NOT_EMPTY)
      }
      const participant = await creditArtistAlone(tx, id, owner)
      return { release, participant: toParticipant(participant) }
    })
  }

  /** Removes a credit; its shares go with it, and its tasks become unassigned. */
  removeContributor(
    ownerArtistId: string,
    id: string,
    contributorId: string,
    input: ReleaseDraftVersionDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const release = await lockOwnedDraft(
        tx,
        ownerArtistId,
        id,
        input.expectedUpdatedAt,
        CLEARED_CONFIRMATIONS,
      )
      const { count } = await tx.releaseContributor.deleteMany({
        where: { id: contributorId, releaseId: id },
      })
      if (count === 0) throw new NotFoundException(RELEASE_ERRORS.CREDIT_NOT_FOUND)
      return { release, contributorId }
    })
  }

  updateRights(ownerArtistId: string, id: string, input: UpdateReleaseRightsDto) {
    return this.prisma.$transaction((tx) =>
      lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
        masterOwnerType: input.masterOwner?.type ?? null,
        masterOwnerName: input.masterOwner?.type === 'OTHER' ? input.masterOwner.name : null,
        ...(input.writersConfirmed === undefined
          ? {}
          : { writersConfirmedAt: input.writersConfirmed ? new Date() : null }),
      }),
    )
  }

  replaceSplits(ownerArtistId: string, id: string, input: ReplaceReleaseSplitsDto) {
    return this.prisma.$transaction(async (tx) => {
      // New allocations describe different rights, so accuracy must be confirmed again.
      const release = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
        accuracyConfirmedAt: null,
      })
      const contributorIds = input.shares.map((share) => share.contributorId)
      if (contributorIds.length > 0) {
        const credited = await tx.releaseContributor.count({
          where: { releaseId: id, id: { in: contributorIds } },
        })
        if (credited !== contributorIds.length) {
          throw new BadRequestException(RELEASE_ERRORS.SHARE_CONTRIBUTOR_MISMATCH)
        }
      }
      await tx.releaseSplit.deleteMany({ where: { releaseId: id, rightType: input.rightType } })
      if (input.shares.length > 0) {
        await tx.releaseSplit.createMany({
          data: input.shares.map((share) => ({
            ...share,
            releaseId: id,
            rightType: input.rightType,
          })),
        })
      }
      return { release, rightType: input.rightType, shares: input.shares }
    })
  }
}
