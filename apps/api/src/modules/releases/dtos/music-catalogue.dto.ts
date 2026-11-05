import { paginationQuerySchema } from '@common/pagination'
import { AlbumType, ArtistTrackStatus, ArtistTrackVersion, ReleaseStatus } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const catalogueQuery = paginationQuerySchema.extend({
  search: z.string().trim().max(100).optional(),
  sort: z.enum(['updated', 'title', 'oldest']).default('updated'),
})

export const MusicTracksSchema = z.strictObject({
  ...catalogueQuery.shape,
  status: z.enum(ArtistTrackStatus).optional(),
  type: z.enum(ArtistTrackVersion).optional(),
})
export const MusicReleasesSchema = z.strictObject({
  ...catalogueQuery.shape,
  status: z.enum(ReleaseStatus).optional(),
  type: z.enum(AlbumType).optional(),
})

export class MusicTracksDto extends createZodDto(MusicTracksSchema) {}
export class MusicReleasesDto extends createZodDto(MusicReleasesSchema) {}
