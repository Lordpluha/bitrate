import { PrismaService } from '@infra/prisma/prisma.service'
import { ArtistEntity } from '@modules/artists/entities'
import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateAlbumDto } from './dtos/create-album.dto'
import { UpdateAlbumDto } from './dtos/update-album.dto'
import { AlbumEntity } from './entities'

@Injectable()
export class AlbumsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    page = 1,
    limit = 10,
    title,
  }: { page?: number; limit?: number } & Partial<AlbumEntity>) {
    return await this.prisma.album.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: title ? { title: { contains: title, mode: 'insensitive' } } : undefined,
      include: {
        tracks: true,
      },
    })
  }

  async getById(id: AlbumEntity['id']) {
    return await this.prisma.album.findFirst({
      where: { id },
      include: {
        tracks: true,
      },
    })
  }

  async create(artistId: ArtistEntity['id'], createDto: CreateAlbumDto) {
    const artist = await this.prisma.artist.findUnique({
      where: { id: artistId },
    })

    if (!artist) {
      throw new NotFoundException('Artist not found')
    }

    return await this.prisma.album.create({
      data: {
        artistId: artist.id,
        ...createDto,
      },
    })
  }

  async update(artistId: ArtistEntity['id'], id: AlbumEntity['id'], updateDto: UpdateAlbumDto) {
    const album = await this.prisma.album.findFirst({
      where: { id, artistId },
    })

    if (!album) {
      throw new Error('Album not found or does not belong to the artist')
    }

    return await this.prisma.album.update({
      where: { id },
      data: updateDto,
    })
  }

  async delete(artistId: ArtistEntity['id'], id: AlbumEntity['id']) {
    const album = await this.prisma.album.findFirst({
      where: { id, artistId },
    })

    if (!album) {
      throw new Error('Album not found or does not belong to the artist')
    }

    return await this.prisma.album.delete({
      where: { id },
      omit: {
        artistId: true,
      },
    })
  }
}
