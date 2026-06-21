import { TrackEntity } from '@modules/tracks/entities'
import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  AddTracksToPlaylistSwagger,
  CreatePlaylistSwagger,
  DeletePlaylistSwagger,
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

@ApiExtraModels(PlaylistEntity, TrackEntity)
@ApiTags('Playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistService: PlaylistsService) {}

  @GetPlaylistsSwagger()
  @Get('')
  async getAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return await this.playlistService.getAll({ limit, page })
  }

  @GetMyPlaylistsSwagger()
  @UserAuth()
  @Get('me')
  async getMine(@Req() req: UserAuthRequest) {
    return await this.playlistService.getMine(req.user.id)
  }

  @GetPlaylistByIdSwagger()
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: PlaylistEntity['id']) {
    return await this.playlistService.getByIdPopulated(id)
  }

  @CreatePlaylistSwagger()
  @UserAuth()
  @Post('')
  async post(
    @Req() req: UserAuthRequest,
    @Body(new ZodValidationPipe(CreatePlaylistSchema)) playlistDto: CreatePlaylistDto,
  ) {
    return await this.playlistService.create(req.user.id, playlistDto)
  }

  @UpdatePlaylistSwagger()
  @UserAuth()
  @Put(':id')
  async update(
    @Req() req: UserAuthRequest,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
    @Body(new ZodValidationPipe(UpdatePlaylistSchema)) updateDto: UpdatePlaylistDto,
  ) {
    return await this.playlistService.update(req.user.id, id, updateDto)
  }

  @DeletePlaylistSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id')
  async deletePlaylist(
    @Req() req: UserAuthRequest,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
  ) {
    return await this.playlistService.delete(req.user.id, id)
  }

  @AddTracksToPlaylistSwagger()
  @UserAuth()
  @Post(':id/tracks')
  async addTracks(
    @Req() req: UserAuthRequest,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
    @Body(new ZodValidationPipe(AddTracksSchema)) dto: AddTracksDto,
  ) {
    return await this.playlistService.addTracks(req.user.id, id, dto)
  }

  @RemoveTrackFromPlaylistSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/tracks/:trackId')
  async removeTrack(
    @Req() req: UserAuthRequest,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
    @Param('trackId', ParseUUIDPipe) trackId: string,
  ) {
    return await this.playlistService.removeTrack(req.user.id, id, trackId)
  }

  @LikePlaylistSwagger()
  @UserAuth()
  @Post(':id/like')
  likePlaylist(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: PlaylistEntity['id']) {
    return this.playlistService.like(req.user.id, id)
  }

  @UnlikePlaylistSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/like')
  unlikePlaylist(
    @Req() req: UserAuthRequest,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
  ) {
    return this.playlistService.unlike(req.user.id, id)
  }
}
