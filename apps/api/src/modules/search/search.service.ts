import { normalizePagination } from '@common/pagination'
import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { countType, searchType } from './search.queries'
import {
  ALL_SEARCH_TYPES,
  type SearchFilters,
  type SearchOptions,
  type SearchResult,
  type SearchType,
} from './search.types'

/** Longest query string kept in a user's search history. */
const MAX_HISTORY_QUERY_LENGTH = 200

/** Repeating the same query inside this window does not add a history entry. */
const HISTORY_DEDUPE_WINDOW_MS = 60_000

/** Runs full-text search across tracks, artists, albums, and playlists. */
@Injectable()
export class SearchService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /** Normalises the optional narrowing filters, dropping blank values. */
  private toFilters(options: Partial<SearchOptions>): SearchFilters {
    return {
      year: options.year,
      genre: options.genre?.trim() || undefined,
      artist: options.artist?.trim() || undefined,
    }
  }

  /** Runs every requested bucket and assembles the combined response. */
  private async runSearch(
    query: string,
    types: SearchType[],
    filters: SearchFilters,
    pagination: ReturnType<typeof normalizePagination>,
  ) {
    const { page, limit, skip: offset } = pagination
    const input = { prisma: this.prisma, query, limit, offset, filters }

    const [resultEntries, countEntries] = await Promise.all([
      Promise.all(types.map(async (type) => [type, await searchType(type, input)] as const)),
      Promise.all(
        types.map(
          async (type) => [type, await countType(this.prisma, type, query, filters)] as const,
        ),
      ),
    ])

    const data = Object.fromEntries(resultEntries) as Record<SearchType, SearchResult[]>
    const totals = Object.fromEntries(countEntries) as Record<SearchType, number>
    const allResults = resultEntries.flatMap(([, values]) => values)

    return {
      data,
      totals,
      total: Object.values(totals).reduce((sum, count) => sum + count, 0),
      page,
      limit,
      limitPerType: limit,
      topResult: allResults.sort((left, right) => right.rank - left.rank)[0] ?? null,
    }
  }

  /** Runs the search operation. */
  async search(query: string, options: Partial<SearchOptions> = {}) {
    const types = options.types ?? ALL_SEARCH_TYPES
    const pagination = normalizePagination(options.page ?? 1, options.limit ?? 10)
    const filters = this.toFilters(options)
    const key = JSON.stringify({
      query: query.toLowerCase(),
      types: [...types].sort(),
      page: pagination.page,
      limit: pagination.limit,
      filters,
    })

    const response = await this.cache.wrap(NS.SEARCH, key, TTL.MEDIUM, () =>
      this.runSearch(query, types, filters, pagination),
    )

    if (options.userId) await this.recordSearch(options.userId, query)

    return response
  }

  /** Runs the get history operation. */
  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await this.prisma.$transaction([
      this.prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { searchedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.searchHistory.count({ where: { userId } }),
    ])
    return { data, total, page, limit }
  }

  /** Runs the clear history operation. */
  async clearHistory(userId: string) {
    await this.prisma.searchHistory.deleteMany({ where: { userId } })
  }

  /**
   * Appends a query to the user's history, collapsing rapid repeats.
   *
   * Typing into a search box fires many requests for one intent, so a repeat
   * inside the dedupe window is treated as the same search.
   */
  private async recordSearch(userId: string, query: string) {
    const normalizedQuery = query.trim().slice(0, MAX_HISTORY_QUERY_LENGTH)
    const latest = await this.prisma.searchHistory.findFirst({
      where: { userId, query: { equals: normalizedQuery, mode: 'insensitive' } },
      orderBy: { searchedAt: 'desc' },
    })
    if (latest && Date.now() - latest.searchedAt.getTime() < HISTORY_DEDUPE_WINDOW_MS) return

    await this.prisma.searchHistory.create({ data: { userId, query: normalizedQuery } })
  }
}
