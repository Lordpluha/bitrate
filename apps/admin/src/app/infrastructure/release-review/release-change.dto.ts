import type { ApiSchemas } from '@bitrate/contracts/admin'
import * as z from 'zod'
import { contractEnum } from '../http/contract-union'

export type WireChangeField = ApiSchemas['ReleaseChangeField']
export type WireChangeStatus = ApiSchemas['ReleaseChangeStatus']
export type DecideReleaseChangesBody = ApiSchemas['DecideReleaseChangesDto']

const changeFieldDto = contractEnum<WireChangeField>()([
  'RELEASE_TITLE',
  'RELEASE_COVER',
  'RECORDING_TITLE',
])
const changeStatusDto = contractEnum<WireChangeStatus>()([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN',
  'CANCELLED',
])
const releaseStatusDto = contractEnum<ApiSchemas['ReleaseStatus']>()([
  'DRAFT',
  'READY',
  'SUBMITTED',
  'RELEASED',
  'REJECTED',
  'SCHEDULED',
  'PUBLISHING',
  'PUBLISH_FAILED',
  'UNPUBLISHED',
])
const unpublishedByDto = contractEnum<ApiSchemas['ReleaseUnpublishedBy']>()(['ARTIST', 'ADMIN'])

const changeRowDto = z.object({
  id: z.uuid(),
  releaseId: z.uuid(),
  releaseTitle: z.string(),
  releaseCover: z.string().nullable(),
  artistUsername: z.string(),
  changeCount: z.number().int(),
  pendingCount: z.number().int(),
  createdAt: z.iso.datetime({ offset: true }),
  closedAt: z.iso.datetime({ offset: true }).nullable(),
}) satisfies z.ZodType<ApiSchemas['AdminReleaseChangeRequestRowEntity']>

export type ChangeRowDto = z.infer<typeof changeRowDto>

type ContractChangePage = Omit<ApiSchemas['PaginatedAdminReleaseChangeRequestsEntity'], 'data'> & {
  data: ApiSchemas['AdminReleaseChangeRequestRowEntity'][]
}

export const changePageDto = z.object({
  data: z.array(changeRowDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractChangePage>

export const changeStatsDto = z.object({
  open: z.number().int(),
}) satisfies z.ZodType<ApiSchemas['AdminReleaseChangeStatsEntity']>

const changeDto = z.object({
  id: z.uuid(),
  requestId: z.uuid(),
  field: changeFieldDto,
  recordingId: z.uuid().nullable(),
  previousValue: z.string().nullable(),
  proposedValue: z.string().nullable(),
  status: changeStatusDto,
  reason: z.string().nullable(),
  decidedAt: z.iso.datetime({ offset: true }).nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  reviewerUsername: z.string().nullable(),
}) satisfies z.ZodType<ApiSchemas['AdminReleaseChangeEntity']>

export type ChangeDto = z.infer<typeof changeDto>

type ContractChangeRequest = Omit<ApiSchemas['AdminReleaseChangeRequestEntity'], 'changes'> & {
  changes: ApiSchemas['AdminReleaseChangeEntity'][]
}

export const changeRequestDto = z.object({
  id: z.uuid(),
  releaseId: z.uuid(),
  message: z.string().nullable(),
  closedAt: z.iso.datetime({ offset: true }).nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  release: z.object({
    id: z.uuid(),
    title: z.string(),
    cover: z.string().nullable(),
    status: releaseStatusDto,
    unpublishedBy: unpublishedByDto.nullable(),
    artistId: z.uuid(),
    artistUsername: z.string(),
  }),
  changes: z.array(changeDto),
}) satisfies z.ZodType<ContractChangeRequest>

export type ChangeRequestDto = z.infer<typeof changeRequestDto>
