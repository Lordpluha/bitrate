import { z } from 'zod'

const albumTrackResponseSchema = z.object({
  artistId: z.string(),
  audioUrl: z.string(),
  cover: z.string(),
  createdAt: z.string(),
  duration: z.number().nullable(),
  id: z.string(),
  lyrics: z.string().nullable(),
  processingAttempts: z.number(),
  processingError: z.string().nullable(),
  processingFinishedAt: z.string().nullable(),
  processingStartedAt: z.string().nullable(),
  processingStatus: z.enum(['PROCESSING', 'READY', 'FAILED']),
  releaseDate: z.string().nullable(),
  title: z.string(),
  updatedAt: z.string(),
})

export const albumResponseSchema = z.object({
  artistId: z.string(),
  cover: z.string(),
  createdAt: z.string(),
  description: z.string().nullable(),
  id: z.string(),
  releaseDate: z.string().nullable(),
  title: z.string(),
  tracks: z.array(albumTrackResponseSchema).optional(),
  updatedAt: z.string(),
})

export const albumsResponseSchema = z.array(albumResponseSchema)
