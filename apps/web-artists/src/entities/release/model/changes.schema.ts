import type { ApiSchemas } from '@bitrate/contracts'
import type { TranslationKey } from '@shared/i18n'
import { z } from 'zod'

export type ReleaseChangeField = ApiSchemas['ReleaseChangeField']
export type ReleaseChangeStatus = ApiSchemas['ReleaseChangeStatus']

const changeFields = [
  'RELEASE_TITLE',
  'RELEASE_COVER',
  'RECORDING_TITLE',
] as const satisfies readonly ReleaseChangeField[]

const changeStatuses = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN',
  'CANCELLED',
] as const satisfies readonly ReleaseChangeStatus[]

const timestamp = z.iso.datetime({ offset: true })

const releaseChangeSchema = z.object({
  id: z.uuid(),
  requestId: z.uuid(),
  field: z.enum(changeFields),
  recordingId: z.uuid().nullable(),
  previousValue: z.string().nullable(),
  /** A title, a cover link (signed while pending) or null once a cover file is gone. */
  proposedValue: z.string().nullable(),
  status: z.enum(changeStatuses),
  reason: z.string().nullable(),
  decidedAt: timestamp.nullable(),
  createdAt: timestamp,
}) satisfies z.ZodType<ApiSchemas['ReleaseChangeEntity']>

export const artistReleaseChangeListSchema = z.object({
  data: z.array(
    releaseChangeSchema.extend({ reviewerMessage: z.string().nullable() }),
  ),
}) satisfies z.ZodType<ApiSchemas['ArtistReleaseChangeListEntity']>

export const releaseChangeRequestSchema = z.object({
  id: z.uuid(),
  releaseId: z.uuid(),
  message: z.string().nullable(),
  closedAt: timestamp.nullable(),
  createdAt: timestamp,
  changes: z.array(releaseChangeSchema).min(1),
}) satisfies z.ZodType<ApiSchemas['ReleaseChangeRequestEntity']>

export type ArtistReleaseChange = z.infer<
  typeof artistReleaseChangeListSchema
>['data'][number]

export const releaseChangeFieldLabels = {
  RELEASE_TITLE: 'releaseChanges.field.RELEASE_TITLE',
  RELEASE_COVER: 'releaseChanges.field.RELEASE_COVER',
  RECORDING_TITLE: 'releaseChanges.field.RECORDING_TITLE',
} as const satisfies Record<ReleaseChangeField, TranslationKey>

export const releaseChangeStatusLabels = {
  PENDING: 'releaseChanges.status.PENDING',
  APPROVED: 'releaseChanges.status.APPROVED',
  REJECTED: 'releaseChanges.status.REJECTED',
  WITHDRAWN: 'releaseChanges.status.WITHDRAWN',
  CANCELLED: 'releaseChanges.status.CANCELLED',
} as const satisfies Record<ReleaseChangeStatus, TranslationKey>
