import { normalizePagination } from '@common/pagination'
import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { UserEntity } from '@modules/users'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PUBLIC_ARTIST_SELECT } from './artists.select'
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
    const created = await this.prisma.artist.create({
      data: { password, username, email },
      select: { id: true, email: true, username: true },
    })
    await Promise.all([this.cache.invalidate(NS.ARTISTS), this.cache.invalidate(NS.SEARCH)])
    return created
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
    const pagination = normalizePagination(page, limit)
    const where = {
      deletedAt: null,
      ...(username ? { username: { contains: username, mode: 'insensitive' as const } } : {}),
    }
    return await this.cache.wrap(
      NS.ARTISTS,
      `public:v2:list:${pagination.page}:${pagination.limit}:${username ?? ''}`,
      TTL.SHORT,
      async () => {
        const [data, total] = await this.prisma.$transaction([
          this.prisma.artist.findMany({
            skip: pagination.skip,
            take: pagination.limit,
            where,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            select: PUBLIC_ARTIST_SELECT,
          }),
          this.prisma.artist.count({ where }),
        ])
        return { data, total, page: pagination.page, limit: pagination.limit }
      },
    )
  }

  /** Runs the find by username operation. */
  async findByUsername(username: ArtistEntity['username']) {
    return await this.cache.wrap(NS.ARTISTS, `public:v2:username:${username}`, TTL.LONG, () =>
      this.prisma.artist.findFirst({
        where: { username, deletedAt: null },
        select: PUBLIC_ARTIST_SELECT,
      }),
    )
  }

  /** Runs the update operation. */
  async update(
    id: ArtistEntity['id'],
    artist: UpdateArtistDto,
    currentArtistId: ArtistEntity['id'],
  ) {
    if (id !== currentArtistId) throw new ForbiddenException('Forbidden')

    const updated = await this.prisma.artist.update({
      where: { id },
      data: artist,
      select: PUBLIC_ARTIST_SELECT,
    })
    await Promise.all([this.cache.invalidate(NS.ARTISTS), this.cache.invalidate(NS.SEARCH)])
    return updated
  }

  /** Runs the request delete operation. */
  async requestDelete(id: ArtistEntity['id'], currentArtistId: ArtistEntity['id']) {
    if (id !== currentArtistId) throw new ForbiddenException('Forbidden')

    const [deleted] = await this.prisma.$transaction([
      this.prisma.artist.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: PUBLIC_ARTIST_SELECT,
      }),
      this.prisma.artistSession.deleteMany({ where: { artistId: id } }),
    ])
    await Promise.all([this.cache.invalidate(NS.ARTISTS), this.cache.invalidate(NS.SEARCH)])
    return deleted
  }

  /** Runs the find by email operation. */
  async findByEmail(email: ArtistEntity['email']) {
    return await this.prisma.artist.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    })
  }

  /** Runs the find by id operation. */
  async findById(id: ArtistEntity['id']) {
    return await this.cache.wrap(NS.ARTISTS, `public:v2:id:${id}`, TTL.LONG, () =>
      this.prisma.artist.findFirst({
        where: { id, deletedAt: null },
        select: PUBLIC_ARTIST_SELECT,
      }),
    )
  }

  /** Runs the follow operation. */
  async follow(userId: UserEntity['id'], artistId: ArtistEntity['id']) {
    const artist = await this.prisma.artist.findFirst({
      where: { id: artistId, deletedAt: null },
      select: { id: true },
    })
    if (!artist) throw new NotFoundException('Artist not found')

    await this.prisma.userFollowedArtist.upsert({
      where: { userId_artistId: { userId, artistId } },
      update: {},
      create: { userId, artistId },
    })
    return await this.prisma.artist.findUniqueOrThrow({
      where: { id: artistId },
      select: {
        ...PUBLIC_ARTIST_SELECT,
        _count: { select: { followers: true } },
      },
    })
  }

  /** Runs the unfollow operation. */
  async unfollow(userId: UserEntity['id'], artistId: ArtistEntity['id']) {
    const artist = await this.prisma.artist.findFirst({
      where: { id: artistId, deletedAt: null },
      select: { id: true },
    })
    if (!artist) throw new NotFoundException('Artist not found')

    await this.prisma.userFollowedArtist.deleteMany({ where: { userId, artistId } })
    return await this.prisma.artist.findUniqueOrThrow({
      where: { id: artistId },
      select: {
        ...PUBLIC_ARTIST_SELECT,
        _count: { select: { followers: true } },
      },
    })
  }

  /** Runs the get following operation. */
  async getFollowing(userId: UserEntity['id'], page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const where = { userId, artist: { deletedAt: null } }
    const [follows, total] = await this.prisma.$transaction([
      this.prisma.userFollowedArtist.findMany({
        where,
        include: {
          artist: {
            select: {
              ...PUBLIC_ARTIST_SELECT,
              _count: { select: { followers: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.userFollowedArtist.count({ where }),
    ])
    return {
      data: follows.map(({ artist, createdAt }) => ({ ...artist, followedAt: createdAt })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    }
  }
}
