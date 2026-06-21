import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { UserEntity } from '@modules/users'
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import type { CreateArtistDto, UpdateArtistDto } from './dtos'
import type { ArtistEntity } from './entities'

/** Service handling public artist CRUD, follow/unfollow, and cache-wrapped lookups. */
@Injectable()
export class ArtistsService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Creates a new artist record, omitting the password from the returned data.
   * @param param0 Artist registration credentials.
   * @returns The newly created artist (without password).
   */
  async register({ password, email, username }: CreateArtistDto) {
    return await this.prisma.artist.create({
      data: { password, username, email },
      omit: { password: true },
    })
  }

  /**
   * Returns a paginated, cache-wrapped list of artists, optionally filtered by username.
   * @param param0 Pagination options and optional username filter.
   * @returns Array of safe artist records (password and email omitted).
   */
  async findAll({
    page = 1,
    limit = 10,
    username,
  }: { page?: number; limit?: number } & Partial<Pick<ArtistEntity, 'username'>>) {
    return await this.cache.wrap(
      NS.ARTISTS,
      `list:${page}:${limit}:${username ?? ''}`,
      TTL.SHORT,
      () =>
        this.prisma.artist.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: username ? { username: { contains: username, mode: 'insensitive' } } : undefined,
          omit: { password: true, email: true },
        }),
    )
  }

  /** Runs the find by username operation. */
  async findByUsername(username: ArtistEntity['username']) {
    return await this.cache.wrap(NS.ARTISTS, `username:${username}`, TTL.LONG, () =>
      this.prisma.artist.findUnique({ where: { username }, omit: { password: true, email: true } }),
    )
  }

  /** Runs the update operation. */
  async update(
    id: ArtistEntity['id'],
    artist: UpdateArtistDto,
    currentArtistId: ArtistEntity['id'],
  ) {
    if (id !== currentArtistId) throw new UnauthorizedException('Unauthorized')

    const updated = await this.prisma.artist.update({
      where: { id },
      data: artist,
      omit: { password: true, email: true },
    })
    await this.cache.invalidate(NS.ARTISTS)
    return updated
  }

  /** Runs the request delete operation. */
  async requestDelete(id: ArtistEntity['id'], currentArtistId: ArtistEntity['id']) {
    if (id !== currentArtistId) throw new UnauthorizedException('Unauthorized')

    const deleted = await this.prisma.artist.delete({
      where: { id },
      omit: { password: true, email: true },
    })
    await this.cache.invalidate(NS.ARTISTS)
    return deleted
  }

  /** Runs the find by email operation. */
  async findByEmail(email: ArtistEntity['email']) {
    return await this.prisma.artist.findUnique({ where: { email }, omit: { password: true } })
  }

  /** Runs the find by id operation. */
  async findById(id: ArtistEntity['id']) {
    return await this.cache.wrap(NS.ARTISTS, `id:${id}`, TTL.LONG, () =>
      this.prisma.artist.findUnique({ where: { id }, omit: { password: true, email: true } }),
    )
  }

  /** Runs the follow operation. */
  async follow(userId: UserEntity['id'], artistId: ArtistEntity['id']) {
    const artist = await this.prisma.artist.findUnique({ where: { id: artistId } })
    if (!artist) throw new NotFoundException('Artist not found')

    return await this.prisma.artist.update({
      where: { id: artistId },
      data: { followers: { connect: { id: userId } } },
      omit: { password: true, email: true },
      include: { _count: { select: { followers: true } } },
    })
  }

  /** Runs the unfollow operation. */
  async unfollow(userId: UserEntity['id'], artistId: ArtistEntity['id']) {
    const artist = await this.prisma.artist.findUnique({ where: { id: artistId } })
    if (!artist) throw new NotFoundException('Artist not found')

    return await this.prisma.artist.update({
      where: { id: artistId },
      data: { followers: { disconnect: { id: userId } } },
      omit: { password: true, email: true },
      include: { _count: { select: { followers: true } } },
    })
  }

  /** Runs the get following operation. */
  async getFollowing(userId: UserEntity['id'], page = 1, limit = 20) {
    return await this.prisma.artist.findMany({
      where: { followers: { some: { id: userId } } },
      omit: { password: true, email: true },
      include: { _count: { select: { followers: true } } },
      skip: (page - 1) * limit,
      take: limit,
    })
  }
}
