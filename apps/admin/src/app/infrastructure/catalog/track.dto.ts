import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from '../http/contract-union'

/** The union as the API declares it. The domain declares its own; the mapper joins them. */
export type WireProcessingStatus = ApiSchemas['AdminTrackEntity']['processingStatus']

/** See `WireArtistSortField` — read from the operation, not an entity field. */
export type WireTrackSortField = NonNullable<
  ApiPaths['/api/v1/admin/tracks']['get']['parameters']['query']
>['sort']

/** The `status` (take-down) query parameter's own union, read from the operation directly. */
export type WireTrackStatus = NonNullable<
  ApiPaths['/api/v1/admin/tracks']['get']['parameters']['query']
>['status']

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
  | 'deletedAt'
  | 'updatedAt'
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
  deletedAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime(),
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

type ContractTrackAudioFile = ApiSchemas['AdminTrackFileEntity']

const trackAudioFileDto = z.object({
  id: z.uuid(),
  format: z.string(),
  bitrate: z.number().int(),
  codec: z.string().nullable(),
  size: z.number().int().nullable(),
}) satisfies z.ZodType<ContractTrackAudioFile>

type ContractTrackArtistCredit = ApiSchemas['AdminTrackArtistCreditEntity']

const trackArtistCreditDto = z.object({
  artistId: z.uuid(),
  username: z.string(),
  isPrimary: z.boolean(),
  position: z.number().int(),
}) satisfies z.ZodType<ContractTrackArtistCredit>

type ContractTrackGenre = ApiSchemas['AdminTrackGenreEntity']

const trackGenreDto = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
}) satisfies z.ZodType<ContractTrackGenre>

type ContractTrackAlbum = ApiSchemas['AdminTrackAlbumEntity']

const trackAlbumDto = z.object({
  id: z.uuid(),
  title: z.string(),
  trackNumber: z.number().int(),
  discNumber: z.number().int(),
}) satisfies z.ZodType<ContractTrackAlbum>

type ContractTrackDetail = Pick<
  ApiSchemas['AdminTrackDetailEntity'],
  | 'id'
  | 'title'
  | 'artistId'
  | 'artistUsername'
  | 'processingStatus'
  | 'processingError'
  | 'processingAttempts'
  | 'processingStartedAt'
  | 'processingFinishedAt'
  | 'deletedAt'
  | 'updatedAt'
  | 'createdAt'
  | 'audioFiles'
  | 'artists'
  | 'genres'
  | 'albums'
  | 'openReportCount'
>

export const trackDetailDto = z.object({
  id: z.uuid(),
  title: z.string(),
  artistId: z.uuid(),
  artistUsername: z.string(),
  processingStatus: processingStatusDto,
  processingError: z.string().nullable(),
  processingAttempts: z.number().int(),
  processingStartedAt: z.iso.datetime().nullable(),
  processingFinishedAt: z.iso.datetime().nullable(),
  deletedAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  audioFiles: z.array(trackAudioFileDto),
  artists: z.array(trackArtistCreditDto),
  genres: z.array(trackGenreDto),
  albums: z.array(trackAlbumDto),
  openReportCount: z.number().int(),
}) satisfies z.ZodType<ContractTrackDetail>

export type TrackDetailDto = z.infer<typeof trackDetailDto>
