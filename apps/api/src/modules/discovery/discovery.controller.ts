import type { OptionalUserAuthRequest, UserAuthRequest } from '@modules/users-auth/types'
import { OptionalUserAuth, UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  GetArtistChartsSwagger,
  GetCategoriesSwagger,
  GetCategoryPlaylistsSwagger,
  GetChartsSwagger,
  GetFeedSwagger,
  GetRelatedArtistsSwagger,
  GetTopArtistsSwagger,
  GetTopTracksSwagger,
} from './decorators'
import { CHART_SCOPES, type ChartScope, DiscoveryService } from './discovery.service'

/** Validates a chart scope; `country` needs a country name. */
const chartScope = (scope: string, country: string | undefined): ChartScope => {
  const known = CHART_SCOPES.find((s) => s === scope)
  if (!known) throw new BadRequestException('Invalid chart scope')
  if (known === 'country' && !country) throw new BadRequestException('Country is required')
  return known
}

import { PersonalTopService, type TimeRange } from './personal-top.service'

@ApiTags('Discovery')
@Controller({ version: '1' })
export class DiscoveryController {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly personalTop: PersonalTopService,
  ) {}

  @GetCategoriesSwagger()
  @Get('browse/categories')
  categories(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.discovery.getCategories(page, limit)
  }

  @GetCategoryPlaylistsSwagger()
  @Get('browse/categories/:slug/playlists')
  categoryPlaylists(
    @Param('slug') slug: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.discovery.getCategoryPlaylists(slug, page, limit)
  }

  @GetFeedSwagger()
  @OptionalUserAuth()
  @Get('recommendations/feed')
  feed(@Req() req: OptionalUserAuthRequest) {
    return this.discovery.getFeed(req.user?.id)
  }

  @GetRelatedArtistsSwagger()
  @Get('recommendations/related-artists/:artistId')
  relatedArtists(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.discovery.getRelatedArtists(artistId, limit)
  }

  @GetChartsSwagger()
  @Get('charts/tracks')
  charts(
    @Query('scope') scope = 'global',
    @Query('country') country?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('genre') genre?: string,
  ) {
    return this.discovery.getCharts(chartScope(scope, country), country, page, limit, genre)
  }

  @GetArtistChartsSwagger()
  @Get('charts/artists')
  artistCharts(
    @Query('scope') scope = 'global',
    @Query('country') country?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.discovery.getArtistCharts(chartScope(scope, country), country, page, limit)
  }

  @GetTopTracksSwagger()
  @UserAuth()
  @Get('me/top/tracks')
  topTracks(
    @Req() req: UserAuthRequest,
    @Query('range') range = 'medium',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    this.validateRange(range)
    return this.personalTop.getTopTracks(req.user.id, range as TimeRange, page, limit)
  }

  @GetTopArtistsSwagger()
  @UserAuth()
  @Get('me/top/artists')
  topArtists(
    @Req() req: UserAuthRequest,
    @Query('range') range = 'medium',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    this.validateRange(range)
    return this.personalTop.getTopArtists(req.user.id, range as TimeRange, page, limit)
  }

  private validateRange(range: string) {
    if (!['short', 'medium', 'long'].includes(range))
      throw new BadRequestException('Invalid time range')
  }
}
