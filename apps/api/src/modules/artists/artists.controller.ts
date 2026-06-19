import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
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
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistsService } from './artists.service'
import {
  DeleteArtistSwagger,
  GetArtistByIdSwagger,
  GetArtistByUsernameSwagger,
  GetArtistsSwagger,
  UpdateArtistSwagger,
} from './decorators'
import type { UpdateArtistDto } from './dtos'
import { UpdateArtistSchema } from './dtos'
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

  @GetArtistByIdSwagger()
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    return await this.artistsService.findById(id)
  }

  @GetArtistByUsernameSwagger()
  @Get('username/:username')
  getByUsername(@Param('username') username: ArtistEntity['username']) {
    return this.artistsService.findByUsername(username)
  }

  @UpdateArtistSwagger()
  @ArtistAuth()
  @Put(':id')
  updateProfile(
    @Req() req: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: ArtistEntity['id'],
    @Body(new ZodValidationPipe(UpdateArtistSchema)) artist: UpdateArtistDto,
  ) {
    const artistId = req.artist.id
    return this.artistsService.update(id, artist, artistId)
  }

  @DeleteArtistSwagger()
  @ArtistAuth()
  @Delete(':id')
  deleteProfile(@Req() req: ArtistAuthRequest, @Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    const artistId = req.artist.id
    return this.artistsService.requestDelete(id, artistId)
  }
}
