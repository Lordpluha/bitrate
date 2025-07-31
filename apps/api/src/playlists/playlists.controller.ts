import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { PlaylistEntity } from './entities'
import { PlaylistsService } from './playlists.service'
import {
  CreatePlaylistDto,
  CreatePlaylistSchema
} from './dtos/create-playlist.dto'
import { AuthGuard } from 'src/auth/auth.guard'
import { ZodValidationPipe } from 'nestjs-zod'
import { JWTPayload } from 'src/auth/types'
import {
  UpdatePlaylistDto,
  UpdatePlaylistSchema
} from './dtos/update-playlist.dto'

@ApiExtraModels(PlaylistEntity)
@ApiTags('Playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistService: PlaylistsService) {}

  @Get('')
  getAll(@Param('page') page?: number, @Param('limit') limit?: number) {
    return this.playlistService.getAll({
      limit,
      page
    })
  }

  @Get(':id')
  getById(@Param('id') id: PlaylistEntity['id']) {
    return this.playlistService.getById(id)
  }

  @UseGuards(AuthGuard)
  @Post('')
  post(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreatePlaylistSchema))
    playlistDto: CreatePlaylistDto
  ) {
    const jwtUser = req['user'] as JWTPayload
    return this.playlistService.create(jwtUser.sub, playlistDto)
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: PlaylistEntity['id'],
    @Body(new ZodValidationPipe(UpdatePlaylistSchema))
    updateDto: UpdatePlaylistDto
  ) {
    const jwtUser = req['user'] as JWTPayload
    return this.playlistService.update(jwtUser.sub, id, updateDto)
  }
}
