import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { releaseSummarySchema } from './release.schema'

export type ReleaseWorkspace = ApiSchemas['ReleaseWorkspaceEntity']
export const participantRoleLabels = {
  PERFORMER: 'Performer',
  PRODUCER: 'Producer',
  COMPOSER: 'Composer',
  LYRICIST: 'Lyricist',
  OTHER: 'Other',
} satisfies Record<ApiSchemas['ReleaseCreditRole'], string>

const duration = z.number().int().nonnegative().nullable()
export const releaseWorkspaceSchema = releaseSummarySchema
  .extend({
    artistName: z.string(),
    cover: z
      .string()
      .refine((value) => {
        if (value.startsWith('/') && !value.startsWith('//')) return true
        try {
          return ['https:', 'http:'].includes(new URL(value).protocol)
        } catch {
          return false
        }
      })
      .nullable(),
    isDemo: z.boolean(),
    trackCount: z.number().int().nonnegative(),
    participantCount: z.number().int().nonnegative(),
    trackDrafts: z
      .array(
        z.object({
          id: z.uuid(),
          title: z.string(),
          duration,
          isDemo: z.boolean(),
          version: z.enum(['ORIGINAL', 'REMASTER', 'LIVE', 'DEMO']),
          status: z.enum([
            'DRAFT',
            'PROCESSING',
            'READY',
            'NEEDS_CHANGES',
            'PUBLISHED',
            'UPLOAD_FAILED',
          ]),
        }),
      )
      .max(50),
    tracks: z
      .array(
        z.object({
          id: z.uuid(),
          title: z.string(),
          duration,
          position: z.number().int().positive(),
        }),
      )
      .max(50),
    participants: z
      .array(
        z.object({
          id: z.uuid(),
          displayName: z.string(),
          roles: z.array(
            z.enum(['PERFORMER', 'PRODUCER', 'COMPOSER', 'LYRICIST', 'OTHER']),
          ),
        }),
      )
      .max(50),
  })
  .refine(
    (value) =>
      value.trackCount >= value.trackDrafts.length + value.tracks.length &&
      value.participantCount >= value.participants.length,
  ) satisfies z.ZodType<ReleaseWorkspace>
