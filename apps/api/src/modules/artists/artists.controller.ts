import { HttpCacheable } from '@common/interceptors/http-cacheable.decorator'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import type { UserEntity } from '@modules/users/entities'
import { CurrentUser } from '@modules/users-auth/decorators/current-user.decorator'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { ArtistsService } from './artists.service'
import {
  DeleteArtistSwagger,
  FollowArtistSwagger,
  GetArtistByIdSwagger,
  GetArtistByUsernameSwagger,
  GetArtistPlaylistsSwagger,
  GetArtistsSwagger,
  GetArtistTopTracksSwagger,
  UnfollowArtistSwagger,
} from './decorators'
import { ArtistEntity, SafeArtistEntity } from './entities'

/** Represents the artists controller. */
@ApiTags('Artists')
@ApiExtraModels(ArtistEntity, SafeArtistEntity)
@Controller({ path: 'artists', version: '1' })
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  /** Runs the get all operation. */
  @GetArtistsSwagger()
  @HttpCacheable()
  @Get('')
  async getAll(
    @Query('username') username?: ArtistEntity['username'],
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return await this.artistsService.findAll({
      limit,
      page,
      username,
    })
  }

  /** The artist's most played tracks. */
  @GetArtistTopTracksSwagger()
  @Get(':id/top-tracks')
  getTopTracks(
    @Param('id', ParseUUIDPipe) id: ArtistEntity['id'],
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.artistsService.findTopTracks(id, limit)
  }

  /** Public playlists featuring the artist. */
  @GetArtistPlaylistsSwagger()
  @Get(':id/playlists')
  getPlaylists(
    @Param('id', ParseUUIDPipe) id: ArtistEntity['id'],
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.artistsService.findPlaylists(id, page, limit)
  }

  /** Runs the get by id operation. */
  @GetArtistByIdSwagger()
  @HttpCacheable()
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    return await this.artistsService.findById(id)
  }

  /** Runs the get by username operation. */
  @GetArtistByUsernameSwagger()
  @HttpCacheable()
  @Get('username/:username')
  getByUsername(@Param('username') username: ArtistEntity['username']) {
    return this.artistsService.findByUsername(username)
  }

  /** Deletes the signed-in artist's account; the id comes only from the session (ADR-0070). */
  @DeleteArtistSwagger()
  @ArtistAuth()
  @Delete('me')
  deleteProfile(@CurrentArtist() artist: ArtistEntity) {
    return this.artistsService.requestDelete(artist.id)
  }

  /** Runs the follow operation. */
  @FollowArtistSwagger()
  @UserAuth()
  @Post(':id/follow')
  follow(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    return this.artistsService.follow(user.id, id)
  }

  /** Runs the unfollow operation. */
  @UnfollowArtistSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/follow')
  unfollow(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    return this.artistsService.unfollow(user.id, id)
  }
}
