import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

export const workspaceSearchSchema = z.object({
  releases: z
    .array(
      z.object({
        id: z.uuid(),
        title: z.string(),
        type: z.enum(['SINGLE', 'EP', 'ALBUM', 'COMPILATION']),
        status: z.enum(['DRAFT', 'READY', 'SUBMITTED', 'RELEASED', 'REJECTED']),
      }),
    )
    .max(5),
  tracks: z
    .array(
      z.object({
        id: z.uuid(),
        title: z.string(),
        status: z.enum([
          'DRAFT',
          'PROCESSING',
          'READY',
          'NEEDS_CHANGES',
          'PUBLISHED',
          'UPLOAD_FAILED',
        ]),
        releaseId: z.uuid().nullable(),
      }),
    )
    .max(5),
  tasks: z
    .array(
      z.object({
        id: z.uuid(),
        title: z.string(),
        status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
        release: z.object({ id: z.uuid(), title: z.string() }),
      }),
    )
    .max(5),
}) satisfies z.ZodType<ApiSchemas['ArtistSearchEntity']>

/** The API needs two characters; shorter input searches only workspace sections. */
export const MIN_SEARCH_LENGTH = 2
