import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AlbumEntity } from './entities'
import { CreateAlbumDto } from './dtos/create-album.dto'
import { ArtistEntity } from 'src/artists/entities'
import { UpdateAlbumDto } from './dtos/update-album.dto'

@Injectable()
export class AlbumsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll({
    page = 1,
    limit = 10,
    title
  }: { page?: number; limit?: number } & Partial<AlbumEntity>) {
    return this.prisma.album.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: title
        ? { title: { contains: title, mode: 'insensitive' } }
        : undefined,
      include: {
        tracks: true
      }
    })
  }

  getById(id: AlbumEntity['id']) {
    return this.prisma.album.findFirst({
      where: { id },
      include: {
        tracks: true
      }
    })
  }

  create(artistId: ArtistEntity['id'], createDto: CreateAlbumDto) {
    return this.prisma.album.create({
      data: {
        artistId: artistId,
        ...createDto
      }
    })
  }

  update(
    artistId: ArtistEntity['id'],
    id: AlbumEntity['id'],
    updateDto: UpdateAlbumDto
  ) {
    return this.prisma.album.update({
      where: { id },
      data: updateDto
    })
  }
}
