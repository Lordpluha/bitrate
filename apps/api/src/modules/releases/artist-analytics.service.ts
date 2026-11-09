import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { ArtistAnalyticsDto, ArtistTopTracksDto } from './dtos/artist-analytics.dto'

const DAY_MS = 86_400_000
const TOP_TRACK_LIMIT = 10
const TOP_TRACK_PAGE_SIZE = 5

/** External sources the design lists; none is connected, so none reports numbers. */
const EXTERNAL_SOURCES = ['SPOTIFY', 'APPLE_MUSIC', 'YOUTUBE_MUSIC'] as const

type AnalyticsState = 'NO_TRACKS' | 'NO_DATA_YET' | 'READY'

interface TotalsRow {
  plays: bigint
  listeners: bigint
}

interface DailyRow {
  day: Date
  plays: bigint
}

interface TopRow {
  id: string
  title: string
  cover: string | null
  plays: bigint
  listeners: bigint
}

/** A ranking row with its window totals: the period's track count and its leader's plays. */
interface RankedTopRow extends TopRow {
  maxPlays: bigint
  total: bigint
}

/**
 * Listening analytics from Bitrate's own playback history only. Periods are whole UTC days
 * ending today; a day without plays inside a period with data is an observed zero, while an
 * artist with no plays at all reads NO_DATA_YET instead of a chart of zeroes.
 */
@Injectable()
export class ArtistAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * One page of the period's ranking. The page, its total and the leader's plays come from one
   * scan of the history; only a page past the end costs a count and a second read.
   */
  async topTracks(artistId: string, input: ArtistTopTracksDto) {
    const from = periodStart(input.days, new Date())
    const scope = trackHistoryScope(artistId)
    const readPage = (page: number) =>
      this.prisma.queryRaw<RankedTopRow[]>(Prisma.sql`
      SELECT t.id, t.title, t.cover, COUNT(*)::bigint AS plays,
             COUNT(DISTINCT h."userId")::bigint AS listeners,
             MAX(COUNT(*)) OVER () AS "maxPlays",
             COUNT(*) OVER ()::bigint AS total
      ${scope} AND h."listenedAt" >= ${from}
      GROUP BY t.id, t.title, t.cover ORDER BY plays DESC, t.id ASC
      LIMIT ${TOP_TRACK_PAGE_SIZE} OFFSET ${(page - 1) * TOP_TRACK_PAGE_SIZE}`)
    let page = input.page
    let rows = await readPage(page)
    let total = Number(rows[0]?.total ?? 0)
    if (rows.length === 0 && page > 1) {
      const [count] = await this.prisma.queryRaw<{ total: bigint }[]>(Prisma.sql`
        SELECT COUNT(DISTINCT t.id)::bigint AS total
        ${scope} AND h."listenedAt" >= ${from}`)
      total = Number(count?.total ?? 0)
      page = Math.max(1, Math.ceil(total / TOP_TRACK_PAGE_SIZE))
      rows = total === 0 ? [] : await readPage(page)
    }
    return {
      data: rows.map(topTrack),
      total,
      page,
      limit: TOP_TRACK_PAGE_SIZE,
      days: input.days,
      maxPlays: Number(rows[0]?.maxPlays ?? 0),
    }
  }

  async overview(artistId: string, input: ArtistAnalyticsDto) {
    const days = input.days
    const now = new Date()
    const from = periodStart(days, now)
    const previousFrom = new Date(from.getTime() - days * DAY_MS)
    const period = { from, to: now, days, timezone: 'UTC' as const }
    const external = EXTERNAL_SOURCES.map((source) => ({
      source,
      state: 'NOT_CONNECTED' as const,
    }))

    const tracks = await this.prisma.track.count({ where: { artistId, deletedAt: null } })
    if (tracks === 0) return this.empty('NO_TRACKS', period, now, external)
    const everPlayed = await this.prisma.listeningHistory.count({
      where: { track: { artistId, deletedAt: null } },
      take: 1,
    })
    if (everPlayed === 0) return this.empty('NO_DATA_YET', period, now, external)

    const scope = trackHistoryScope(artistId)
    const [current, previous, daily, top] = await Promise.all([
      this.prisma.queryRaw<TotalsRow[]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS plays, COUNT(DISTINCT h."userId")::bigint AS listeners
        ${scope} AND h."listenedAt" >= ${from}`),
      this.prisma.queryRaw<TotalsRow[]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS plays, COUNT(DISTINCT h."userId")::bigint AS listeners
        ${scope} AND h."listenedAt" >= ${previousFrom} AND h."listenedAt" < ${from}`),
      this.prisma.queryRaw<DailyRow[]>(Prisma.sql`
        SELECT date_trunc('day', h."listenedAt" AT TIME ZONE 'UTC') AS day,
               COUNT(*)::bigint AS plays
        ${scope} AND h."listenedAt" >= ${from}
        GROUP BY day ORDER BY day`),
      this.prisma.queryRaw<TopRow[]>(Prisma.sql`
        SELECT t.id, t.title, t.cover, COUNT(*)::bigint AS plays,
               COUNT(DISTINCT h."userId")::bigint AS listeners
        ${scope} AND h."listenedAt" >= ${from}
        GROUP BY t.id, t.title, t.cover ORDER BY plays DESC, t.id ASC
        LIMIT ${TOP_TRACK_LIMIT}`),
    ])

    const byDay = new Map(daily.map((row) => [isoDay(row.day), Number(row.plays)]))
    const state: AnalyticsState = 'READY'
    return {
      state,
      period,
      freshness: now,
      totals: totals(current[0]),
      previous: totals(previous[0]),
      daily: Array.from({ length: days }, (_, index) => {
        const date = isoDay(new Date(from.getTime() + index * DAY_MS))
        return { date, plays: byDay.get(date) ?? 0 }
      }),
      topTracks: top.map(topTrack),
      external,
    }
  }

  private empty(
    state: AnalyticsState,
    period: { from: Date; to: Date; days: number; timezone: 'UTC' },
    now: Date,
    external: { source: (typeof EXTERNAL_SOURCES)[number]; state: 'NOT_CONNECTED' }[],
  ) {
    return {
      state,
      period,
      freshness: now,
      totals: null,
      previous: null,
      daily: [],
      topTracks: [],
      external,
    }
  }
}

function periodStart(days: number, now: Date): Date {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return new Date(today - (days - 1) * DAY_MS)
}

function trackHistoryScope(artistId: string) {
  return Prisma.sql`
    FROM "ListeningHistory" h
    JOIN "Track" t ON t.id = h."trackId"
    WHERE t."artistId" = ${artistId}::uuid AND t."deletedAt" IS NULL`
}

function topTrack(row: TopRow) {
  return {
    trackId: row.id,
    title: row.title,
    cover: row.cover,
    plays: Number(row.plays),
    listeners: Number(row.listeners),
  }
}

function totals(row: TotalsRow | undefined) {
  return { plays: Number(row?.plays ?? 0), listeners: Number(row?.listeners ?? 0) }
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}
