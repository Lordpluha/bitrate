import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from './contract-union'

export type TrackProcessingStatus = ApiSchemas['AdminTrackEntity']['processingStatus']

const processingStatusSchema = contractEnum<TrackProcessingStatus>()([
  'PROCESSING',
  'READY',
  'FAILED',
])

type ContractTrack = Pick<
  ApiSchemas['AdminTrackEntity'],
  | 'id'
  | 'title'
  | 'artistUsername'
  | 'processingStatus'
  | 'processingError'
  | 'processingAttempts'
  | 'processingStartedAt'
  | 'processingFinishedAt'
  | 'createdAt'
>

/** Not exported: consumers need the inferred type and the page envelope, not this. */
const adminTrackSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  artistUsername: z.string(),
  processingStatus: processingStatusSchema,
  processingError: z.string().nullable(),
  processingAttempts: z.number().int(),
  processingStartedAt: z.iso.datetime().nullable(),
  processingFinishedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractTrack>

export type AdminTrack = z.infer<typeof adminTrackSchema>

type ContractTrackPage = Omit<ApiSchemas['PaginatedAdminTracksEntity'], 'data'> & {
  data: ContractTrack[]
}

export const adminTrackPageSchema = z.object({
  data: z.array(adminTrackSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractTrackPage>
