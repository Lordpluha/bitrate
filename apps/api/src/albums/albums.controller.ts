import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AlbumsService } from './albums.service'
import { AlbumEntity } from './entities'
import { UpdateAlbumDto, UpdateAlbumSchema } from './dtos/update-album.dto'
import { ZodValidationPipe } from 'nestjs-zod'
import { CreateAlbumDto, CreateAlbumSchema } from './dtos/create-album.dto'
import { AuthGuard } from 'src/auth/auth.guard'
import { JWTPayload } from 'src/auth/types'

@ApiTags('Albums')
@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get('')
  getAllAlbums(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('title') title?: AlbumEntity['title']
  ) {
    return this.albumsService.findAll({
      limit: Number(limit),
      page: Number(page),
      title
    })
  }

  @Get(':id')
  getById(@Query('id') id: AlbumEntity['id']) {
    return this.albumsService.getById(id)
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  updateAlbum(
    @Req() req: Request,
    @Query('id') id: AlbumEntity['id'],
    @Body(new ZodValidationPipe(UpdateAlbumSchema)) updateDto: UpdateAlbumDto
  ) {
    const jwtArtist = req['user'] as JWTPayload
    return this.albumsService.update(jwtArtist.sub, id, updateDto)
  }

  @UseGuards(AuthGuard)
  @Post('')
  createAlbum(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateAlbumSchema)) createDto: CreateAlbumDto
  ) {
    const jwtArtist = req['user'] as JWTPayload
    return this.albumsService.create(jwtArtist.sub, createDto)
  }
}
