import { Injectable } from '@nestjs/common'
import { Artist } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserEntity } from 'src/users/entities'
import { TrackEntity } from './entities'
import { CreateTrackDto } from './dtos'
import { ArtistEntity } from 'src/artists/entities'

@Injectable()
export class TracksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    page = 1,
    limit = 10,
    title
  }: { page?: number; limit?: number } & Partial<TrackEntity>) {
    const skip = (page - 1) * limit

    const [data, total] = await this.prisma.$transaction([
      this.prisma.track.findMany({
        skip,
        where: title
          ? {
              title: {
                contains: title,
                mode: 'insensitive'
              }
            }
          : undefined,
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

  async findLikedTracksByUserId(userId: UserEntity['id']) {
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

  async findTrackById(id: TrackEntity['id']) {
    return this.prisma.track.findUnique({
      where: {
        id
      }
    })
  }

  async findTracksByArtistId(artistId: Artist['id']) {
    return this.prisma.track.findMany({
      where: {
        artistId
      }
    })
  }

  async findTracksByArtistName(artistUsername: Artist['username']) {
    return this.prisma.track.findMany({
      where: {
        artist: {
          username: artistUsername
        }
      }
    })
  }

  async create(artistId: ArtistEntity['id'], createTrackDto: CreateTrackDto) {
    return this.prisma.track.create({
      data: {
        artistId,
        ...createTrackDto
      }
    })
  }

  async update(id: TrackEntity['id'], createTrackDto: CreateTrackDto) {
    return this.prisma.track.update({
      where: {
        id
      },
      data: createTrackDto
    })
  }
}
