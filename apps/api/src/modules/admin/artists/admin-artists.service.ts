import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { ADMIN_ARTIST_SAFE_SELECT } from './artist.select'
import type { UpdateArtistVerificationDto } from './dtos'
import { ArtistNotFoundException } from './errors'

/** Input for listing operator-facing artists. */
type ListArtistsInput = { page?: number; limit?: number; verified?: boolean; q?: string }

/** Handles the operator-facing artist directory. */
@Injectable()
export class AdminArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Builds the shared `where` clause for listing and counting. */
  private buildWhere({ verified, q }: Omit<ListArtistsInput, 'page' | 'limit'>) {
    return {
      deletedAt: null,
      ...(verified !== undefined && { verified }),
      ...(q && {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    } satisfies Prisma.ArtistWhereInput
  }

  /** Runs the find all operation, paginated and optionally filtered. */
  async findAll({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, verified, q }: ListArtistsInput) {
    const where = this.buildWhere({ verified, q })
    const [data, total] = await Promise.all([
      this.prisma.artist.findMany({
        where,
        select: ADMIN_ARTIST_SAFE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.artist.count({ where }),
    ])
    return { data, total, page, limit }
  }

  /** Runs the find by id operation. Excludes soft-deleted artists. */
  async findById(id: string) {
    const artist = await this.prisma.artist.findFirst({
      where: { id, deletedAt: null },
      select: ADMIN_ARTIST_SAFE_SELECT,
    })
    if (!artist) throw new ArtistNotFoundException(id)
    return artist
  }

  /** Runs the update verification operation. */
  async updateVerification(id: string, dto: UpdateArtistVerificationDto) {
    const existing = await this.prisma.artist.findFirst({ where: { id, deletedAt: null } })
    if (!existing) throw new ArtistNotFoundException(id)

    return await this.prisma.artist.update({
      where: { id },
      data: { verified: dto.verified },
      select: ADMIN_ARTIST_SAFE_SELECT,
    })
  }

  /** Soft-deletes an artist by stamping `deletedAt` — never a physical delete. */
  async softDelete(id: string) {
    const existing = await this.prisma.artist.findFirst({ where: { id, deletedAt: null } })
    if (!existing) throw new ArtistNotFoundException(id)

    return await this.prisma.artist.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: ADMIN_ARTIST_SAFE_SELECT,
    })
  }
}
