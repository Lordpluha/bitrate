import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from 'src/users/entities'
import { CreatePlaylistDto } from './dtos/create-playlist.dto'
import { PlaylistEntity } from './entities'
import { UpdatePlaylistDto } from './dtos/update-playlist.dto'

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: UserEntity['id'], playlistDto: CreatePlaylistDto) {
    return this.prisma.playlist.create({
      data: {
        userId,
        // Url to cover in storage
        cover: '',
        ...playlistDto
      }
    })
  }

  getAll({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    return this.prisma.playlist.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })
  }

  getById(id: PlaylistEntity['id']) {
    return this.prisma.playlist.findUniqueOrThrow({
      where: {
        id
      }
    })
  }

  update(
    userId: UserEntity['id'],
    id: PlaylistEntity['id'],
    updateDto: UpdatePlaylistDto
  ) {
    return this.prisma.playlist.update({
      where: {
        id
      },
      data: {
        ...updateDto,
        userId
      }
    })
  }
}
