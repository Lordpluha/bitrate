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
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'
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

  @ApiOperation({ summary: 'Get all playlists with pagination and filters' })
  @ApiParam({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number
  })
  @ApiParam({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number
  })
  @Get('')
  getAll(@Param('page') page?: number, @Param('limit') limit?: number) {
    return this.playlistService.getAll({
      limit,
      page
    })
  }

  @ApiOperation({ summary: 'Get playlist by id' })
  @Get(':id')
  getById(@Param('id') id: PlaylistEntity['id']) {
    return this.playlistService.getById(id)
  }

  @ApiOperation({ summary: 'Create a new playlist' })
  @ApiCookieAuth(process.env.ACCESS_TOKEN_NAME)
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

  @ApiOperation({ summary: 'Update playlist by id' })
  @ApiCookieAuth(process.env.ACCESS_TOKEN_NAME)
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
