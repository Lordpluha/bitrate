import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

/** Days of listening behind `popularity` and `monthlyListeners`, the same window as the charts. */
export const LISTENING_WINDOW_DAYS = 28
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Keeps the denormalized listening numbers true: `Track.playCount` (all-time plays),
 * `Track.popularity` (plays in the window) and `Artist.monthlyListeners` (distinct listeners in
 * the window). A play is one listener in one hour, the unit `/charts/tracks` ranks by, so a
 * replayed track does not inflate it. Search, the feed, related artists and the admin read these
 * columns; nothing else may write them.
 */
@Injectable()
export class ListeningStatsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Recomputes every track and artist from `ListeningHistory`. Idempotent; safe to run twice. */
  async recompute() {
    const since = new Date(Date.now() - LISTENING_WINDOW_DAYS * DAY_MS)
    await this.prisma.$transaction([
      this.prisma.executeRaw(Prisma.sql`
        WITH plays AS (
          SELECT h."trackId",
                 COUNT(DISTINCT (h."userId", date_trunc('hour', h."listenedAt")))::int AS all_time,
                 (COUNT(DISTINCT (h."userId", date_trunc('hour', h."listenedAt")))
                   FILTER (WHERE h."listenedAt" >= ${since}))::int AS recent
          FROM "ListeningHistory" h
          GROUP BY h."trackId"
        ), next AS (
          SELECT t.id, COALESCE(p.all_time, 0) AS play_count, COALESCE(p.recent, 0) AS popularity
          FROM "Track" t
          LEFT JOIN plays p ON p."trackId" = t.id
        )
        UPDATE "Track" t
        SET "playCount" = COALESCE(n.play_count, 0),
            "popularity" = COALESCE(n.popularity, 0)
        FROM next n
        WHERE n.id = t.id
          AND (t."playCount" IS DISTINCT FROM n.play_count OR t."popularity" IS DISTINCT FROM n.popularity)
      `),
      this.prisma.executeRaw(Prisma.sql`
        WITH listeners AS (
          SELECT t."artistId", COUNT(DISTINCT h."userId")::int AS listeners
          FROM "ListeningHistory" h
          JOIN "Track" t ON t.id = h."trackId"
          WHERE h."listenedAt" >= ${since}
          GROUP BY t."artistId"
        ), next AS (
          SELECT a.id, COALESCE(l.listeners, 0) AS monthly
          FROM "Artist" a
          LEFT JOIN listeners l ON l."artistId" = a.id
        )
        UPDATE "Artist" a
        SET "monthlyListeners" = COALESCE(n.monthly, 0)
        FROM next n
        WHERE n.id = a.id AND a."monthlyListeners" IS DISTINCT FROM n.monthly
      `),
    ])
  }
}
