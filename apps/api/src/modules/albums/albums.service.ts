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
    return await this.cache.wrap(NS.ALBUMS, `list:${page}:${limit}:${title ?? ''}`, TTL.SHORT, () =>
      this.prisma.album.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: title ? { title: { contains: title, mode: 'insensitive' } } : undefined,
        include: { tracks: true },
      }),
    )
  }

  /** Runs the get by id operation. */
  async getById(id: AlbumEntity['id']) {
    return await this.cache.wrap(NS.ALBUMS, `id:${id}`, TTL.LONG, () =>
      this.prisma.album.findFirst({ where: { id }, include: { tracks: true } }),
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
    const album = await this.prisma.album.findFirst({ where: { id, artistId } })
    if (!album) throw new NotFoundException('Album not found or does not belong to the artist')

    const updated = await this.prisma.album.update({ where: { id }, data: updateDto })
    await Promise.all([this.cache.invalidate(NS.ALBUMS), this.cache.invalidate(NS.SEARCH)])
    return updated
  }

  /** Runs the delete operation. */
  async delete(artistId: ArtistEntity['id'], id: AlbumEntity['id']) {
    const album = await this.prisma.album.findFirst({ where: { id, artistId } })
    if (!album) throw new NotFoundException('Album not found or does not belong to the artist')

    const deleted = await this.prisma.album.delete({ where: { id }, omit: { artistId: true } })
    await Promise.all([this.cache.invalidate(NS.ALBUMS), this.cache.invalidate(NS.SEARCH)])
    return deleted
  }

  /** Runs the like operation. */
  async like(userId: UserEntity['id'], albumId: AlbumEntity['id']) {
    return await this.prisma.album.update({
      where: { id: albumId },
      data: { likedBy: { connect: { id: userId } } },
    })
  }

  /** Runs the unlike operation. */
  async unlike(userId: UserEntity['id'], albumId: AlbumEntity['id']) {
    return await this.prisma.album.update({
      where: { id: albumId },
      data: { likedBy: { disconnect: { id: userId } } },
    })
  }
}
