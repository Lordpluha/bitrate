import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

export const releaseTypes = [
  'SINGLE',
  'EP',
  'ALBUM',
  'COMPILATION',
] as const satisfies readonly ApiSchemas['ReleaseType'][]
export const releaseTypeLabels = {
  SINGLE: 'Single',
  EP: 'EP',
  ALBUM: 'Album',
  COMPILATION: 'Compilation',
} satisfies Record<ApiSchemas['ReleaseType'], string>
export const releaseStatusLabels = {
  DRAFT: 'Draft',
  READY: 'Ready',
  SUBMITTED: 'Submitted',
  RELEASED: 'Released',
  REJECTED: 'Rejected',
} satisfies Record<ApiSchemas['ReleaseStatus'], string>

export const createReleaseSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(1, 'Enter a release title')
    .max(255, 'Use 255 characters or fewer'),
  type: z.enum(releaseTypes),
}) satisfies z.ZodType<ApiSchemas['CreateReleaseDto']>

export type CreateReleaseValues = z.infer<typeof createReleaseSchema>
export type ReleaseSummary = ApiSchemas['ReleaseEntity']

export const releaseSummarySchema = z.object({
  id: z.uuid(),
  title: z.string(),
  type: z.enum(releaseTypes),
  status: z.enum(['DRAFT', 'READY', 'SUBMITTED', 'RELEASED', 'REJECTED']),
  upc: z.string().nullable(),
  scheduledAt: z.iso.datetime({ offset: true }).nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
}) satisfies z.ZodType<ReleaseSummary>
