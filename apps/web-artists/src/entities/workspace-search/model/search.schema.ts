import type { ApiSchemas } from '@bitrate/contracts'
import { releaseStatuses } from '@shared/constants/releaseStatuses'
import { z } from 'zod'

export const workspaceSearchSchema = z.object({
  releases: z
    .array(
      z.object({
        id: z.uuid(),
        title: z.string(),
        type: z.enum(['SINGLE', 'EP', 'ALBUM', 'COMPILATION']),
        status: z.enum(releaseStatuses),
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
  // The API still matches release tasks, which the workspace no longer shows.
}) satisfies z.ZodType<Omit<ApiSchemas['ArtistSearchEntity'], 'tasks'>>

/** The API needs two characters; shorter input searches only workspace sections. */
export const MIN_SEARCH_LENGTH = 2
