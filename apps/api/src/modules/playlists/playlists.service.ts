import { normalizePagination } from '@common/pagination'
import { isPrismaP2002, isPrismaP2025 } from '@common/utils/prisma'
import { NS } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { UserEntity } from '@modules/users'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AddTracksDto, CreatePlaylistDto, UpdatePlaylistDto } from './dtos'
import { PlaylistEntity } from './entities'

/** Represents the playlists service. */
@Injectable()
export class PlaylistsService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /** Runs the create operation. */
  async create(userId: UserEntity['id'], playlistDto: CreatePlaylistDto) {
    const playlist = await this.prisma.playlist.create({
      data: {
        userId,
        cover: '',
        ...playlistDto,
      },
    })
    await this.cache.invalidate(NS.SEARCH)
    return playlist
  }

  /** Runs the get all operation. */
  async getAll({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    const pagination = normalizePagination(page, limit)
    const where = { isPublic: true, deletedAt: null }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.playlist.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      this.prisma.playlist.count({ where }),
    ])

    return { data, total, page: pagination.page, limit: pagination.limit }
  }

  /** Runs the get by id operation. */
  async getById(id: PlaylistEntity['id']) {
    const playlist = await this.prisma.playlist.findFirst({ where: { id, deletedAt: null } })
    if (!playlist) throw new NotFoundException('Playlist not found')
    return playlist
  }

  /** Runs the get by id populated operation. */
  async getByIdPopulated(id: PlaylistEntity['id'], userId?: UserEntity['id']) {
    const playlist = await this.prisma.playlist.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(userId ? { OR: [{ isPublic: true }, { userId }] } : { isPublic: true }),
      },
      include: {
        tracks: {
          where: { track: { processingStatus: 'READY', deletedAt: null } },
          include: { track: true },
          orderBy: { position: 'asc' },
        },
        user: {
          select: {
            avatar: true,
            id: true,
            username: true,
          },
        },
      },
    })

    if (!playlist) throw new NotFoundException('Playlist not found')

    return {
      ...playlist,
      tracks: playlist.tracks.map(({ id: playlistTrackId, track, ...membership }) => ({
        ...track,
        ...membership,
        playlistTrackId,
      })),
    }
  }

  /** Runs the update operation. */
  async update(userId: UserEntity['id'], id: PlaylistEntity['id'], updateDto: UpdatePlaylistDto) {
    const playlist = await this.prisma.playlist.findFirst({ where: { id, deletedAt: null } })
    if (!playlist) throw new NotFoundException('Playlist not found')
    if (playlist.userId !== userId) throw new ForbiddenException('You do not own this playlist')

    const updated = await this.prisma.playlist.update({ where: { id }, data: updateDto })
    await this.cache.invalidate(NS.SEARCH)
    return updated
  }

  /** Runs the delete operation. */
  async delete(userId: UserEntity['id'], id: PlaylistEntity['id']) {
    const playlist = await this.prisma.playlist.findFirst({ where: { id, deletedAt: null } })
    if (!playlist) throw new NotFoundException('Playlist not found')
    if (playlist.userId !== userId) throw new ForbiddenException('You do not own this playlist')

    const deleted = await this.prisma.playlist.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    await this.cache.invalidate(NS.SEARCH)
    return deleted
  }

  /** Runs the like operation. */
  async like(userId: UserEntity['id'], playlistId: PlaylistEntity['id']) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const playlist = await tx.playlist.findFirst({
          where: { id: playlistId, isPublic: true, deletedAt: null },
        })
        if (!playlist) throw new NotFoundException('Playlist not found')

        const existing = await tx.userLikedPlaylist.findUnique({
          where: { userId_playlistId: { userId, playlistId } },
        })
        if (existing) return playlist

        await tx.userLikedPlaylist.create({ data: { userId, playlistId } })
        return await tx.playlist.update({
          where: { id: playlistId },
          data: { followersCount: { increment: 1 } },
        })
      })
      await this.cache.invalidate(NS.SEARCH)
      return result
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Playlist not found')
      if (isPrismaP2002(error)) throw new ConflictException('Playlist already liked')
      throw error
    }
  }

  /** Runs the unlike operation. */
  async unlike(userId: UserEntity['id'], playlistId: PlaylistEntity['id']) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const playlist = await tx.playlist.findFirst({
          where: { id: playlistId, deletedAt: null },
        })
        if (!playlist) throw new NotFoundException('Playlist not found')

        const deleted = await tx.userLikedPlaylist.deleteMany({
          where: { userId, playlistId },
        })
        if (deleted.count === 0) return playlist

        return await tx.playlist.update({
          where: { id: playlistId },
          data: { followersCount: { decrement: playlist.followersCount > 0 ? 1 : 0 } },
        })
      })
      await this.cache.invalidate(NS.SEARCH)
      return result
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Playlist not found')
      throw error
    }
  }

  /** Runs the get mine operation. */
  async getMine(
    userId: UserEntity['id'],
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {},
  ) {
    const pagination = normalizePagination(page, limit)
    const where = { userId, deletedAt: null }
    const [playlists, total] = await this.prisma.$transaction([
      this.prisma.playlist.findMany({
        where,
        include: {
          tracks: {
            where: { track: { processingStatus: 'READY', deletedAt: null } },
            orderBy: { position: 'asc' },
            select: { track: { select: { id: true, title: true, cover: true } } },
          },
          _count: { select: { tracks: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.playlist.count({ where }),
    ])
    const data = playlists.map((playlist) => ({
      ...playlist,
      tracks: playlist.tracks.map(({ track }) => track),
    }))

    return { data, total, page: pagination.page, limit: pagination.limit }
  }

  /** Runs the add tracks operation. */
  async addTracks(userId: UserEntity['id'], id: PlaylistEntity['id'], dto: AddTracksDto) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id, userId, deletedAt: null },
    })
    if (!playlist) throw new NotFoundException('Playlist not found or not owned by user')

    const uniqueTrackIds = [...new Set(dto.trackIds)]
    const readyCount = await this.prisma.track.count({
      where: {
        id: { in: uniqueTrackIds },
        processingStatus: 'READY',
        deletedAt: null,
      },
    })
    if (readyCount !== uniqueTrackIds.length) {
      throw new BadRequestException('Some tracks are not available yet')
    }

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await this.prisma.$transaction(
          async (tx) => {
            const lastTrack = await tx.playlistTrack.findFirst({
              where: { playlistId: id },
              orderBy: { position: 'desc' },
              select: { position: true },
            })
            const firstPosition = (lastTrack?.position ?? -1) + 1
            await tx.playlistTrack.createMany({
              data: uniqueTrackIds.map((trackId, index) => ({
                playlistId: id,
                trackId,
                addedById: userId,
                position: firstPosition + index,
              })),
            })
            await tx.playlist.update({ where: { id }, data: { updatedAt: new Date() } })
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        )
        break
      } catch (error) {
        const code =
          error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined
        if (code !== 'P2002' && code !== 'P2034') throw error
        if (attempt === 3) {
          if (code === 'P2002')
            throw new ConflictException('One or more tracks are already in this playlist')
          throw error
        }
      }
    }
    await this.cache.invalidate(NS.SEARCH)
    return await this.getByIdPopulated(id, userId)
  }

  /** Runs the remove track operation. */
  async removeTrack(userId: UserEntity['id'], id: PlaylistEntity['id'], trackId: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id, userId, deletedAt: null },
    })
    if (!playlist) throw new NotFoundException('Playlist not found or not owned by user')

    const membership = await this.prisma.playlistTrack.findFirst({
      where: { playlistId: id, trackId },
      orderBy: { position: 'asc' },
    })
    if (!membership) throw new NotFoundException('Track not found in playlist')

    await this.prisma.$transaction([
      this.prisma.playlistTrack.delete({ where: { id: membership.id } }),
      this.prisma.playlist.update({ where: { id }, data: { updatedAt: new Date() } }),
    ])
    await this.cache.invalidate(NS.SEARCH)
    return await this.getByIdPopulated(id, userId)
  }
}
