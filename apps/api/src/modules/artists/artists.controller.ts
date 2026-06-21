import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistsService } from './artists.service'
import {
  DeleteArtistSwagger,
  FollowArtistSwagger,
  GetArtistByIdSwagger,
  GetArtistByUsernameSwagger,
  GetArtistsSwagger,
  GetFollowingSwagger,
  UnfollowArtistSwagger,
  UpdateArtistSwagger,
} from './decorators'
import type { UpdateArtistDto } from './dtos'
import { UpdateArtistSchema } from './dtos'
import { ArtistEntity, SafeArtistEntity } from './entities'

@ApiTags('Artists')
@ApiExtraModels(ArtistEntity, SafeArtistEntity)
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @GetArtistsSwagger()
  @Get('')
  async getAll(
    @Query('username') username?: ArtistEntity['username'],
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return await this.artistsService.findAll({
      limit,
      page,
      username,
    })
  }

  @GetArtistByIdSwagger()
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    return await this.artistsService.findById(id)
  }

  @GetArtistByUsernameSwagger()
  @Get('username/:username')
  getByUsername(@Param('username') username: ArtistEntity['username']) {
    return this.artistsService.findByUsername(username)
  }

  @UpdateArtistSwagger()
  @ArtistAuth()
  @Put(':id')
  updateProfile(
    @Req() req: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: ArtistEntity['id'],
    @Body(new ZodValidationPipe(UpdateArtistSchema)) artist: UpdateArtistDto,
  ) {
    const artistId = req.artist.id
    return this.artistsService.update(id, artist, artistId)
  }

  @DeleteArtistSwagger()
  @ArtistAuth()
  @Delete(':id')
  deleteProfile(@Req() req: ArtistAuthRequest, @Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    const artistId = req.artist.id
    return this.artistsService.requestDelete(id, artistId)
  }

  @GetFollowingSwagger()
  @UserAuth()
  @Get('me/following')
  getFollowing(
    @Req() req: UserAuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.artistsService.getFollowing(req.user.id, page, limit)
  }

  @FollowArtistSwagger()
  @UserAuth()
  @Post(':id/follow')
  follow(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    return this.artistsService.follow(req.user.id, id)
  }

  @UnfollowArtistSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/follow')
  unfollow(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    return this.artistsService.unfollow(req.user.id, id)
  }
}
