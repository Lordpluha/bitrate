import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from 'src/users/entities'
import { CreatePlaylistDto } from './dtos/create-playlist.dto'
import { UpdatePlaylistDto } from './dtos/update-playlist.dto'
import { PlaylistEntity } from './entities'

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: UserEntity['id'], playlistDto: CreatePlaylistDto) {
    return await this.prisma.playlist.create({
      data: {
        userId,
        // Url to cover in storage
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
