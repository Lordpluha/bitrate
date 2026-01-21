import { Auth } from '@modules/auth/auth.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistsService } from './artists.service'
import { GetArtistsSwagger } from './decorators'
import { CreateArtistDto, CreateArtistSchema } from './dtos'
import { ArtistEntity } from './entities'

@ApiTags('Artists')
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

  @ApiOperation({ summary: 'Create a new artist' })
  @Post('register')
  register(
    @Body(new ZodValidationPipe(CreateArtistSchema))
    createArtistDto: CreateArtistDto,
  ) {
    return this.artistsService.register(createArtistDto)
  }

  @ApiOperation({ summary: 'Login an artist' })
  @Post('login')
  login(
    @Body(new ZodValidationPipe(CreateArtistSchema))
    createArtistDto: CreateArtistDto,
  ) {
    return this.artistsService.login(createArtistDto)
  }

  @ApiOperation({ summary: 'Update artist profile' })
  @Auth()
  @Put(':id')
  updateProfile(
    @Param('id', ParseUUIDPipe) id: ArtistEntity['id'],
    @Body() artist: Partial<ArtistEntity>,
  ) {
    return this.artistsService.update(id, artist)
  }

  @ApiOperation({ summary: 'Delete artist profile' })
  @Auth()
  @Delete(':id')
  deleteProfile(@Param('id', ParseUUIDPipe) id: ArtistEntity['id']) {
    return this.artistsService.delete(id)
  }
}
