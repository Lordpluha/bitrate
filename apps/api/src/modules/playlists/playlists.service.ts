import { PrismaService } from '@infra/prisma/prisma.service'
import { UserEntity } from '@modules/users'
import { Injectable } from '@nestjs/common'
import { CreatePlaylistDto, UpdatePlaylistDto } from './dtos'
import { PlaylistEntity } from './entities'

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: UserEntity['id'], playlistDto: CreatePlaylistDto) {
    return await this.prisma.playlist.create({
      data: {
        userId,
        cover: '',
        ...playlistDto,
      },
    })
  }

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

  async getById(id: PlaylistEntity['id']) {
    return await this.prisma.playlist.findUniqueOrThrow({
      where: {
        id,
      },
    })
  }

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

  async update(userId: UserEntity['id'], id: PlaylistEntity['id'], updateDto: UpdatePlaylistDto) {
    return await this.prisma.playlist.update({
      where: {
        id,
      },
      data: {
        ...updateDto,
        userId,
      },
    })
  }

  async delete(userId: UserEntity['id'], id: PlaylistEntity['id']) {
    return await this.prisma.playlist.delete({
      where: {
        id,
        userId,
      },
    })
  }
}
