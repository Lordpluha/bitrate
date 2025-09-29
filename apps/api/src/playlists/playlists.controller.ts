import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req
} from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PlaylistEntity } from './entities'
import { PlaylistsService } from './playlists.service'
import {
  CreatePlaylistDto,
  CreatePlaylistSchema
} from './dtos/create-playlist.dto'
import { Auth } from 'src/auth/auth.guard'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  UpdatePlaylistDto,
  UpdatePlaylistSchema
} from './dtos/update-playlist.dto'
import { GetPlaylistsSwagger } from './decorators/get-playlists.decorator'
import { UserEntity } from 'src/users/entities'

@ApiExtraModels(PlaylistEntity)
@ApiTags('Playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistService: PlaylistsService) {}

  @GetPlaylistsSwagger()
  @Get('')
  async getAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return await this.playlistService.getAll({
      limit: Number(limit || 10),
      page: Number(page || 1)
    })
  }

  @ApiOperation({ summary: 'Get playlist by id' })
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: PlaylistEntity['id']) {
    return await this.playlistService.getById(id)
  }

  @ApiOperation({ summary: 'Create a new playlist' })
  @Auth()
  @Post('')
  async post(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreatePlaylistSchema))
    playlistDto: CreatePlaylistDto
  ) {
    const user = req['user'] as UserEntity
    return await this.playlistService.create(user.id, playlistDto)
  }

  @ApiOperation({ summary: 'Update playlist by id' })
  @Auth()
  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: PlaylistEntity['id'],
    @Body(new ZodValidationPipe(UpdatePlaylistSchema))
    updateDto: UpdatePlaylistDto
  ) {
    const user = req['user'] as UserEntity
    return await this.playlistService.update(user.id, id, updateDto)
  }
}
