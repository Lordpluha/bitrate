import { PrismaService } from '@infra/prisma/prisma.service'
import { UserEntity } from '@modules/users'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { AddTracksDto, CreatePlaylistDto, UpdatePlaylistDto } from './dtos'
import { PlaylistEntity } from './entities'

/** Represents the playlists service. */
@Injectable()
export class PlaylistsService {
  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaService) {}

  /** Runs the create operation. */
  async create(userId: UserEntity['id'], playlistDto: CreatePlaylistDto) {
    return await this.prisma.playlist.create({
      data: {
        userId,
        cover: '',
        ...playlistDto,
      },
    })
  }

  /** Runs the get all operation. */
  async getAll({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    return await this.prisma.playlist.findMany({
      skip: (page - 1) * limit,
      take: limit,
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
      where: {
        id,
      },
      include: {
        tracks: true,
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

    return await this.prisma.playlist.update({
      where: { id },
      data: updateDto,
    })
  }

  /** Runs the delete operation. */
  async delete(userId: UserEntity['id'], id: PlaylistEntity['id']) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } })
    if (!playlist) throw new NotFoundException('Playlist not found')
    if (playlist.userId !== userId) throw new ForbiddenException('You do not own this playlist')

    return await this.prisma.playlist.delete({ where: { id } })
  }

  /** Runs the like operation. */
  async like(userId: UserEntity['id'], playlistId: PlaylistEntity['id']) {
    return await this.prisma.playlist.update({
      where: { id: playlistId },
      data: { likedBy: { connect: { id: userId } } },
    })
  }

  /** Runs the unlike operation. */
  async unlike(userId: UserEntity['id'], playlistId: PlaylistEntity['id']) {
    return await this.prisma.playlist.update({
      where: { id: playlistId },
      data: { likedBy: { disconnect: { id: userId } } },
    })
  }

  /** Runs the get mine operation. */
  async getMine(userId: UserEntity['id']) {
    return await this.prisma.playlist.findMany({
      where: { userId },
      include: {
        tracks: { select: { id: true, title: true, cover: true } },
        _count: { select: { tracks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  /** Runs the add tracks operation. */
  async addTracks(userId: UserEntity['id'], id: PlaylistEntity['id'], dto: AddTracksDto) {
    const playlist = await this.prisma.playlist.findFirst({ where: { id, userId } })
    if (!playlist) throw new NotFoundException('Playlist not found or not owned by user')

    return await this.prisma.playlist.update({
      where: { id },
      data: { tracks: { connect: dto.trackIds.map((trackId) => ({ id: trackId })) } },
      include: { tracks: true },
    })
  }

  /** Runs the remove track operation. */
  async removeTrack(userId: UserEntity['id'], id: PlaylistEntity['id'], trackId: string) {
    const playlist = await this.prisma.playlist.findFirst({ where: { id, userId } })
    if (!playlist) throw new NotFoundException('Playlist not found or not owned by user')

    return await this.prisma.playlist.update({
      where: { id },
      data: { tracks: { disconnect: { id: trackId } } },
      include: { tracks: true },
    })
  }
}
