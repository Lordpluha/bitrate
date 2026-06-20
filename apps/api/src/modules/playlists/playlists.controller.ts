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
  Req,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  CreatePlaylistSwagger,
  GetPlaylistByIdSwagger,
  GetPlaylistsSwagger,
  LikePlaylistSwagger,
  UnlikePlaylistSwagger,
  UpdatePlaylistSwagger,
} from './decorators'
import { type CreatePlaylistDto, CreatePlaylistSchema } from './dtos/create-playlist.dto'
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
  async getAll(@Param('page') page?: number, @Param('limit') limit?: number) {
    return await this.playlistService.getAll({
      limit,
      page,
    })
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
    @Body(new ZodValidationPipe(CreatePlaylistSchema))
    playlistDto: CreatePlaylistDto,
  ) {
    const user = req.user
    return await this.playlistService.create(user.id, playlistDto)
  }

  @UpdatePlaylistSwagger()
  @UserAuth()
  @Put(':id')
  async update(
    @Req() req: UserAuthRequest,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
    @Body(new ZodValidationPipe(UpdatePlaylistSchema))
    updateDto: UpdatePlaylistDto,
  ) {
    const user = req.user
    return await this.playlistService.update(user.id, id, updateDto)
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
