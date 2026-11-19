import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

/** Genres per recording the API accepts; more would dilute genre browse. */
export const MAX_RECORDING_GENRES = 3

export const genreOptionSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
}) satisfies z.ZodType<ApiSchemas['GenreOptionEntity']>

export type GenreOption = z.infer<typeof genreOptionSchema>
