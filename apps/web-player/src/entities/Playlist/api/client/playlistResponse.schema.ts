import { z } from 'zod'
import { arrayOrPaginated } from '@/shared/api/paginated'
import { fallbackTrackCover } from '@/shared/constants'

const playlistTrackResponseSchema = z.object({
  artistId: z.string(),
  audioUrl: z.string(),
  cover: z
    .string()
    .nullable()
    .transform((cover) => cover ?? fallbackTrackCover),
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

const playlistUserResponseSchema = z.object({
  avatar: z.string().nullable().optional(),
  id: z.string(),
  username: z.string(),
})

export const playlistResponseSchema = z.object({
  cover: z.string().nullable(),
  createdAt: z.string(),
  description: z.string().nullable(),
  id: z.string(),
  isPublic: z.boolean(),
  title: z.string(),
  updatedAt: z.string(),
  userId: z.string(),
})

export const playlistWithRelationsResponseSchema =
  playlistResponseSchema.extend({
    tracks: z.array(playlistTrackResponseSchema).default([]),
    user: playlistUserResponseSchema.optional(),
  })

export const playlistsResponseSchema = arrayOrPaginated(
  playlistWithRelationsResponseSchema,
)

export const normalizePlaylistsResponse = (data: unknown) =>
  playlistsResponseSchema.parse(data)

const libraryPlaylistTrackResponseSchema = z.object({
  cover: z.string().nullable(),
  id: z.string(),
  title: z.string(),
})

export const libraryPlaylistsResponseSchema = arrayOrPaginated(
  playlistResponseSchema.extend({
    _count: z.object({
      tracks: z.number(),
    }),
    tracks: z.array(libraryPlaylistTrackResponseSchema).default([]),
  }),
)
