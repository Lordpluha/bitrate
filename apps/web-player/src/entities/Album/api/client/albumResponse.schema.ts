import { z } from 'zod'
import { arrayOrPaginated } from '@/shared/api/paginated'

const albumTrackResponseSchema = z.object({
  artistId: z.string(),
  audioUrl: z.string(),
  cover: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
  discNumber: z.number(),
  duration: z.number().nullable(),
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

export const albumsResponseSchema = arrayOrPaginated(albumResponseSchema)

export type AlbumResponse = z.infer<typeof albumResponseSchema>
