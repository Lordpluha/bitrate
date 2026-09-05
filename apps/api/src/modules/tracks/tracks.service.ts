import { normalizePagination, type PaginationInput } from '@common/pagination'
import { isPrismaP2025 } from '@common/utils/prisma'
import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { UserEntity } from '@modules/users'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { Artist } from '@prisma/client'
import type { TrackEntity } from './entities'

/** Filters accepted by the public track listing. */
type FindAllTracksInput = PaginationInput & Pick<Partial<TrackEntity>, 'artistId' | 'title'>

/** Reads playable tracks and maintains a listener's likes. */
@Injectable()
export class TracksService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /** Runs the find all operation. */
  async findAll({ page = 1, limit = 10, title, artistId }: FindAllTracksInput) {
    const pagination = normalizePagination(page, limit)
    return await this.cache.wrap(
      NS.TRACKS,
      `list:${pagination.page}:${pagination.limit}:${title ?? ''}:${artistId ?? ''}`,
      TTL.SHORT,
      async () => {
        const where = {
          processingStatus: 'READY' as const,
          deletedAt: null,
          ...(artistId ? { artistId } : {}),
          ...(title ? { title: { contains: title, mode: 'insensitive' as const } } : {}),
        }
        const [data, total] = await this.prisma.$transaction([
          this.prisma.track.findMany({
            skip: pagination.skip,
            where,
            take: pagination.limit,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          }),
          this.prisma.track.count({ where }),
        ])
        return { data, total, page: pagination.page, limit: pagination.limit }
      },
    )
  }

  /** Runs the like operation. */
  async like(userId: UserEntity['id'], trackId: TrackEntity['id']) {
    try {
      const track = await this.prisma.track.findFirst({
        where: { id: trackId, processingStatus: 'READY', deletedAt: null },
      })
      if (!track) throw new NotFoundException('Track not found')
      await this.prisma.userLikedTrack.upsert({
        where: { userId_trackId: { userId, trackId } },
        update: {},
        create: { userId, trackId },
      })
      await this.cache.invalidate(NS.TRACKS)
      return track
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Track not found')
      throw error
    }
  }

  /** Runs the unlike operation. */
  async unlike(userId: UserEntity['id'], trackId: TrackEntity['id']) {
    try {
      const track = await this.prisma.track.findFirst({
        where: { id: trackId, deletedAt: null },
      })
      if (!track) throw new NotFoundException('Track not found')
      await this.prisma.userLikedTrack.deleteMany({ where: { userId, trackId } })
      await this.cache.invalidate(NS.TRACKS)
      return track
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Track not found')
      throw error
    }
  }

  /** Runs the find liked tracks operation. */
  async findLikedTracks(userId: UserEntity['id'], { page = 1, limit = 10 }: PaginationInput) {
    const pagination = normalizePagination(page, limit)
    const where = { userId, track: { processingStatus: 'READY' as const, deletedAt: null } }
    const [likes, total] = await this.prisma.$transaction([
      this.prisma.userLikedTrack.findMany({
        where,
        include: { track: true },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.userLikedTrack.count({ where }),
    ])
    return {
      data: likes.map(({ track, createdAt }) => ({ ...track, likedAt: createdAt })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    }
  }

  /** Runs the find track by id operation. */
  async findTrackById(id: TrackEntity['id']) {
    return await this.cache.wrap(NS.TRACKS, `id:${id}`, TTL.LONG, () =>
      this.prisma.track.findFirst({
        where: { id, processingStatus: 'READY', deletedAt: null },
      }),
    )
  }

  /** Runs the find tracks by artist id operation. */
  async findTracksByArtistId(artistId: Artist['id']) {
    return await this.cache.wrap(NS.TRACKS, `artist:${artistId}`, TTL.SHORT, () =>
      this.prisma.track.findMany({
        where: { artistId, processingStatus: 'READY', deletedAt: null },
      }),
    )
  }

  /** Runs the find tracks by artist name operation. */
  async findTracksByArtistName(artistUsername: Artist['username']) {
    return await this.prisma.track.findMany({
      where: {
        processingStatus: 'READY',
        deletedAt: null,
        artist: { username: artistUsername },
      },
    })
  }
}
