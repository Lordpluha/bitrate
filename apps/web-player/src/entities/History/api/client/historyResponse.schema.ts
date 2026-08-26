import { z } from 'zod'
import { arrayOrPaginated } from '@/shared/api/paginated'
import { fallbackTrackCover } from '@/shared/constants'

const historyArtistResponseSchema = z.object({
  avatar: z.string().nullable(),
  id: z.string(),
  username: z.string(),
})

const historyTrackResponseSchema = z.object({
  artist: historyArtistResponseSchema.optional(),
  artistId: z.string(),
  cover: z
    .string()
    .nullable()
    .transform((cover) => cover ?? fallbackTrackCover),
  duration: z.number().nullable(),
  id: z.string(),
  title: z.string(),
})

export const listeningHistoryEntrySchema = z.object({
  id: z.string(),
  listenedAt: z.string(),
  track: historyTrackResponseSchema,
  trackId: z.string(),
})

export const listeningHistoryResponseSchema = arrayOrPaginated(
  listeningHistoryEntrySchema,
)

export type ListeningHistoryEntry = z.infer<typeof listeningHistoryEntrySchema>
