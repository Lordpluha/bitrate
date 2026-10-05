import { paginationQuerySchema } from '@common/pagination'
import { AlbumType, ArtistTrackStatus, ArtistTrackVersion, ReleaseStatus } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const catalogueQuery = paginationQuerySchema.extend({
  search: z.string().trim().max(100).optional(),
  sort: z.enum(['updated', 'title', 'oldest']).default('updated'),
})

export const MusicTracksSchema = catalogueQuery
  .extend({
    status: z.enum(ArtistTrackStatus).optional(),
    type: z.enum(ArtistTrackVersion).optional(),
  })
  .strict()
export const MusicReleasesSchema = catalogueQuery
  .extend({
    status: z.enum(ReleaseStatus).optional(),
    type: z.enum(AlbumType).optional(),
  })
  .strict()

export class MusicTracksDto extends createZodDto(MusicTracksSchema) {}
export class MusicReleasesDto extends createZodDto(MusicReleasesSchema) {}
