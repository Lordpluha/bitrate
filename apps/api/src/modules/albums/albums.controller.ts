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
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AlbumsService } from './albums.service'
import {
  CreateAlbumSwagger,
  DeleteAlbumSwagger,
  GetAlbumByIdSwagger,
  GetAlbumsSwagger,
  UpdateAlbumByIdSwagger,
} from './decorators'
import { CreateAlbumDto, CreateAlbumSchema, UpdateAlbumDto, UpdateAlbumSchema } from './dtos'
import { AlbumEntity } from './entities'

@ApiTags('Albums')
@Controller('albums')
export class AlbumsController {
  constructor(private albumsService: AlbumsService) {}

  @GetAlbumsSwagger()
  @Get('')
  async getAllAlbums(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
    @Query('title') title?: AlbumEntity['title'],
  ) {
    return await this.albumsService.findAll({
      limit,
      page,
      title,
    })
  }

  @GetAlbumByIdSwagger()
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: AlbumEntity['id']) {
    return await this.albumsService.getById(id)
  }

  @CreateAlbumSwagger()
  @ArtistAuth()
  @Post('')
  async createAlbum(
    @Req() req: ArtistAuthRequest,
    @Body(new ZodValidationPipe(CreateAlbumSchema)) createDto: CreateAlbumDto,
  ) {
    const artistId = req.artist.id
    return await this.albumsService.create(artistId, createDto)
  }

  @UpdateAlbumByIdSwagger()
  @ArtistAuth()
  @Put(':id')
  async updateAlbum(
    @Req() req: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: AlbumEntity['id'],
    @Body(new ZodValidationPipe(UpdateAlbumSchema)) updateDto: UpdateAlbumDto,
  ) {
    const artistId = req.artist.id
    return await this.albumsService.update(artistId, id, updateDto)
  }

  @DeleteAlbumSwagger()
  @ArtistAuth()
  @Delete(':id')
  async deleteAlbum(
    @Req() req: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: AlbumEntity['id'],
  ) {
    const artistId = req.artist.id
    return await this.albumsService.delete(artistId, id)
  }
}
