import { Get, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AlbumEntity } from './entities/album.entity'

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

  findById(id: AlbumEntity['id']) {
    return this.prisma.album.findUnique({
      where: { id },
      include: {
        tracks: true
      }
    })
  }
}
