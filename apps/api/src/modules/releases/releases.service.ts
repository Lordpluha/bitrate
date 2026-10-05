import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { AlbumType, type Prisma, ReleaseStatus } from '@prisma/client'
import type { AddReleaseContributorDto } from './dtos/add-release-contributor.dto'
import type { CreateReleaseDto } from './dtos/create-release.dto'
import type { ListReleasesDto } from './dtos/list-releases.dto'
import type { UpdateReleaseDto } from './dtos/update-release.dto'
import type { UpdateReleaseContributorDto } from './dtos/update-release-contributor.dto'
import { RELEASE_CONTRIBUTOR_SELECT, RELEASE_SUMMARY_SELECT } from './releases.select'

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
    if (!release) throw new NotFoundException('Release not found')
    return release
  }

  async updateDraft(ownerArtistId: string, id: string, input: UpdateReleaseDto) {
    // Ownership, lifecycle and version are checked atomically with the write.
    const [updated] = await this.prisma.release.updateManyAndReturn({
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
      },
      select: RELEASE_SUMMARY_SELECT,
    })
    if (updated) return updated
    await this.findOne(ownerArtistId, id)
    throw new ConflictException('Release changed or is no longer a draft')
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
        owner: { select: { username: true } },
        trackDrafts: {
          where: activeDrafts,
          take: 50,
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            title: true,
            version: true,
            status: true,
            duration: true,
            isDemo: true,
          },
        },
        tracks: {
          where: activeTracks,
          take: 50,
          orderBy: { position: 'asc' },
          select: { position: true, track: { select: { id: true, title: true, duration: true } } },
        },
        contributors: {
          take: 50,
          orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
          select: RELEASE_CONTRIBUTOR_SELECT,
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
    if (!release) throw new NotFoundException('Release not found')
    const { owner, contributors, tracks, _count, ...summary } = release
    return {
      ...summary,
      artistName: owner.username,
      tracks: tracks.map(({ position, track }) => ({ ...track, position })),
      participants: contributors,
      trackCount: _count.trackDrafts + _count.tracks,
      participantCount: _count.contributors,
    }
  }

  addContributor(ownerArtistId: string, id: string, input: AddReleaseContributorDto) {
    return this.prisma.$transaction(async (tx) => {
      const release = await this.lockContributorDraft(
        tx,
        ownerArtistId,
        id,
        input.expectedUpdatedAt,
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
    if (!record) throw new NotFoundException('Release or credit not found')
    const { contributors, ...release } = record
    const participant = contributors[0]
    if (!participant) throw new NotFoundException('Release or credit not found')
    return { release, participant }
  }

  updateContributor(
    ownerArtistId: string,
    id: string,
    contributorId: string,
    input: UpdateReleaseContributorDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const release = await this.lockContributorDraft(
        tx,
        ownerArtistId,
        id,
        input.expectedUpdatedAt,
      )
      const [participant] = await tx.releaseContributor.updateManyAndReturn({
        where: { id: contributorId, releaseId: id },
        data: { displayName: input.displayName, roles: input.roles },
        select: RELEASE_CONTRIBUTOR_SELECT,
      })
      if (!participant) throw new NotFoundException('Release or credit not found')
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

  private async lockContributorDraft(
    tx: Prisma.TransactionClient,
    ownerArtistId: string,
    id: string,
    expectedUpdatedAt: string,
  ) {
    const expected = new Date(expectedUpdatedAt)
    // This write locks the release until its credit is persisted; rollback covers both.
    const [release] = await tx.release.updateManyAndReturn({
      where: {
        id,
        ownerArtistId,
        deletedAt: null,
        status: ReleaseStatus.DRAFT,
        updatedAt: expected,
      },
      data: { updatedAt: new Date(Math.max(Date.now(), expected.getTime() + 1)) },
      select: RELEASE_SUMMARY_SELECT,
    })
    if (!release) {
      const visible = await tx.release.findFirst({
        where: { id, ownerArtistId, deletedAt: null },
        select: { id: true },
      })
      if (!visible) throw new NotFoundException('Release not found')
      throw new ConflictException('Release changed or is no longer a draft')
    }
    return release
  }
}
