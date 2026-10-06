import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import * as z from 'zod'
import { contractEnum } from '../http/contract-union'

/** The unions as the API declares them. The domain declares its own; the mapper joins them. */
export type WireAlbumType = ApiSchemas['AdminAlbumEntity']['type']
export type WireAlbumTrackStatus = ApiSchemas['AdminAlbumTrackEntity']['processingStatus']

/** See `WireArtistSortField` — read from the operation, not an entity field. */
export type WireAlbumSortField = NonNullable<
  ApiPaths['/api/v1/admin/albums']['get']['parameters']['query']
>['sort']

/** The `status` (take-down) query parameter's own union, read from the operation directly. */
export type WireAlbumStatus = NonNullable<
  ApiPaths['/api/v1/admin/albums']['get']['parameters']['query']
>['status']

const albumTypeDto = contractEnum<WireAlbumType>()(['ALBUM', 'SINGLE', 'EP', 'COMPILATION'])
const albumTrackStatusDto = contractEnum<WireAlbumTrackStatus>()(['PROCESSING', 'READY', 'FAILED'])

type ContractAlbum = Pick<
  ApiSchemas['AdminAlbumEntity'],
  | 'id'
  | 'title'
  | 'cover'
  | 'artistId'
  | 'artistUsername'
  | 'type'
  | 'totalTracks'
  | 'releaseDate'
  | 'deletedAt'
  | 'createdAt'
  | 'updatedAt'
>

/** The contract marks these fields optional-and-nullable, so absent and `null` both read as none. */
const albumDto = z.object({
  id: z.uuid(),
  title: z.string(),
  cover: z.string().nullish(),
  artistId: z.uuid(),
  artistUsername: z.string(),
  type: albumTypeDto,
  totalTracks: z.number().int(),
  releaseDate: z.iso.datetime().nullish(),
  deletedAt: z.iso.datetime().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractAlbum>

export type AlbumDto = z.infer<typeof albumDto>

type ContractAlbumPage = Omit<ApiSchemas['PaginatedAdminAlbumsEntity'], 'data'> & {
  data: ContractAlbum[]
}

export const albumPageDto = z.object({
  data: z.array(albumDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractAlbumPage>

type ContractAlbumTrack = ApiSchemas['AdminAlbumTrackEntity']

const albumTrackDto = z.object({
  id: z.uuid(),
  title: z.string(),
  trackNumber: z.number().int(),
  discNumber: z.number().int(),
  processingStatus: albumTrackStatusDto,
  deletedAt: z.iso.datetime().nullish(),
}) satisfies z.ZodType<ContractAlbumTrack>

type ContractAlbumDetail = ContractAlbum &
  Pick<ApiSchemas['AdminAlbumDetailEntity'], 'description' | 'label' | 'copyright'> & {
    tracks: ContractAlbumTrack[]
  }

export const albumDetailDto = albumDto.extend({
  description: z.string().nullish(),
  label: z.string().nullish(),
  copyright: z.string().nullish(),
  tracks: z.array(albumTrackDto),
}) satisfies z.ZodType<ContractAlbumDetail>

export type AlbumDetailDto = z.infer<typeof albumDetailDto>
