import { normalizePagination } from '@common/pagination'
import { isPrismaP2002 } from '@common/utils/prisma'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { AlbumType, ReleaseStatus } from '@prisma/client'
import type { CreateReleaseDto } from './dtos/create-release.dto'
import type { ListReleasesDto } from './dtos/list-releases.dto'
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
import {
  RELEASE_CONTRIBUTOR_SELECT,
  RELEASE_SUMMARY_SELECT,
  readinessFromRecord,
  releaseReadinessSelect,
} from './releases.select'

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
    const owned = { id, ownerArtistId, deletedAt: null }
    const [release, readinessRecord] = await Promise.all([
      this.prisma.release.findFirst({
        where: owned,
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
      }),
      this.prisma.release.findFirst({
        where: owned,
        select: releaseReadinessSelect(ownerArtistId),
      }),
    ])
    if (!(release && readinessRecord)) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
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
      trackCount: _count.trackDrafts + _count.tracks,
      participantCount: _count.contributors,
    }
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
