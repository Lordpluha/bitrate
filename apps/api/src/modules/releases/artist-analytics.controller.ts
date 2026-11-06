import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import { Controller, Get, Header, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistAnalyticsService } from './artist-analytics.service'
import { ArtistAnalyticsSwagger } from './decorators'
import { type ArtistAnalyticsDto, ArtistAnalyticsSchema } from './dtos/artist-analytics.dto'

@ApiTags('Releases')
@Controller({ path: 'artists/me/analytics', version: '1' })
export class ArtistAnalyticsController {
  constructor(private readonly analytics: ArtistAnalyticsService) {}

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
