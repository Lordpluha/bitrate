import { normalizePagination } from '@common/pagination'
import { isPrismaP2002 } from '@common/utils/prisma'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { AlbumType, type Prisma, ReleaseMasterOwner, ReleaseStatus } from '@prisma/client'
import type { CreateReleaseDto } from './dtos/create-release.dto'
import type { ListReleasesDto } from './dtos/list-releases.dto'
import type { ReleaseDraftVersionDto } from './dtos/release-media.dto'
import type {
  ReviseReleaseDto,
  SubmitReleaseDto,
  WithdrawReleaseDto,
} from './dtos/submit-release.dto'
import type { UpdateReleaseDto } from './dtos/update-release.dto'
import type { UpdateReleaseTrackDto } from './dtos/update-release-track.dto'
import { RELEASE_ERRORS } from './errors'
import { lockOwnedDraft } from './release-draft-lock'
import { releaseReadiness } from './release-readiness'
import { type CreditedArtist, creditArtistAlone } from './release-solo-credit'
import {
  RELEASE_SUMMARY_SELECT,
  type ReadinessRecord,
  type ReleaseWorkspaceRecord,
  readinessFromRecord,
  releaseReadinessSelect,
  releaseWorkspaceSelect,
} from './releases.select'

/** Statuses whose release timing (`scheduledAt`) can still change. */
const TIMING_STATUSES = [ReleaseStatus.DRAFT, ReleaseStatus.READY]

@Injectable()
export class ReleasesService {
  constructor(private readonly prisma: PrismaService) {}

