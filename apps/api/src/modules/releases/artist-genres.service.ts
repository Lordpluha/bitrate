import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { GENRE_OPTION_SELECT } from './orm'

/** The admin-managed genre catalogue artists choose recording genres from. */
@Injectable()
export class ArtistGenresService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every genre, alphabetical; the catalogue is small enough to send whole. */
  list() {
    return this.prisma.genre.findMany({ select: GENRE_OPTION_SELECT, orderBy: { name: 'asc' } })
  }
}
