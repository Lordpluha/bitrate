import { UserAuth } from '@modules/users-auth/users-auth.guard'
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put, Query } from '@nestjs/common'
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
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.artistsService.findAll({
      limit: Number(limit),
      page: Number(page),
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
  @UserAuth()
  @Put(':id')
  updateProfile(
    @Param('id', ParseUUIDPipe) id: ArtistEntity['id'],
    @Body() artist: Partial<ArtistEntity>,
  ) {
    return this.artistsService.update(id, artist)
  }

  @ApiOperation({ summary: 'Delete artist profile' })
  @UserAuth()
  @Delete(':id')
  deleteProfile(@Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    return this.artistsService.delete(id)
  }
}
