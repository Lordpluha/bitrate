import { z } from 'zod'

export const trackResponseSchema = z.object({
  artistId: z.string(),
  audioUrl: z.string(),
  cover: z.string(),
  createdAt: z.string(),
  duration: z.number().nullable(),
  deletedAt: z.string().nullable(),
  discNumber: z.number(),
  explicit: z.boolean(),
  id: z.string(),
  isrc: z.string().nullable(),
  language: z.string().nullable(),
  lyrics: z.string().nullable(),
  playCount: z.number(),
  popularity: z.number(),
  previewUrl: z.string().nullable(),
  processingAttempts: z.number(),
  processingError: z.string().nullable(),
  processingFinishedAt: z.string().nullable(),
  processingStartedAt: z.string().nullable(),
  processingStatus: z.enum(['PROCESSING', 'READY', 'FAILED']),
  releaseDate: z.string().nullable(),
  title: z.string(),
  trackNumber: z.number().nullable(),
  updatedAt: z.string(),
})

export const tracksResponseSchema = z.union([
  z.array(trackResponseSchema),
  z
    .object({ data: z.array(trackResponseSchema) })
    .transform(({ data }) => data),
])
