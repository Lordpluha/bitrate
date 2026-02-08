import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Put,
  Query,
  Req,
} from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ArtistsService } from './artists.service'
import { GetArtistsSwagger } from './decorators'
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

  @ApiOperation({ summary: 'Get artist by id' })
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    return await this.artistsService.findById(id)
  }

  @ApiOperation({ summary: 'Get artist by username' })
  @Get('username/:username')
  getByUsername(@Param('username') username: ArtistEntity['username']) {
    return this.artistsService.findByUsername(username)
  }

  @ApiOperation({ summary: 'Update artist profile' })
  @ArtistAuth()
  @Put(':id')
  updateProfile(
    @Req() req: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: ArtistEntity['id'],
    @Body() artist: Partial<ArtistEntity>,
  ) {
    const artistId = req.artist.id
    return this.artistsService.update(id, artist, artistId)
  }

  @ApiOperation({ summary: 'Delete artist profile' })
  @ArtistAuth()
  @Delete(':id')
  deleteProfile(@Req() req: ArtistAuthRequest, @Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    const artistId = req.artist.id
    return this.artistsService.requestDelete(id, artistId)
  }
}
