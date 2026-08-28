import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { ArtistAuthRequest } from '@modules/artists-auth/types'
import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AlbumsService } from './albums.service'
import {
  CreateAlbumSwagger,
  DeleteAlbumSwagger,
  GetAlbumByIdSwagger,
  GetAlbumsSwagger,
  LikeAlbumSwagger,
  UnlikeAlbumSwagger,
  UpdateAlbumByIdSwagger,
} from './decorators'
import { CreateAlbumDto, CreateAlbumSchema, UpdateAlbumDto, UpdateAlbumSchema } from './dtos'
import { AlbumEntity } from './entities'

/** Represents the albums controller. */
@ApiExtraModels(AlbumEntity)
@ApiTags('Albums')
@Controller({ path: 'albums', version: '1' })
export class AlbumsController {
  constructor(private albumsService: AlbumsService) {}

  /** Runs the get all albums operation. */
  @GetAlbumsSwagger()
  @Get('')
  async getAllAlbums(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('title') title?: AlbumEntity['title'],
    @Query('artistId', new ParseUUIDPipe({ optional: true })) artistId?: string,
  ) {
    return await this.albumsService.findAll({
      artistId,
      limit,
      page,
      title,
    })
  }

  /** Runs the get by id operation. */
  @GetAlbumByIdSwagger()
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: AlbumEntity['id']) {
    return await this.albumsService.getById(id)
  }

  /** Runs the create album operation. */
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

  /** Runs the update album operation. */
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

  /** Runs the delete album operation. */
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

  /** Runs the like album operation. */
  @LikeAlbumSwagger()
  @UserAuth()
  @Post(':id/like')
  likeAlbum(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: AlbumEntity['id']) {
    return this.albumsService.like(req.user.id, id)
  }

  /** Runs the unlike album operation. */
  @UnlikeAlbumSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/like')
  unlikeAlbum(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: AlbumEntity['id']) {
    return this.albumsService.unlike(req.user.id, id)
  }
}
