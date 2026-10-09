import { normalizePagination } from '@common/pagination'
import { isPrismaP2002 } from '@common/utils/prisma'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { AlbumType, type Prisma, ReleaseStatus } from '@prisma/client'
import type { AddReleaseContributorDto } from './dtos/add-release-contributor.dto'
import type { CreateReleaseDto } from './dtos/create-release.dto'
import type { ListReleasesDto } from './dtos/list-releases.dto'
import type { ReplaceReleaseSplitsDto } from './dtos/replace-release-splits.dto'
import type {
  ReviseReleaseDto,
  SubmitReleaseDto,
  WithdrawReleaseDto,
} from './dtos/submit-release.dto'
import type { UpdateReleaseDto } from './dtos/update-release.dto'
import type { UpdateReleaseContributorDto } from './dtos/update-release-contributor.dto'
import type { UpdateReleaseRightsDto } from './dtos/update-release-rights.dto'
import type { UpdateReleaseTrackDto } from './dtos/update-release-track.dto'
import { RELEASE_ERRORS } from './errors'
import { lockOwnedDraft } from './release-draft-lock'
import { releaseReadiness } from './release-readiness'
import {
  RELEASE_CONTRIBUTOR_SELECT,
  RELEASE_SUMMARY_SELECT,
  readinessFromRecord,
  releaseReadinessSelect,
} from './releases.select'

interface ReleaseTrackIdentifier {
  id: string
  title: string
  isrc: string | null
}

/** A credit change invalidates both rights confirmations. */
const CLEARED_CONFIRMATIONS = {
  writersConfirmedAt: null,
  accuracyConfirmedAt: null,
} as const satisfies Prisma.ReleaseUpdateManyMutationInput

@Injectable()
export class ReleasesService {
  constructor(private readonly prisma: PrismaService) {}

  createDraft(ownerArtistId: string, input: CreateReleaseDto) {
    return this.prisma.release.create({
      data: {
        ownerArtistId,
        title: input.title,
        type: input.type ?? AlbumType.SINGLE,
        status: ReleaseStatus.DRAFT,
      },
      select: RELEASE_SUMMARY_SELECT,
    })
  }

  async findAll(ownerArtistId: string, input: ListReleasesDto) {
    const { page, limit, skip } = normalizePagination(input.page, input.limit)
    const where = { ownerArtistId, deletedAt: null }
    const [data, total] = await Promise.all([
      this.prisma.release.findMany({
        where,
        select: RELEASE_SUMMARY_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.release.count({ where }),
    ])
    return { data, total, page, limit }
  }

  async findOne(ownerArtistId: string, id: string) {
    const release = await this.prisma.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: RELEASE_SUMMARY_SELECT,
    })
    if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    return release
  }

