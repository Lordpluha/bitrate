import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import { Controller, Get, ParseIntPipe, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ArtistsService } from './artists.service'
import { GetFollowingSwagger } from './decorators'

/**
 * The listener's followed artists. It sits beside `/users/me/following` (people) rather than
 * under `/artists/me`, which belongs to the signed-in artist (ADR-0070). The artists module
 * owns the data, so the route lives here instead of making users depend on artists.
 */
@ApiTags('Artists')
@Controller({ path: 'users/me/following/artists', version: '1' })
export class FollowedArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  /** Artists the signed-in listener follows. */
  @GetFollowingSwagger()
  @UserAuth()
  @Get()
  list(
    @Req() req: UserAuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.artistsService.getFollowing(req.user.id, page, limit)
  }
}
