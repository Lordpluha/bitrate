import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import { Controller, Get, Header, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistAnalyticsService } from './artist-analytics.service'
import { ArtistAnalyticsSwagger } from './decorators'
import { type ArtistAnalyticsDto, ArtistAnalyticsSchema } from './dtos/artist-analytics.dto'

@ApiTags('Releases')
@Controller({ path: 'artist-analytics', version: '1' })
export class ArtistAnalyticsController {
  constructor(private readonly analytics: ArtistAnalyticsService) {}

  @ArtistAnalyticsSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  overview(
    @Req() request: ArtistAuthRequest,
    @Query(new ZodValidationPipe(ArtistAnalyticsSchema)) query: ArtistAnalyticsDto,
  ) {
    return this.analytics.overview(request.artist.id, query)
  }
}
