import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateArtistDto } from './dtos'
import { ArtistEntity } from './entities'

@Injectable()
export class ArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ password, email, username }: CreateArtistDto) {
    return await this.prisma.artist.create({
      data: {
        password,
        username,
        email,
      },
      omit: {
        password: true,
      },
    })
  }

  async findAll({
    page = 1,
    limit = 10,
    username,
  }: { page?: number; limit?: number } & Partial<Pick<ArtistEntity, 'username'>>) {
    return await this.prisma.artist.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: username
        ? {
            username: {
              contains: username,
              mode: 'insensitive',
            },
          }
        : undefined,
      omit: {
        password: true,
        email: true,
      },
    })
  }

  async findByUsername(username: ArtistEntity['username']) {
    return await this.prisma.artist.findUnique({
      where: { username },
    })
  }

  async update(id: ArtistEntity['id'], artist: Partial<ArtistEntity>) {
    return await this.prisma.artist.update({
      where: { id },
      data: artist,
      omit: {
        password: true,
      },
    })
  }

  async delete(id: ArtistEntity['id']) {
    return await this.prisma.artist.delete({
      where: { id },
      omit: {
        password: true,
      },
    })
  }

  async findByEmail(email: ArtistEntity['email']) {
    return await this.prisma.artist.findUnique({
      where: { email },
    })
  }

  async findById_UNSECURE(id: ArtistEntity['id']) {
    return await this.prisma.artist.findUnique({
      where: { id },
    })
  }

  async findById(id: ArtistEntity['id']) {
    return await this.prisma.artist.findUnique({
      where: { id },
      omit: {
        password: true,
        email: true,
      },
    })
  }
}
