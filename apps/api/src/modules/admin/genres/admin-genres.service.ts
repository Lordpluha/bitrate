import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@common/pagination'
import { buildSortOrderBy, type SortInput } from '@common/sort'
import { PrismaService } from '@infra/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { ADMIN_GENRES_SORT_FIELDS, CreateGenreDto, UpdateGenreDto } from './dtos'
import { GenreInUseException, GenreNotFoundException, GenreSlugTakenException } from './errors'
import { ADMIN_GENRE_SELECT } from './genre.select'

/** One of the genre list's allowed sort fields. */
type AdminGenresSortField = (typeof ADMIN_GENRES_SORT_FIELDS)[number]

/** Input for listing operator-facing genres. */
type ListGenresInput = {
  page?: number
  limit?: number
  q?: string
} & SortInput<AdminGenresSortField>

/** A genre row as selected, still carrying Prisma's `_count`. */
type SelectedGenre = Prisma.GenreGetPayload<{ select: typeof ADMIN_GENRE_SELECT }>

/** Lowercases, strips diacritics and collapses everything but letters/digits into single hyphens. */
function slugifyGenreName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Handles operator-facing genre management. */
@Injectable()
export class AdminGenresService {
  constructor(private readonly prisma: PrismaService) {}

  /** Replaces Prisma's `_count` with the `counts` shape the contract exposes. */
  private toEntity({ _count, ...genre }: SelectedGenre) {
    return {
      ...genre,
      counts: { tracks: _count.tracks, albums: _count.albums, artists: _count.artists },
    }
  }

  /** Whether the error is a unique-constraint violation on the genre slug. */
  private isSlugViolation(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      return false
    }
    const target = error.meta?.target
    return Array.isArray(target) ? target.includes('slug') : String(target ?? '').includes('slug')
  }

  /** Runs the find all operation, paginated and optionally searched by name or slug. */
  async findAll({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, q, sort, order }: ListGenresInput) {
    const where = {
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      }),
    } satisfies Prisma.GenreWhereInput
    const orderBy = buildSortOrderBy({ sort, order }, [{ name: 'asc' }, { id: 'asc' }])

    const [rows, total] = await Promise.all([
      this.prisma.genre.findMany({
        where,
        select: ADMIN_GENRE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy as unknown as Prisma.GenreOrderByWithRelationInput[],
      }),
      this.prisma.genre.count({ where }),
    ])
    return { data: rows.map((row) => this.toEntity(row)), total, page, limit }
  }

  /** Runs the find by id operation, with reference counts. */
  async findById(id: string) {
    const genre = await this.prisma.genre.findUnique({ where: { id }, select: ADMIN_GENRE_SELECT })
    if (!genre) throw new GenreNotFoundException(id)
    return this.toEntity(genre)
  }

  /** Creates a genre; the slug is derived from the name when absent. */
  async create(dto: CreateGenreDto) {
    const slug = dto.slug ?? slugifyGenreName(dto.name)
    if (!slug) throw new BadRequestException('Genre name must contain letters or digits')

    try {
      const created = await this.prisma.genre.create({
        data: {
          name: dto.name.trim(),
          slug,
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.color !== undefined && { color: dto.color }),
        },
        select: ADMIN_GENRE_SELECT,
      })
      return this.toEntity(created)
    } catch (error) {
      if (this.isSlugViolation(error)) throw new GenreSlugTakenException(slug)
      throw error
    }
  }

  /** Updates only the fields that were given. */
  async update(id: string, dto: UpdateGenreDto) {
    const existing = await this.prisma.genre.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new GenreNotFoundException(id)

    try {
      const updated = await this.prisma.genre.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.slug !== undefined && { slug: dto.slug }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.color !== undefined && { color: dto.color }),
        },
        select: ADMIN_GENRE_SELECT,
      })
      return this.toEntity(updated)
    } catch (error) {
      if (this.isSlugViolation(error)) throw new GenreSlugTakenException(dto.slug ?? '')
      throw error
    }
  }

  /** Physically deletes a genre, refusing with 409 while anything still references it. */
  async remove(id: string) {
    const genre = await this.prisma.genre.findUnique({ where: { id }, select: ADMIN_GENRE_SELECT })
    if (!genre) throw new GenreNotFoundException(id)

    const { tracks, albums, artists } = genre._count
    if (tracks + albums + artists > 0) {
      throw new GenreInUseException(id, { tracks, albums, artists })
    }

    const deleted = await this.prisma.genre.delete({ where: { id }, select: ADMIN_GENRE_SELECT })
    return this.toEntity(deleted)
  }
}
