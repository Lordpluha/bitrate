import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { type Prisma, ReleaseChangeStatus } from '@prisma/client'
import type { MusicReleasesDto, MusicTracksDto } from './dtos/music-catalogue.dto'
import { RELEASE_SUMMARY_SELECT } from './orm'
import { acceptsChanges } from './release-change-rules'

const PENDING_CHANGE = { status: ReleaseChangeStatus.PENDING } as const

@Injectable()
export class ArtistMusicService {
  constructor(private readonly prisma: PrismaService) {}

  async counts(ownerArtistId: string) {
    const where = { ownerArtistId, deletedAt: null }
    const [tracks, releases] = await Promise.all([
      this.prisma.artistTrackDraft.count({ where: { ...where, sourceTrackId: null } }),
      this.prisma.release.count({ where }),
    ])
    return { tracks, releases }
  }

  async tracks(ownerArtistId: string, input: MusicTracksDto) {
    const { page, limit, skip } = normalizePagination(input.page, input.limit)
    const where = {
      ownerArtistId,
      sourceTrackId: null,
      deletedAt: null,
      ...(input.search ? { title: { contains: input.search, mode: 'insensitive' as const } } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.type ? { version: input.type } : {}),
    } satisfies Prisma.ArtistTrackDraftWhereInput
    const orderBy: Prisma.ArtistTrackDraftOrderByWithRelationInput[] =
      input.sort === 'title'
        ? [{ title: 'asc' }, { id: 'asc' }]
        : [{ updatedAt: input.sort === 'oldest' ? 'asc' : 'desc' }, { id: 'desc' }]
    const [records, total] = await Promise.all([
      this.prisma.artistTrackDraft.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          version: true,
          status: true,
          duration: true,
          cover: true,
          previewUrl: true,
          isDemo: true,
          updatedAt: true,
          owner: { select: { username: true } },
          release: {
            select: {
              id: true,
              title: true,
              cover: true,
              deletedAt: true,
              status: true,
              unpublishedBy: true,
              isDemo: true,
            },
          },
          publishedAs: {
            select: { track: { select: { deletedAt: true, moderationBlockedAt: true } } },
          },
          changes: { where: PENDING_CHANGE, select: { id: true }, take: 1 },
        },
      }),
      this.prisma.artistTrackDraft.count({ where }),
    ])
    const data = records.map(({ owner, release, publishedAs, changes, ...record }) => {
      const live = release && !release.deletedAt ? release : null
      const track = publishedAs?.track
      return {
        ...record,
        // Only a recording uploaded into a live release is renamed, through that release.
        acceptsChanges:
          !!live &&
          acceptsChanges(live) &&
          !!track &&
          !track.deletedAt &&
          !track.moderationBlockedAt,
        hasPendingChanges: changes.length > 0,
        // A recording uploaded into a release has no artwork of its own; it shows the release's.
        cover: record.cover ?? live?.cover ?? null,
        artistName: owner.username,
        release: live ? { id: live.id, title: live.title } : null,
      }
    })
    return { data, total, page, limit }
  }

  async releases(ownerArtistId: string, input: MusicReleasesDto) {
    const { page, limit, skip } = normalizePagination(input.page, input.limit)
    const where = {
      ownerArtistId,
      deletedAt: null,
      ...(input.search ? { title: { contains: input.search, mode: 'insensitive' as const } } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.type ? { type: input.type } : {}),
    } satisfies Prisma.ReleaseWhereInput
    const orderBy: Prisma.ReleaseOrderByWithRelationInput[] =
      input.sort === 'title'
        ? [{ title: 'asc' }, { id: 'asc' }]
        : [{ updatedAt: input.sort === 'oldest' ? 'asc' : 'desc' }, { id: 'desc' }]
    const [records, total] = await Promise.all([
      this.prisma.release.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          ...RELEASE_SUMMARY_SELECT,
          cover: true,
          isDemo: true,
          unpublishedBy: true,
          owner: { select: { username: true } },
          _count: {
            select: {
              trackDrafts: { where: { deletedAt: null } },
              tracks: { where: { track: { deletedAt: null } } },
              changes: { where: PENDING_CHANGE },
            },
          },
        },
      }),
      this.prisma.release.count({ where }),
    ])
    const data = records.map(({ owner, _count, unpublishedBy, ...record }) => ({
      ...record,
      acceptsChanges: acceptsChanges({ ...record, unpublishedBy }),
      hasPendingChanges: _count.changes > 0,
      artistName: owner.username,
      // Published tracks are catalogue copies of the drafts, so they are not counted twice.
      trackCount: Math.max(_count.trackDrafts, _count.tracks),
    }))
    return { data, total, page, limit }
  }
}
