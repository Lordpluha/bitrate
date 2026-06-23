import { isPrismaP2025 } from '@common/utils/prisma'
import { NS } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { UserEntity } from '@modules/users'
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
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
    const safeLimit = Math.min(limit, 100)
    return await this.prisma.playlist.findMany({
      where: { isPublic: true },
      skip: (page - 1) * safeLimit,
      take: safeLimit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })
  }

  /** Runs the get by id operation. */
  async getById(id: PlaylistEntity['id']) {
    return await this.prisma.playlist.findUniqueOrThrow({
      where: {
        id,
      },
    })
  }

  /** Runs the get by id populated operation. */
  async getByIdPopulated(id: PlaylistEntity['id']) {
    return await this.prisma.playlist.findUniqueOrThrow({
      where: { id, isPublic: true },
      include: {
        tracks: { where: { processingStatus: 'READY' } },
        user: {
          select: {
            avatar: true,
            id: true,
            username: true,
          },
        },
      },
    })
  }

  /** Runs the update operation. */
  async update(userId: UserEntity['id'], id: PlaylistEntity['id'], updateDto: UpdatePlaylistDto) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } })
    if (!playlist) throw new NotFoundException('Playlist not found')
    if (playlist.userId !== userId) throw new ForbiddenException('You do not own this playlist')

    const updated = await this.prisma.playlist.update({ where: { id }, data: updateDto })
    await this.cache.invalidate(NS.SEARCH)
    return updated
  }

  /** Runs the delete operation. */
  async delete(userId: UserEntity['id'], id: PlaylistEntity['id']) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } })
    if (!playlist) throw new NotFoundException('Playlist not found')
    if (playlist.userId !== userId) throw new ForbiddenException('You do not own this playlist')

    const deleted = await this.prisma.playlist.delete({ where: { id } })
    await this.cache.invalidate(NS.SEARCH)
    return deleted
  }

  /** Runs the like operation. */
  async like(userId: UserEntity['id'], playlistId: PlaylistEntity['id']) {
    try {
      return await this.prisma.playlist.update({
        where: { id: playlistId },
        data: { likedBy: { connect: { id: userId } } },
      })
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Playlist not found')
      throw error
    }
  }

  /** Runs the unlike operation. */
  async unlike(userId: UserEntity['id'], playlistId: PlaylistEntity['id']) {
    try {
      return await this.prisma.playlist.update({
        where: { id: playlistId },
        data: { likedBy: { disconnect: { id: userId } } },
      })
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Playlist not found')
      throw error
    }
  }

  /** Runs the get mine operation. */
  async getMine(userId: UserEntity['id']) {
    return await this.prisma.playlist.findMany({
      where: { userId },
      include: {
        tracks: { where: { processingStatus: 'READY' }, select: { id: true, title: true, cover: true } },
        _count: { select: { tracks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  /** Runs the add tracks operation. */
  async addTracks(userId: UserEntity['id'], id: PlaylistEntity['id'], dto: AddTracksDto) {
    const playlist = await this.prisma.playlist.findFirst({ where: { id, userId } })
    if (!playlist) throw new NotFoundException('Playlist not found or not owned by user')

    const readyCount = await this.prisma.track.count({
      where: { id: { in: dto.trackIds }, processingStatus: 'READY' },
    })
    if (readyCount !== dto.trackIds.length) {
      throw new BadRequestException('Some tracks are not available yet')
    }

    return await this.prisma.playlist.update({
      where: { id },
      data: { tracks: { connect: dto.trackIds.map((trackId) => ({ id: trackId })) } },
      include: { tracks: { where: { processingStatus: 'READY' } } },
    })
  }

  /** Runs the remove track operation. */
  async removeTrack(userId: UserEntity['id'], id: PlaylistEntity['id'], trackId: string) {
    const playlist = await this.prisma.playlist.findFirst({ where: { id, userId } })
    if (!playlist) throw new NotFoundException('Playlist not found or not owned by user')

    return await this.prisma.playlist.update({
      where: { id },
      data: { tracks: { disconnect: { id: trackId } } },
      include: { tracks: { where: { processingStatus: 'READY' } } },
    })
  }
}
