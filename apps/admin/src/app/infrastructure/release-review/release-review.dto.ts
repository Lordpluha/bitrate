import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import * as z from 'zod'
import { contractEnum } from '../http/contract-union'

/** The unions as the API declares them. The domain declares its own; the mapper joins them. */
export type WireReleaseType = ApiSchemas['AdminReleaseEntity']['type']
export type WireReleaseStatus = ApiSchemas['AdminReleaseEntity']['status']
export type WireReviewDecision = ApiSchemas['AdminReleaseReviewEntity']['decision']

/** The queue's `status` query parameter, read from the operation directly. */
export type WireQueueStatus = NonNullable<
  NonNullable<ApiPaths['/api/v1/admin/releases']['get']['parameters']['query']>['status']
>

export type ApproveReleaseBody = ApiSchemas['ApproveReleaseDto']
export type RequestReleaseChangesBody = ApiSchemas['RequestReleaseChangesDto']

const releaseTypeDto = contractEnum<WireReleaseType>()(['ALBUM', 'SINGLE', 'EP', 'COMPILATION'])
const releaseStatusDto = contractEnum<WireReleaseStatus>()([
  'DRAFT',
  'SUBMITTED',
  'READY',
  'REJECTED',
  'RELEASED',
])
const decisionDto = contractEnum<WireReviewDecision>()(['APPROVED', 'CHANGES_REQUESTED'])
const creditRoleDto = contractEnum<ApiSchemas['ReleaseCreditRole']>()([
  'PERFORMER',
  'PRODUCER',
  'COMPOSER',
  'LYRICIST',
  'OTHER',
])
const rightTypeDto = contractEnum<ApiSchemas['ReleaseRightType']>()(['RECORDING', 'COMPOSITION'])
const masterOwnerDto = contractEnum<ApiSchemas['ReleaseMasterOwner']>()(['ARTIST', 'OTHER'])
const destinationDto = contractEnum<ApiSchemas['DeliveryDestination']>()([
  'SPOTIFY',
  'APPLE_MUSIC',
  'YOUTUBE_MUSIC',
  'AMAZON_MUSIC',
  'DEEZER',
  'TIDAL',
])
const blockerCodeDto = contractEnum<ApiSchemas['ReleaseBlockerCode']>()([
  'NO_TRACKS',
  'COVER_MISSING',
  'TRACK_AUDIO_MISSING',
  'MASTER_OWNER_MISSING',
  'WRITERS_NOT_CONFIRMED',
  'ACCURACY_NOT_CONFIRMED',
  'CONTRIBUTOR_ROLES_MISSING',
  'SPLITS_INCOMPLETE',
])
const noticeCodeDto = contractEnum<ApiSchemas['ReleaseNoticeCode']>()([
  'UPC_MISSING',
  'ISRC_MISSING',
])

const releaseRowDto = z.object({
  id: z.uuid(),
  title: z.string(),
  type: releaseTypeDto,
  status: releaseStatusDto,
  cover: z.string().nullable(),
  submittedAt: z.iso.datetime({ offset: true }).nullable(),
  updatedAt: z.iso.datetime({ offset: true }),
  artistId: z.uuid(),
  artistUsername: z.string(),
  trackCount: z.number().int(),
}) satisfies z.ZodType<ApiSchemas['AdminReleaseEntity']>

export type ReleaseRowDto = z.infer<typeof releaseRowDto>

type ContractReleasePage = Omit<ApiSchemas['PaginatedAdminReleasesEntity'], 'data'> & {
  data: ApiSchemas['AdminReleaseEntity'][]
}

export const releasePageDto = z.object({
  data: z.array(releaseRowDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractReleasePage>

const releaseReviewDto = z.object({
  id: z.uuid(),
  decision: decisionDto,
  message: z.string().nullable(),
  requiredChanges: z.array(z.string()),
  recommendations: z.array(z.string()),
  createdAt: z.iso.datetime({ offset: true }),
  reviewerUsername: z.string().nullable(),
}) satisfies z.ZodType<ApiSchemas['AdminReleaseReviewEntity']>

export type ReleaseReviewDto = z.infer<typeof releaseReviewDto>

/** Only the codes are read; the ids beside them name rows the detail already lists. */
type ContractReadiness = {
  blockers: Pick<ApiSchemas['ReleaseBlockerEntity'], 'code'>[]
  notices: Pick<ApiSchemas['ReleaseNoticeEntity'], 'code'>[]
}

type ContractReleaseDetail = Omit<ApiSchemas['AdminReleaseDetailEntity'], 'readiness'> & {
  readiness: ContractReadiness
}

export const releaseDetailDto = releaseRowDto.extend({
  upc: z.string().nullable(),
  scheduledAt: z.iso.datetime({ offset: true }).nullable(),
  rights: z.object({
    masterOwnerType: masterOwnerDto.nullable(),
    masterOwnerName: z.string().nullable(),
    writersConfirmedAt: z.iso.datetime({ offset: true }).nullable(),
    accuracyConfirmedAt: z.iso.datetime({ offset: true }).nullable(),
  }),
  tracks: z.array(
    z.object({
      id: z.uuid(),
      title: z.string(),
      duration: z.number().int().nullable(),
      isrc: z.string().nullable(),
      audioFileName: z.string().nullable(),
      hasAudio: z.boolean(),
    }),
  ),
  contributors: z.array(
    z.object({ id: z.uuid(), displayName: z.string(), roles: z.array(creditRoleDto) }),
  ),
  splits: z.array(
    z.object({
      contributorId: z.uuid(),
      rightType: rightTypeDto,
      shareBasisPoints: z.number().int(),
    }),
  ),
  territories: z.array(z.string()),
  destinations: z.array(destinationDto),
  readiness: z.object({
    blockers: z.array(z.object({ code: blockerCodeDto })),
    notices: z.array(z.object({ code: noticeCodeDto })),
  }),
  reviews: z.array(releaseReviewDto),
}) satisfies z.ZodType<ContractReleaseDetail>

export type ReleaseDetailDto = z.infer<typeof releaseDetailDto>

export const releaseDecisionDto = z.object({
  release: z.object({
    id: z.uuid(),
    status: releaseStatusDto,
    updatedAt: z.iso.datetime({ offset: true }),
  }),
  review: releaseReviewDto,
}) satisfies z.ZodType<ApiSchemas['AdminReleaseDecisionEntity']>
