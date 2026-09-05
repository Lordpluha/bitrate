import { z } from 'zod'
import { fallbackTrackCover } from '@/shared/constants'

export const trackResponseSchema = z.object({
  artistId: z.string(),
  audioUrl: z.string(),
  cover: z
    .string()
    .nullable()
    .transform((cover) => cover ?? fallbackTrackCover),
  createdAt: z.string(),
  duration: z.number().nullable(),
  deletedAt: z.string().nullable(),
  discNumber: z.number(),
  durationTicks: z.number().nullable(),
  explicit: z.boolean(),
  fragmentTimescale: z.number().nullable(),
  id: z.string(),
  isrc: z.string().nullable(),
  language: z.string().nullable(),
  lyrics: z.string().nullable(),
  playCount: z.number(),
  playbackVersion: z.number(),
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

export const tracksPaginatedResponseSchema = z.object({
  data: z.array(trackResponseSchema),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})
