import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from '../http/contract-union'

/** The union as the API declares it. The domain declares its own; the mapper joins them. */
export type WireProcessingStatus = ApiSchemas['AdminTrackEntity']['processingStatus']

const processingStatusDto = contractEnum<WireProcessingStatus>()(['PROCESSING', 'READY', 'FAILED'])

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

const trackDto = z.object({
  id: z.uuid(),
  title: z.string(),
  artistUsername: z.string(),
  processingStatus: processingStatusDto,
  processingError: z.string().nullable(),
  processingAttempts: z.number().int(),
  processingStartedAt: z.iso.datetime().nullable(),
  processingFinishedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractTrack>

export type TrackDto = z.infer<typeof trackDto>

type ContractTrackPage = Omit<ApiSchemas['PaginatedAdminTracksEntity'], 'data'> & {
  data: ContractTrack[]
}

export const trackPageDto = z.object({
  data: z.array(trackDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractTrackPage>
