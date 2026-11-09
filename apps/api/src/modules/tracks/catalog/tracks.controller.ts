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
import {
  GetTrackByIdSwagger,
  LikeTrackSwagger,
  TracksGetAllSwagger,
  TracksGetLikedSwagger,
  UnlikeTrackSwagger,
} from '../decorators'
import { TrackEntity } from '../entities'
import { TracksService } from './tracks.service'

/** Track catalogue and likes. Audio delivery lives in `TrackPlaybackController`. */
@ApiExtraModels(TrackEntity)
@ApiTags('Tracks')
@Controller({ path: 'tracks', version: '1' })
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @TracksGetAllSwagger()
  @Get('')
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('title') title?: TrackEntity['title'],
    @Query('artistId', new ParseUUIDPipe({ optional: true })) artistId?: string,
  ) {
    return this.tracksService.findAll({ artistId, limit, page, title })
  }

  @TracksGetLikedSwagger()
  @UserAuth()
  @Get('liked')
  getLikedTracks(
    @CurrentUser() user: UserEntity,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.tracksService.findLikedTracks(user.id, { page, limit })
  }

  @GetTrackByIdSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.findTrackById(id)
  }

  @LikeTrackSwagger()
  @UserAuth()
  @Post(':id/like')
  likeTrack(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.like(user.id, id)
  }

  @UnlikeTrackSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/like')
  unlikeTrack(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.unlike(user.id, id)
  }
}
