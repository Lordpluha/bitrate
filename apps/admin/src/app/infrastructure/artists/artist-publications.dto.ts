import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'
import { contractEnum } from '../http/contract-union'

type ContractArtistTrack = ApiSchemas['AdminArtistTrackEntity']

type WireArtistTrackStatus = ContractArtistTrack['processingStatus']

const artistTrackStatusDto = contractEnum<WireArtistTrackStatus>()([
  'PROCESSING',
  'READY',
  'FAILED',
])

export const artistTrackDto = z.object({
  id: z.uuid(),
  title: z.string(),
  cover: z.string().nullable().optional(),
  processingStatus: artistTrackStatusDto,
  playCount: z.number().int(),
  deletedAt: z.iso.datetime().nullable().optional(),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractArtistTrack>

export type ArtistTrackDto = z.infer<typeof artistTrackDto>

type ContractArtistTrackPage = Omit<ApiSchemas['PaginatedAdminArtistTracksEntity'], 'data'> & {
  data: ContractArtistTrack[]
}

export const artistTrackPageDto = z.object({
  data: z.array(artistTrackDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractArtistTrackPage>

type ContractArtistAlbum = ApiSchemas['AdminArtistAlbumEntity']

type WireArtistAlbumType = ContractArtistAlbum['type']

const artistAlbumTypeDto = contractEnum<WireArtistAlbumType>()([
  'ALBUM',
  'SINGLE',
  'EP',
  'COMPILATION',
])

export const artistAlbumDto = z.object({
  id: z.uuid(),
  title: z.string(),
  cover: z.string().nullable().optional(),
  type: artistAlbumTypeDto,
  totalTracks: z.number().int(),
  releaseDate: z.iso.datetime().nullable().optional(),
  deletedAt: z.iso.datetime().nullable().optional(),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<ContractArtistAlbum>

export type ArtistAlbumDto = z.infer<typeof artistAlbumDto>

type ContractArtistAlbumPage = Omit<ApiSchemas['PaginatedAdminArtistAlbumsEntity'], 'data'> & {
  data: ContractArtistAlbum[]
}

export const artistAlbumPageDto = z.object({
  data: z.array(artistAlbumDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractArtistAlbumPage>
