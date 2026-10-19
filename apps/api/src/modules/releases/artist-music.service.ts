import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { MusicReleasesDto, MusicTracksDto } from './dtos/music-catalogue.dto'
import { RELEASE_SUMMARY_SELECT } from './releases.select'

@Injectable()
export class ArtistMusicService {
  constructor(private readonly prisma: PrismaService) {}

  async counts(ownerArtistId: string) {
    const where = { ownerArtistId, deletedAt: null }
    const [tracks, releases] = await Promise.all([
      this.prisma.artistTrackDraft.count({ where }),
      this.prisma.release.count({ where }),
    ])
    return { tracks, releases }
  }

  async tracks(ownerArtistId: string, input: MusicTracksDto) {
    const { page, limit, skip } = normalizePagination(input.page, input.limit)
    const where = {
      ownerArtistId,
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
          release: { select: { id: true, title: true, deletedAt: true } },
        },
      }),
      this.prisma.artistTrackDraft.count({ where }),
    ])
    const data = records.map(({ owner, release, ...record }) => ({
      ...record,
      artistName: owner.username,
      release: release && !release.deletedAt ? { id: release.id, title: release.title } : null,
    }))
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
          owner: { select: { username: true } },
          _count: {
            select: {
              trackDrafts: { where: { deletedAt: null } },
              tracks: { where: { track: { deletedAt: null } } },
            },
          },
        },
      }),
      this.prisma.release.count({ where }),
    ])
    const data = records.map(({ owner, _count, ...record }) => ({
      ...record,
      artistName: owner.username,
      trackCount: _count.trackDrafts + _count.tracks,
    }))
    return { data, total, page, limit }
  }
}
