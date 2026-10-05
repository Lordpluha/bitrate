import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { releaseSummarySchema } from './release.schema'
import {
  FULL_SHARE_BASIS_POINTS,
  masterOwnerTypes,
  releaseBlockerSchema,
  releaseNoticeSchema,
  rightTypes,
} from './rights'

export const participantRoleLabels = {
  PERFORMER: 'Performer',
  PRODUCER: 'Producer',
  COMPOSER: 'Composer',
  LYRICIST: 'Lyricist',
  OTHER: 'Other',
} satisfies Record<ApiSchemas['ReleaseCreditRole'], string>

const duration = z.number().int().nonnegative().nullable()
const isrc = z.string().nullable()
const instant = z.iso.datetime({ offset: true }).nullable()
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
          isrc,
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
          isrc,
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
    submittedAt: instant,
    rights: z.object({
      masterOwnerType: z.enum(masterOwnerTypes).nullable(),
      masterOwnerName: z.string().nullable(),
      writersConfirmedAt: instant,
      accuracyConfirmedAt: instant,
    }),
    splits: z
      .array(
        z.object({
          contributorId: z.uuid(),
          rightType: z.enum(rightTypes),
          shareBasisPoints: z
            .number()
            .int()
            .min(1)
            .max(FULL_SHARE_BASIS_POINTS),
        }),
      )
      .max(100),
    readiness: z.object({
      blockers: z.array(releaseBlockerSchema),
      notices: z.array(releaseNoticeSchema),
    }),
  })
  .refine(
    (value) =>
      value.trackCount >= value.trackDrafts.length + value.tracks.length &&
      value.participantCount >= value.participants.length,
  ) satisfies z.ZodType<ApiSchemas['ReleaseWorkspaceEntity']>

export type ReleaseWorkspace = z.infer<typeof releaseWorkspaceSchema>
