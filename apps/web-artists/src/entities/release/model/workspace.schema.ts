import type { ApiSchemas } from '@bitrate/contracts'
import type { TranslationKey } from '@shared/i18n'
import { z } from 'zod'
import { releaseSummarySchema } from './release.schema'
import {
  FULL_SHARE_BASIS_POINTS,
  masterOwnerTypes,
  releaseBlockerSchema,
  releaseNoticeSchema,
  rightTypes,
} from './rights'

/** Catalog keys; render them with `t()`. */
export const participantRoleLabels = {
  PERFORMER: 'release.role.performer',
  PRODUCER: 'release.role.producer',
  COMPOSER: 'release.role.composer',
  LYRICIST: 'release.role.lyricist',
  OTHER: 'release.role.other',
} satisfies Record<ApiSchemas['ReleaseCreditRole'], TranslationKey>

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
          hasAudio: z.boolean(),
          audioFileName: z.string().nullable(),
          audioSizeBytes: z.number().int().nonnegative().nullable(),
          // Older API builds omit it; an empty waveform draws a flat placeholder.
          waveform: z.array(z.number().min(0).max(1)).max(400).default([]),
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
    /** Who took the release offline; only the artist's own takedown can be published again. */
    unpublishedBy: z.enum(['ARTIST', 'ADMIN']).nullable().default(null),
    /** The player album, once the release went live. */
    albumId: z.uuid().nullable().default(null),
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
    latestReview: z
      .object({
        decision: z.enum(['APPROVED', 'CHANGES_REQUESTED']),
        message: z.string().nullable(),
        requiredChanges: z.array(z.string()),
        recommendations: z.array(z.string()),
        createdAt: z.iso.datetime({ offset: true }),
      })
      .nullable(),
  })
  .refine(
    (value) =>
      value.trackCount >=
        Math.max(value.trackDrafts.length, value.tracks.length) &&
      value.participantCount >= value.participants.length,
  ) satisfies z.ZodType<ApiSchemas['ReleaseWorkspaceEntity']>

export type ReleaseWorkspace = z.infer<typeof releaseWorkspaceSchema>