  async updateDraft(ownerArtistId: string, id: string, input: UpdateReleaseDto) {
    // Ownership, lifecycle and version are checked atomically with the write.
    const [updated] = await this.uniqueIdentifier(
      'This UPC is already used by another release',
      () =>
        this.prisma.release.updateManyAndReturn({
          where: {
            id,
            ownerArtistId,
            deletedAt: null,
            status: ReleaseStatus.DRAFT,
            updatedAt: new Date(input.expectedUpdatedAt),
          },
          data: {
            ...(input.title === undefined ? {} : { title: input.title }),
            ...(input.type === undefined ? {} : { type: input.type }),
            ...(input.scheduledAt === undefined
              ? {}
              : {
                  scheduledAt: input.scheduledAt === null ? null : new Date(input.scheduledAt),
                }),
            ...(input.upc === undefined ? {} : { upc: input.upc }),
          },
          select: RELEASE_SUMMARY_SELECT,
        }),
    )
    if (updated) return updated
    await this.findOne(ownerArtistId, id)
    throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_DRAFT)
  }

  async workspace(ownerArtistId: string, id: string) {
    const activeDrafts = { ownerArtistId, deletedAt: null }
    const activeTracks = { track: { deletedAt: null } }
    const release = await this.prisma.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: {
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
      },
    })
    if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    const readiness = await this.readiness(this.prisma, ownerArtistId, id)
    const {
      owner,
      reviews,
      contributors,
      trackDrafts,
      tracks,
      _count,
      masterOwnerType,
      masterOwnerName,
      writersConfirmedAt,
      accuracyConfirmedAt,
      ...summary
    } = release
    return {
      ...summary,
      rights: { masterOwnerType, masterOwnerName, writersConfirmedAt, accuracyConfirmedAt },
      readiness: readiness ?? { blockers: [], notices: [] },
      artistName: owner.username,
      latestReview: reviews[0] ?? null,
      // The storage key stays server-side; the artist plays audio through the owned route.
      trackDrafts: trackDrafts.map(({ audioKey, ...draft }) => ({
        ...draft,
        hasAudio: !!audioKey,
      })),
      tracks: tracks.map(({ position, track }) => ({ ...track, position })),
      participants: contributors,
      trackCount: _count.trackDrafts + _count.tracks,
      participantCount: _count.contributors,
    }
  }

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
      return {
        release,
        participant: {
          id: participant.id,
          displayName: participant.displayName,
          roles: participant.roles,
        },
      }
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
    return { release, participant }
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
      return {
        release,
        participant: {
          id: participant.id,
          displayName: participant.displayName,
          roles: participant.roles,
        },
      }
    })
  }

  submit(ownerArtistId: string, id: string, input: SubmitReleaseDto) {
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.release.findFirst({
        where: { id, ownerArtistId, deletedAt: null },
        select: releaseReadinessSelect(ownerArtistId),
      })
      if (!record) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
      const expected = new Date(input.expectedUpdatedAt)
      if (
        record.status !== ReleaseStatus.DRAFT ||
        record.updatedAt.getTime() !== expected.getTime()
      ) {
        throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_DRAFT)
      }
      const { blockers } = releaseReadiness(readinessFromRecord(record))
      if (blockers.length > 0) {
        throw new UnprocessableEntityException({
          message: RELEASE_ERRORS.BLOCKERS_UNRESOLVED,
          blockers,
        })
      }
      // The version guard makes the checked state and the status change one atomic step.
      const [submitted] = await tx.release.updateManyAndReturn({
        where: {
          id,
          ownerArtistId,
          deletedAt: null,
          status: ReleaseStatus.DRAFT,
          updatedAt: expected,
        },
        data: { status: ReleaseStatus.SUBMITTED, submittedAt: new Date() },
        select: RELEASE_SUMMARY_SELECT,
      })
      if (!submitted) throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_DRAFT)
      return submitted
    })
  }

  /** Allowed until Bitrate review starts; the saved draft and confirmations are kept. */
  async withdraw(ownerArtistId: string, id: string, input: WithdrawReleaseDto) {
    const [withdrawn] = await this.prisma.release.updateManyAndReturn({
      where: {
        id,
        ownerArtistId,
        deletedAt: null,
        status: ReleaseStatus.SUBMITTED,
        updatedAt: new Date(input.expectedUpdatedAt),
      },
      data: { status: ReleaseStatus.DRAFT, submittedAt: null },
      select: RELEASE_SUMMARY_SELECT,
    })
    if (withdrawn) return withdrawn
    await this.findOne(ownerArtistId, id)
    throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_SUBMITTED)
  }

  /** Reopens a release Bitrate sent back for changes; saved data and the review are kept. */
  async revise(ownerArtistId: string, id: string, input: ReviseReleaseDto) {
    const [revised] = await this.prisma.release.updateManyAndReturn({
      where: {
        id,
        ownerArtistId,
        deletedAt: null,
        status: ReleaseStatus.REJECTED,
        updatedAt: new Date(input.expectedUpdatedAt),
      },
      data: { status: ReleaseStatus.DRAFT, submittedAt: null },
      select: RELEASE_SUMMARY_SELECT,
    })
    if (revised) return revised
    await this.findOne(ownerArtistId, id)
    throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_REJECTED)
  }

  private async readiness(
    client: Pick<Prisma.TransactionClient, 'release'>,
    ownerArtistId: string,
    id: string,
  ) {
    const record = await client.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: releaseReadinessSelect(ownerArtistId),
    })
    return record ? releaseReadiness(readinessFromRecord(record)) : null
  }

  updateRights(ownerArtistId: string, id: string, input: UpdateReleaseRightsDto) {
    const confirmedAt = new Date()
    return this.prisma.$transaction((tx) =>
      lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
        masterOwnerType: input.masterOwner?.type ?? null,
        masterOwnerName: input.masterOwner?.type === 'OTHER' ? input.masterOwner.name : null,
        writersConfirmedAt: input.writersConfirmed ? confirmedAt : null,
        accuracyConfirmedAt: input.accuracyConfirmed ? confirmedAt : null,
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

  updateTrack(ownerArtistId: string, id: string, trackId: string, input: UpdateReleaseTrackDto) {
    return this.prisma.$transaction(async (tx) => {
      const release = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt)
      const [track] = await this.uniqueIdentifier<ReleaseTrackIdentifier[]>(
        'This ISRC is already used by another recording',
        () =>
          tx.artistTrackDraft.updateManyAndReturn({
            where: { id: trackId, releaseId: id, ownerArtistId, deletedAt: null },
            data: {
              ...(input.title === undefined ? {} : { title: input.title }),
              ...(input.isrc === undefined ? {} : { isrc: input.isrc }),
            },
            select: { id: true, title: true, isrc: true },
          }),
      )
      if (!track) throw new NotFoundException(RELEASE_ERRORS.RECORDING_NOT_FOUND)
      return { release, track }
    })
  }

  /** Maps a unique-identifier collision to a conflict the artist can act on. */
  private async uniqueIdentifier<T>(message: string, write: () => Promise<T>): Promise<T> {
    try {
      return await write()
    } catch (error) {
      if (isPrismaP2002(error)) throw new ConflictException(message)
      throw error
    }
  }
}
