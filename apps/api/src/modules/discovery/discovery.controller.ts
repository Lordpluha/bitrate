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
import { DiscoveryService } from './discovery.service'
import { PersonalTopService, type TimeRange } from './personal-top.service'

@ApiTags('Discovery')
@Controller({ version: '1' })
export class DiscoveryController {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly personalTop: PersonalTopService,
  ) {}

  @Get('browse/categories')
  categories(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.discovery.getCategories(page, limit)
  }

  @Get('browse/categories/:slug/playlists')
  categoryPlaylists(
    @Param('slug') slug: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.discovery.getCategoryPlaylists(slug, page, limit)
  }

  @OptionalUserAuth()
  @Get('recommendations/feed')
  feed(@Req() req: OptionalUserAuthRequest) {
    return this.discovery.getFeed(req.user?.id)
  }

  @Get('recommendations/related-artists/:artistId')
  relatedArtists(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.discovery.getRelatedArtists(artistId, limit)
  }

  @Get('charts/tracks')
  charts(
    @Query('scope') scope = 'global',
    @Query('country') country?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    if (!['global', 'viral', 'country'].includes(scope))
      throw new BadRequestException('Invalid chart scope')
    if (scope === 'country' && !country) throw new BadRequestException('Country is required')
    return this.discovery.getCharts(scope as 'global' | 'viral' | 'country', country, page, limit)
  }

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
