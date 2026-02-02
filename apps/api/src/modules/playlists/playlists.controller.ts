import { UserEntity } from '@modules/users'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { GetPlaylistsSwagger } from './decorators/get-playlists.decorator'
import { CreatePlaylistDto, CreatePlaylistSchema } from './dtos/create-playlist.dto'
import { UpdatePlaylistDto, UpdatePlaylistSchema } from './dtos/update-playlist.dto'
import { PlaylistEntity } from './entities'
import { PlaylistsService } from './playlists.service'

@ApiExtraModels(PlaylistEntity)
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

  @ApiOperation({ summary: 'Get playlist by id' })
  @ApiParam({ name: 'id', description: 'Playlist ID' })
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: PlaylistEntity['id']) {
    return await this.playlistService.getByIdPopulated(id)
  }

  @ApiOperation({ summary: 'Create a new playlist' })
  @UserAuth()
  @Post('')
  async post(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreatePlaylistSchema))
    playlistDto: CreatePlaylistDto,
  ) {
    const user = req['user'] as UserEntity
    return await this.playlistService.create(user.id, playlistDto)
  }

  @ApiOperation({ summary: 'Update playlist by id' })
  @UserAuth()
  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
    @Body(new ZodValidationPipe(UpdatePlaylistSchema))
    updateDto: UpdatePlaylistDto,
  ) {
    const user = req['user'] as UserEntity
    return await this.playlistService.update(user.id, id, updateDto)
  }
}