  /** A new draft starts with its artist credited alone, which a solo release keeps as is. */
  createDraft(owner: CreditedArtist, input: CreateReleaseDto) {
    return this.prisma.$transaction(async (tx) => {
      const release = await tx.release.create({
        data: {
          ownerArtistId: owner.id,
          title: input.title,
          type: input.type ?? AlbumType.SINGLE,
          status: ReleaseStatus.DRAFT,
          // Most artists own their recording; another owner is a choice in the rights step.
          masterOwnerType: ReleaseMasterOwner.ARTIST,
        },
        select: RELEASE_SUMMARY_SELECT,
      })
      await creditArtistAlone(tx, release.id, owner)
      return release
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
    // The release timing alone stays editable after approval, until publishing starts.
    const timingOnly =
      input.title === undefined && input.type === undefined && input.upc === undefined
    // Ownership, lifecycle and version are checked atomically with the write.
    const [updated] = await this.uniqueIdentifier(
      'This UPC is already used by another release',
      () =>
        this.prisma.release.updateManyAndReturn({
          where: {
            id,
            ownerArtistId,
            deletedAt: null,
            status: timingOnly ? { in: TIMING_STATUSES } : ReleaseStatus.DRAFT,
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

  /**
   * Soft-deletes an owned draft with its recordings; their UPC and ISRCs are released for reuse.
   * Stored masters and the cover stay referenced by the deleted rows.
   */
  deleteDraft(ownerArtistId: string, id: string, input: ReleaseDraftVersionDto): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const deletedAt = new Date()
      await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt, {
        deletedAt,
        upc: null,
      })
      await tx.artistTrackDraft.updateMany({
        where: { releaseId: id, ownerArtistId, deletedAt: null },
        data: { deletedAt, isrc: null },
      })
    })
  }

  async workspace(ownerArtistId: string, id: string) {
    const owned = { id, ownerArtistId, deletedAt: null }
    const [release, readinessRecord] = await Promise.all([
      this.prisma.release.findFirst({
        where: owned,
        select: releaseWorkspaceSelect(ownerArtistId),
      }),
      this.prisma.release.findFirst({
        where: owned,
        select: releaseReadinessSelect(ownerArtistId),
      }),
    ])
    if (!(release && readinessRecord)) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    return toWorkspaceView(release, readinessRecord)
  }

  submit(ownerArtistId: string, id: string, input: SubmitReleaseDto) {
    return this.prisma.$transaction(async (tx) => {
      const expected = new Date(input.expectedUpdatedAt)
      const now = new Date()
      await assertSubmittable(tx, ownerArtistId, id, expected)
      // The version guard makes the checked state and the status change one atomic step.
      const [submitted] = await tx.release.updateManyAndReturn({
        where: {
          id,
          ownerArtistId,
          deletedAt: null,
          status: ReleaseStatus.DRAFT,
          updatedAt: expected,
        },
        // Submitting is the artist's accuracy confirmation for the data just checked.
        data: { status: ReleaseStatus.SUBMITTED, submittedAt: now, accuracyConfirmedAt: now },
        select: RELEASE_SUMMARY_SELECT,
      })
      if (!submitted) throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_DRAFT)
      return submitted
    })
  }

  /** Allowed until Bitrate review starts; the saved draft and confirmations are kept. */
  withdraw(ownerArtistId: string, id: string, input: WithdrawReleaseDto) {
    return this.reopen(
      ownerArtistId,
      id,
      input.expectedUpdatedAt,
      ReleaseStatus.SUBMITTED,
      RELEASE_ERRORS.CHANGED_OR_NOT_SUBMITTED,
    )
  }

  /** Reopens a release Bitrate sent back for changes; saved data and the review are kept. */
  revise(ownerArtistId: string, id: string, input: ReviseReleaseDto) {
    return this.reopen(
      ownerArtistId,
      id,
      input.expectedUpdatedAt,
      ReleaseStatus.REJECTED,
      RELEASE_ERRORS.CHANGED_OR_NOT_REJECTED,
    )
  }

  updateTrack(ownerArtistId: string, id: string, trackId: string, input: UpdateReleaseTrackDto) {
    return this.prisma.$transaction(async (tx) => {
      const release = await lockOwnedDraft(tx, ownerArtistId, id, input.expectedUpdatedAt)
      const [track] = await this.uniqueIdentifier(
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

  /**
   * Moves a release from `from` back to DRAFT when its version still matches; a miss is a 404
   * when the release is not visible to the artist, else a 409 with `conflict`.
   */
  private async reopen(
    ownerArtistId: string,
    id: string,
    expectedUpdatedAt: string,
    from: ReleaseStatus,
    conflict: string,
  ) {
    const [reopened] = await this.prisma.release.updateManyAndReturn({
      where: {
        id,
        ownerArtistId,
        deletedAt: null,
        status: from,
        updatedAt: new Date(expectedUpdatedAt),
      },
      data: { status: ReleaseStatus.DRAFT, submittedAt: null },
      select: RELEASE_SUMMARY_SELECT,
    })
    if (reopened) return reopened
    await this.findOne(ownerArtistId, id)
    throw new ConflictException(conflict)
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

/** Splits rights out of the summary and hides storage keys behind `hasAudio`. */
function toWorkspaceView(release: ReleaseWorkspaceRecord, readinessRecord: ReadinessRecord) {
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
    readiness: releaseReadiness(readinessFromRecord(readinessRecord)),
    artistName: owner.username,
    latestReview: reviews[0] ?? null,
    // The storage key stays server-side; the artist plays audio through the owned route.
    trackDrafts: trackDrafts.map(({ audioKey, ...draft }) => ({
      ...draft,
      hasAudio: !!audioKey,
    })),
    tracks: tracks.map(({ position, track }) => ({ ...track, position })),
    participants: contributors,
    // Published tracks are catalogue copies of the drafts, so they are not counted twice.
    trackCount: Math.max(_count.trackDrafts, _count.tracks),
    participantCount: _count.contributors,
  }
}

/** Rejects a release that is missing, changed since `expected`, not a draft or still blocked. */
async function assertSubmittable(
  tx: Prisma.TransactionClient,
  ownerArtistId: string,
  id: string,
  expected: Date,
): Promise<void> {
  const record = await tx.release.findFirst({
    where: { id, ownerArtistId, deletedAt: null },
    select: releaseReadinessSelect(ownerArtistId),
  })
  if (!record) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
  if (record.status !== ReleaseStatus.DRAFT || record.updatedAt.getTime() !== expected.getTime()) {
    throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_DRAFT)
  }
  const { blockers } = releaseReadiness(readinessFromRecord(record))
  if (blockers.length > 0) {
    throw new UnprocessableEntityException({
      message: RELEASE_ERRORS.BLOCKERS_UNRESOLVED,
      blockers,
    })
  }
}
