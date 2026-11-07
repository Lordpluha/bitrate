import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import { Controller, Get, Header, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistAnalyticsService } from './artist-analytics.service'
import { ArtistAnalyticsSwagger } from './decorators'
import {
  type ArtistAnalyticsDto,
  ArtistAnalyticsSchema,
  type ArtistTopTracksDto,
  ArtistTopTracksSchema,
} from './dtos/artist-analytics.dto'
import { ArtistTopTracksEntity } from './entities/artist-analytics.entity'

@ApiTags('Releases')
@Controller({ path: 'artist-analytics', version: '1' })
export class ArtistAnalyticsController {
  constructor(private readonly analytics: ArtistAnalyticsService) {}

  @ApiOperation({
    summary: 'Paginated top tracks for the signed-in artist',
    description:
      'Tracks with plays in the selected UTC period, ordered by plays descending and track ID. Five per page; ranking and bar scale stay consistent across pages.',
  })
  @ApiQuery({ name: 'days', required: false, enum: [7, 28, 90] })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiResponse({ status: 200, type: ArtistTopTracksEntity })
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('top-tracks')
  topTracks(
    @CurrentArtist() artist: ArtistEntity,
    @Query(new ZodValidationPipe(ArtistTopTracksSchema)) query: ArtistTopTracksDto,
  ) {
    return this.analytics.topTracks(artist.id, query)
  }

  @ArtistAnalyticsSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  overview(
    @CurrentArtist() artist: ArtistEntity,
    @Query(new ZodValidationPipe(ArtistAnalyticsSchema)) query: ArtistAnalyticsDto,
  ) {
    return this.analytics.overview(artist.id, query)
  }
}
