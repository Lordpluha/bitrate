import { Injectable } from '@nestjs/common'
import { Artist } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from 'src/users/entities'
import { TrackEntity } from './entities'

@Injectable()
export class TracksService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    const skip = (page - 1) * limit

    const [data, total] = await this.prisma.$transaction([
      this.prisma.track.findMany({
        skip,
        take: limit
      }),
      this.prisma.track.count()
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit)
      }
    }
  }

  async getLikedTracksByUserId(userId: UserEntity['id']) {
    return this.prisma.track.findMany({
      where: {
        likedBy: {
          some: {
            id: userId
          }
        }
      }
    })
  }

  async getTrackById(id: TrackEntity['id']) {
    return this.prisma.track.findUnique({
      where: {
        id
      }
    })
  }

  async getTrackByArtistId(artistId: Artist['id']) {
    return this.prisma.track.findMany({
      where: {
        artistId
      }
    })
  }

  async getTracksByArtistName(artistUsername: Artist['username']) {
    return this.prisma.track.findMany({
      where: {
        artist: {
          username: artistUsername
        }
      }
    })
  }
}
