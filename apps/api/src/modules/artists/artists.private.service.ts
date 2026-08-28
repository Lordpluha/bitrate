import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { CreateArtistDto } from './dtos'
import { ArtistEntity } from './entities'

/** Represents the artists private service. */
@Injectable()
export class ArtistsPrivateService {
  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaService) {}

  /** Runs the register operation. */
  async register({ password, email, username }: CreateArtistDto) {
    return await this.prisma.artist.create({
      data: {
        password,
        username,
        email,
      },
    })
  }

  /** Runs the login operation. */
  async login({ email, password }: CreateArtistDto) {
    const user = await this.prisma.artist.findFirst({
      where: {
        email,
        password,
        deletedAt: null,
      },
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    return user
  }

  /** Runs the find all operation. */
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
    })
  }

  /** Runs the update operation. */
  async update(id: ArtistEntity['id'], artist: Prisma.ArtistUncheckedUpdateInput) {
    return await this.prisma.artist.update({
      where: { id },
      data: artist,
    })
  }

  /** Runs the delete operation. */
  async delete(id: ArtistEntity['id']) {
    return await this.prisma.artist.delete({
      where: { id },
    })
  }

  /** Runs the find by id operation. */
  async findById(id: ArtistEntity['id']) {
    return await this.prisma.artist.findFirst({
      where: { id, deletedAt: null },
    })
  }

  /** Runs the find by email operation. */
  async findByEmail(email: ArtistEntity['email']) {
    return await this.prisma.artist.findFirst({
      where: { email, deletedAt: null },
    })
  }
}
