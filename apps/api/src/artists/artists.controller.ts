import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ArtistsService } from './artists.service'
import { ArtistEntity } from './entities'
import { CreateArtistDto, CreateArtistSchema } from './dtos'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistsGetAllSwagger } from './decorators'
import { AuthGuard } from 'src/auth/auth.guard'

@ApiTags('Artists')
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @ArtistsGetAllSwagger()
  @Get('')
  getAll(
    @Query('username') username?: ArtistEntity['username'],
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.artistsService.findAll({
      limit: Number(limit),
      page: Number(page),
      username
    })
  }

  @Get(':id')
  getById(@Param('id') id: ArtistEntity['id']) {
    return this.artistsService.findById(id)
  }

  @Get('username/:username')
  getByUsername(@Param('username') username: ArtistEntity['username']) {
    return this.artistsService.findByUsername(username)
  }

  @Post('')
  create(
    @Body(new ZodValidationPipe(CreateArtistSchema))
    createArtistDto: CreateArtistDto
  ) {
    return this.artistsService.create(createArtistDto)
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  updateProfile(
    @Param('id') id: ArtistEntity['id'],
    @Body() artist: Partial<ArtistEntity>
  ) {
    return this.artistsService.update(id, artist)
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteProfile(@Param('id') id: ArtistEntity['id']) {
    return this.artistsService.delete(id)
  }
}
