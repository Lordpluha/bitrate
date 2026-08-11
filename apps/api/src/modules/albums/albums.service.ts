import { normalizePagination } from '@common/pagination'
import { isPrismaP2025 } from '@common/utils/prisma'
import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { ArtistEntity } from '@modules/artists'
import type { UserEntity } from '@modules/users'
import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateAlbumDto } from './dtos/create-album.dto'
import { UpdateAlbumDto } from './dtos/update-album.dto'
import { AlbumEntity } from './entities'

/** Represents the albums service. */
@Injectable()
export class AlbumsService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /** Runs the find all operation. */
  async findAll({
    page = 1,
    limit = 10,
    title,
  }: { page?: number; limit?: number } & Partial<AlbumEntity>) {
    const pagination = normalizePagination(page, limit)
    const where = {
      deletedAt: null,
      ...(title ? { title: { contains: title, mode: 'insensitive' as const } } : {}),
    }
    return await this.cache.wrap(
      NS.ALBUMS,
      `list:${pagination.page}:${pagination.limit}:${title ?? ''}`,
      TTL.SHORT,
      async () => {
        const [albums, total] = await this.prisma.$transaction([
          this.prisma.album.findMany({
            skip: pagination.skip,
            take: pagination.limit,
            where,
            include: {
              tracks: {
                where: { track: { processingStatus: 'READY', deletedAt: null } },
                include: { track: true },
                orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
              },
            },
          }),
          this.prisma.album.count({ where }),
        ])
        const data = albums.map((album) => ({
          ...album,
          tracks: album.tracks.map(({ track, ...membership }) => ({
            ...track,
            ...membership,
          })),
        }))
        return { data, total, page: pagination.page, limit: pagination.limit }
      },
    )
  }

  /** Runs the get by id operation. */
  async getById(id: AlbumEntity['id']) {
    return await this.cache.wrap(NS.ALBUMS, `id:${id}`, TTL.LONG, () =>
      this.prisma.album
        .findFirst({
          where: { id, deletedAt: null },
          include: {
            tracks: {
              where: { track: { processingStatus: 'READY', deletedAt: null } },
              include: { track: true },
              orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
            },
          },
        })
        .then((album) =>
          album
            ? {
                ...album,
                tracks: album.tracks.map(({ track, ...membership }) => ({
                  ...track,
                  ...membership,
                })),
              }
            : null,
        ),
    )
  }

  /** Runs the create operation. */
  async create(artistId: ArtistEntity['id'], createDto: CreateAlbumDto) {
    const artist = await this.prisma.artist.findUnique({ where: { id: artistId } })
    if (!artist) throw new NotFoundException('Artist not found')

    const album = await this.prisma.album.create({ data: { artistId: artist.id, ...createDto } })
    await Promise.all([this.cache.invalidate(NS.ALBUMS), this.cache.invalidate(NS.SEARCH)])
    return album
  }

  /** Runs the update operation. */
  async update(artistId: ArtistEntity['id'], id: AlbumEntity['id'], updateDto: UpdateAlbumDto) {
    const album = await this.prisma.album.findFirst({ where: { id, artistId, deletedAt: null } })
    if (!album) throw new NotFoundException('Album not found or does not belong to the artist')

    const updated = await this.prisma.album.update({ where: { id }, data: updateDto })
    await Promise.all([this.cache.invalidate(NS.ALBUMS), this.cache.invalidate(NS.SEARCH)])
    return updated
  }

  /** Runs the delete operation. */
  async delete(artistId: ArtistEntity['id'], id: AlbumEntity['id']) {
    const album = await this.prisma.album.findFirst({ where: { id, artistId, deletedAt: null } })
    if (!album) throw new NotFoundException('Album not found or does not belong to the artist')

    const deleted = await this.prisma.album.update({
      where: { id },
      data: { deletedAt: new Date() },
      omit: { artistId: true },
    })
    await Promise.all([this.cache.invalidate(NS.ALBUMS), this.cache.invalidate(NS.SEARCH)])
    return deleted
  }

  /** Runs the like operation. */
  async like(userId: UserEntity['id'], albumId: AlbumEntity['id']) {
    try {
      const album = await this.prisma.album.findFirst({
        where: { id: albumId, deletedAt: null },
      })
      if (!album) throw new NotFoundException('Album not found')
      await this.prisma.userLikedAlbum.upsert({
        where: { userId_albumId: { userId, albumId } },
        update: {},
        create: { userId, albumId },
      })
      return album
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Album not found')
      throw error
    }
  }

  /** Runs the unlike operation. */
  async unlike(userId: UserEntity['id'], albumId: AlbumEntity['id']) {
    try {
      const album = await this.prisma.album.findFirst({
        where: { id: albumId, deletedAt: null },
      })
      if (!album) throw new NotFoundException('Album not found')
      await this.prisma.userLikedAlbum.deleteMany({ where: { userId, albumId } })
      return album
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Album not found')
      throw error
    }
  }
}
