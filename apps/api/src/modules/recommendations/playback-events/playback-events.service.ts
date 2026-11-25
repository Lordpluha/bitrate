import { readUserSettings } from '@common/user-settings'
import { PrismaService } from '@infra/prisma/prisma.service'
import { PUBLIC_TRACK_WHERE } from '@modules/tracks/orm'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { RECOMMENDATION_ERRORS } from '../errors'
import type { RecordPlaybackEventDto } from './dtos/record-playback-event.dto'
import { tasteWeight } from './taste-weight'

/** Raw events are kept this many calendar months; older ones are removed by the retention job. */
export const PLAYBACK_EVENT_RETENTION_MONTHS = 13

/** A client clock may run this far ahead of the server's before an event is refused. */
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000

/** A player queues events while offline; a report later than this is refused, not stored. */
const MAX_REPORT_DELAY_MS = 7 * 24 * 60 * 60 * 1000

/** Rows the retention job deletes per statement, so one run never holds a long lock. */
const RETENTION_BATCH_SIZE = 10_000

const MS_PER_SECOND = 1000

/** The result of {@link PlaybackEventsService.record}. */
export type PlaybackEventRecorded = {
  /** False during a private session: nothing was stored. */
  recorded: boolean
}

/**
 * Finished plays, the signal recommendations learn from (docs/specs/recommendations.md). Separate
 * from listening history: history records that a play started and feeds history, charts and
 * counts; an event records how the play went once it is over.
 */
@Injectable()
export class PlaybackEventsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Stores one finished play. Nothing is stored during a private session. A retried report of
   * the same play (same `clientPlayId`) is accepted and stored once.
   */
  async record(userId: string, input: RecordPlaybackEventDto): Promise<PlaybackEventRecorded> {
    const startedAt = new Date(input.startedAt)
    const endedAt = new Date(input.endedAt)
    const now = Date.now()
    if (
      endedAt.getTime() > now + MAX_CLOCK_SKEW_MS ||
      startedAt.getTime() < now - MAX_REPORT_DELAY_MS
    ) {
      throw new BadRequestException(RECOMMENDATION_ERRORS.EVENT_OUT_OF_RANGE)
    }

    const { privateSession } = await readUserSettings(this.prisma, userId)
    if (privateSession) return { recorded: false }

    const track = await this.prisma.track.findFirst({
      where: { id: input.trackId, ...PUBLIC_TRACK_WHERE },
      select: { duration: true },
    })
    if (!track) throw new NotFoundException(RECOMMENDATION_ERRORS.TRACK_NOT_FOUND)

    await this.prisma.playbackEvent.createMany({
      data: [
        {
          userId,
          trackId: input.trackId,
          clientPlayId: input.clientPlayId,
          startedAt,
          endedAt,
          listenedMs: input.listenedMs,
          durationMs: track.duration === null ? input.listenedMs : track.duration * MS_PER_SECOND,
          endReason: input.endReason,
          source: input.source,
          sourceId: input.sourceId ?? null,
          tasteWeight: tasteWeight({
            source: input.source,
            queuedByListener: input.queuedByListener ?? true,
          }),
        },
      ],
      skipDuplicates: true,
    })
    return { recorded: true }
  }

  /**
   * Deletes events older than {@link PLAYBACK_EVENT_RETENTION_MONTHS}, in batches, and returns
   * how many were removed. Idempotent: a duplicated or retried run finds nothing left to do.
   */
  async removeExpired(): Promise<number> {
    const cutoff = new Date(Date.now())
    cutoff.setUTCMonth(cutoff.getUTCMonth() - PLAYBACK_EVENT_RETENTION_MONTHS)

    let removed = 0
    for (;;) {
      const deleted = await this.prisma.executeRaw(Prisma.sql`
        DELETE FROM "PlaybackEvent"
        WHERE id IN (
          SELECT id FROM "PlaybackEvent"
          WHERE "endedAt" < ${cutoff}
          LIMIT ${RETENTION_BATCH_SIZE}
        )
      `)
      removed += deleted
      if (deleted < RETENTION_BATCH_SIZE) return removed
    }
  }
}
