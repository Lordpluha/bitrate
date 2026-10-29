import type { ApiSchemas } from '@bitrate/contracts'
import { releaseStatuses } from '@shared/constants/releaseStatuses'
import { messageKey, type TranslationKey } from '@shared/i18n'
import { z } from 'zod'

export const releaseTypes = [
  'SINGLE',
  'EP',
  'ALBUM',
  'COMPILATION',
] as const satisfies readonly ApiSchemas['ReleaseType'][]
/** Catalog keys; render them with `t()`. */
export const releaseTypeLabels = {
  SINGLE: 'labels.releaseType.single',
  EP: 'labels.releaseType.ep',
  ALBUM: 'labels.releaseType.album',
  COMPILATION: 'labels.releaseType.compilation',
} satisfies Record<ApiSchemas['ReleaseType'], TranslationKey>
/** Catalog keys; render them with `t()`. */
export const releaseStatusLabels = {
  DRAFT: 'labels.releaseStatus.draft',
  READY: 'labels.releaseStatus.ready',
  SUBMITTED: 'labels.releaseStatus.submitted',
  RELEASED: 'labels.releaseStatus.released',
  REJECTED: 'labels.releaseStatus.rejected',
  SCHEDULED: 'labels.releaseStatus.scheduled',
  PUBLISHING: 'labels.releaseStatus.publishing',
  PUBLISH_FAILED: 'labels.releaseStatus.publishFailed',
  UNPUBLISHED: 'labels.releaseStatus.unpublished',
} satisfies Record<ApiSchemas['ReleaseStatus'], TranslationKey>

export const createReleaseSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(1, messageKey('music.fields.titleRequired'))
    .max(255, messageKey('music.fields.titleTooLong')),
  type: z.enum(releaseTypes),
}) satisfies z.ZodType<ApiSchemas['CreateReleaseDto']>

export type CreateReleaseValues = z.infer<typeof createReleaseSchema>
export type ReleaseSummary = ApiSchemas['ReleaseEntity']

export const releaseSummarySchema = z.object({
  id: z.uuid(),
  title: z.string(),
  type: z.enum(releaseTypes),
  status: z.enum(releaseStatuses),
  upc: z.string().nullable(),
  scheduledAt: z.iso.datetime({ offset: true }).nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
}) satisfies z.ZodType<ReleaseSummary>
