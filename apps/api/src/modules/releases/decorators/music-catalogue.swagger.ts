import { MAX_LIMIT } from '@common/pagination'
import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { AlbumType, ArtistTrackStatus, ArtistTrackVersion, ReleaseStatus } from '@prisma/client'
import {
  MusicCountsEntity,
  MusicReleaseEntity,
  MusicTrackEntity,
} from '../entities/music-catalogue.entity'

export function MusicCatalogueSwagger(tab: 'tracks' | 'releases') {
  return applyDecorators(
    ApiOperation({ summary: `List the authenticated artist’s private Music ${tab}` }),
    ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1 } }),
    ApiQuery({
      name: 'limit',
      required: false,
      schema: { type: 'integer', minimum: 1, maximum: MAX_LIMIT },
    }),
    ApiQuery({ name: 'search', required: false, schema: { type: 'string', maxLength: 100 } }),
    ApiQuery({ name: 'sort', required: false, enum: ['updated', 'title', 'oldest'] }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: tab === 'tracks' ? ArtistTrackStatus : ReleaseStatus,
    }),
    ApiQuery({
      name: 'type',
      required: false,
      enum: tab === 'tracks' ? ArtistTrackVersion : AlbumType,
    }),
    ApiResponse({
      status: 200,
      schema: paginatedResponseSchema(tab === 'tracks' ? MusicTrackEntity : MusicReleaseEntity),
    }),
    ApiResponse({ status: 400, description: 'Invalid catalogue filters' }),
  )
}

export function MusicCountsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Count owned active Music tracks and releases' }),
    ApiResponse({ status: 200, type: MusicCountsEntity }),
  )
}
