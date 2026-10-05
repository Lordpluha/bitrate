import type { ApiPaths, ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

/** See `WireArtistSortField` — read from the operation, not an entity field. */
export type WirePlaylistSortField = NonNullable<
  ApiPaths['/api/v1/admin/playlists']['get']['parameters']['query']
>['sort']

/** The `status` (take-down) query parameter's own union, read from the operation directly. */
export type WirePlaylistStatus = NonNullable<
  ApiPaths['/api/v1/admin/playlists']['get']['parameters']['query']
>['status']

type ContractPlaylist = Pick<
  ApiSchemas['AdminPlaylistEntity'],
  | 'id'
  | 'title'
  | 'cover'
  | 'ownerId'
  | 'ownerUsername'
  | 'isPublic'
  | 'followersCount'
  | 'trackCount'
  | 'deletedAt'
  | 'createdAt'
  | 'updatedAt'
>

/** The contract marks these fields optional-and-nullable, so absent and `null` both read as none. */
const playlistDto = z.object({
  id: z.uuid(),
  title: z.string(),
  cover: z.string().nullish(),
  ownerId: z.uuid(),
  ownerUsername: z.string(),
  isPublic: z.boolean(),
  followersCount: z.number().int(),
  trackCount: z.number().int(),
  deletedAt: z.iso.datetime().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractPlaylist>

export type PlaylistDto = z.infer<typeof playlistDto>

type ContractPlaylistPage = Omit<ApiSchemas['PaginatedAdminPlaylistsEntity'], 'data'> & {
  data: ContractPlaylist[]
}

export const playlistPageDto = z.object({
  data: z.array(playlistDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractPlaylistPage>

type ContractPlaylistTrack = ApiSchemas['AdminPlaylistTrackEntity']

const playlistTrackDto = z.object({
  id: z.uuid(),
  title: z.string(),
  position: z.number().int(),
}) satisfies z.ZodType<ContractPlaylistTrack>

type ContractPlaylistDetail = ContractPlaylist &
  Pick<ApiSchemas['AdminPlaylistDetailEntity'], 'description' | 'collaborative'> & {
    tracks: ContractPlaylistTrack[]
  }

export const playlistDetailDto = playlistDto.extend({
  description: z.string().nullish(),
  collaborative: z.boolean(),
  tracks: z.array(playlistTrackDto),
}) satisfies z.ZodType<ContractPlaylistDetail>

export type PlaylistDetailDto = z.infer<typeof playlistDetailDto>

type ContractSetVisibility = ApiSchemas['SetPlaylistVisibilityDto']

/** The PATCH body; `reason` is omitted when blank, like every other operator write. */
export const setPlaylistVisibilityBodyDto = z.object({
  isPublic: z.boolean(),
  reason: z.string().trim().min(1).max(500).optional(),
}) satisfies z.ZodType<ContractSetVisibility>
