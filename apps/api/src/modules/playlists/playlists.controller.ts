import { HttpCacheable } from '@common/interceptors/http-cacheable.decorator'
import { TrackEntity } from '@modules/tracks/entities'
import type { UserEntity } from '@modules/users/entities'
import { CurrentUser } from '@modules/users-auth/decorators/current-user.decorator'
import { OptionalUserAuth, UserAuth } from '@modules/users-auth/users-auth.guard'
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
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  AddTracksToPlaylistSwagger,
  CreatePlaylistSwagger,
  DeletePlaylistSwagger,
  GetLikedPlaylistsSwagger,
  GetMyPlaylistsSwagger,
  GetPlaylistByIdSwagger,
  GetPlaylistsSwagger,
  LikePlaylistSwagger,
  RemoveTrackFromPlaylistSwagger,
  UnlikePlaylistSwagger,
  UpdatePlaylistSwagger,
} from './decorators'
import { AddTracksDto, AddTracksSchema, type CreatePlaylistDto, CreatePlaylistSchema } from './dtos'
import { type UpdatePlaylistDto, UpdatePlaylistSchema } from './dtos/update-playlist.dto'
import { PlaylistEntity } from './entities'
import { PlaylistsService } from './playlists.service'

/** Represents the playlists controller. */
@ApiExtraModels(PlaylistEntity, TrackEntity)
@ApiTags('Playlists')
@Controller({ path: 'playlists', version: '1' })
export class PlaylistsController {
  constructor(private playlistService: PlaylistsService) {}

  /** Runs the get all operation. */
  @GetPlaylistsSwagger()
  @Throttle({ default: { ttl: 60_000, limit: 240 } })
  @HttpCacheable()
  @Get('')
  async getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('userId', new ParseUUIDPipe({ optional: true })) userId?: string,
  ) {
    return await this.playlistService.getAll({ limit, page, userId })
  }

  /** Runs the get mine operation. */
  @GetMyPlaylistsSwagger()
  @Throttle({ default: { ttl: 60_000, limit: 240 } })
  @UserAuth()
  @Get('me')
  async getMine(
    @CurrentUser() user: UserEntity,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.playlistService.getMine(user.id, { page, limit })
  }

  /** Runs the get by id operation. */
  /** Playlists the signed-in user liked. Declared before `:id` so `liked` is not parsed as an id. */
  @GetLikedPlaylistsSwagger()
  @UserAuth()
  @Get('liked')
  getLiked(
    @CurrentUser() user: UserEntity,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.playlistService.findLiked(user.id, { page, limit })
  }

  @GetPlaylistByIdSwagger()
  @Throttle({ default: { ttl: 60_000, limit: 240 } })
  @OptionalUserAuth()
  @HttpCacheable()
  @Get(':id')
  async getById(
    @CurrentUser() user: UserEntity | undefined,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
  ) {
    return await this.playlistService.getByIdPopulated(id, user?.id)
  }

  /** Runs the post operation. */
  @CreatePlaylistSwagger()
  @UserAuth()
  @Post('')
  async post(
    @CurrentUser() user: UserEntity,
    @Body(new ZodValidationPipe(CreatePlaylistSchema)) playlistDto: CreatePlaylistDto,
  ) {
    return await this.playlistService.create(user.id, playlistDto)
  }

  /** Runs the update operation. */
  @UpdatePlaylistSwagger()
  @UserAuth()
  @Put(':id')
  async update(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
    @Body(new ZodValidationPipe(UpdatePlaylistSchema)) updateDto: UpdatePlaylistDto,
  ) {
    return await this.playlistService.update(user.id, id, updateDto)
  }

  /** Runs the delete playlist operation. */
  @DeletePlaylistSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id')
  async deletePlaylist(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
  ) {
    return await this.playlistService.delete(user.id, id)
  }

  /** Runs the add tracks operation. */
  @AddTracksToPlaylistSwagger()
  @UserAuth()
  @Post(':id/tracks')
  async addTracks(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
    @Body(new ZodValidationPipe(AddTracksSchema)) dto: AddTracksDto,
  ) {
    return await this.playlistService.addTracks(user.id, id, dto)
  }

  /** Runs the remove track operation. */
  @RemoveTrackFromPlaylistSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/tracks/:trackId')
  async removeTrack(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
    @Param('trackId', ParseUUIDPipe) trackId: string,
  ) {
    return await this.playlistService.removeTrack(user.id, id, trackId)
  }

  /** Runs the like playlist operation. */
  @LikePlaylistSwagger()
  @UserAuth()
  @Post(':id/like')
  likePlaylist(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
  ) {
    return this.playlistService.like(user.id, id)
  }

  /** Runs the unlike playlist operation. */
  @UnlikePlaylistSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/like')
  unlikePlaylist(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
  ) {
    return this.playlistService.unlike(user.id, id)
  }
}
