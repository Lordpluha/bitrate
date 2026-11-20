import { PlaybackEndReason, PlaybackSource } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { RECOMMENDATION_VALIDATION } from '../errors'

/** Longer than any track plus replays within one play; anything above is a broken client. */
export const MAX_LISTENED_MS = 6 * 60 * 60 * 1000

export const RecordPlaybackEventSchema = z
  .strictObject({
    clientPlayId: z
      .uuid()
      .describe('The player’s id for this play; a retried report with the same id is stored once'),
    trackId: z.uuid().describe('The track that was played'),
    startedAt: z.iso.datetime({ offset: true }).describe('When the play started'),
    endedAt: z.iso.datetime({ offset: true }).describe('When the play ended'),
    listenedMs: z
      .int()
      .min(0)
      .max(MAX_LISTENED_MS)
      .describe('Audio actually heard, in milliseconds; seeking past audio does not count'),
    endReason: z.enum(PlaybackEndReason).describe('How the play ended'),
    source: z.enum(PlaybackSource).describe('Where the play was started from'),
    sourceId: z
      .uuid()
      .optional()
      .describe('The playlist, album or artist the play started from, when the source has one'),
    queuedByListener: z
      .boolean()
      .optional()
      .describe('Jam only: false when another participant queued the track. Defaults to true.'),
  })
  .refine((input) => Date.parse(input.endedAt) >= Date.parse(input.startedAt), {
    error: RECOMMENDATION_VALIDATION.ENDED_BEFORE_START,
    path: ['endedAt'],
  })

export class RecordPlaybackEventDto extends createZodDto(RecordPlaybackEventSchema) {}
