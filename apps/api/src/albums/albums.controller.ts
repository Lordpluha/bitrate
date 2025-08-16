import {
  Body,
  Controller,
  Delete,
  Get,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AlbumsService } from './albums.service'
import { AlbumEntity } from './entities'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  UpdateAlbumDto,
  UpdateAlbumSchema,
  CreateAlbumDto,
  CreateAlbumSchema
} from './dtos'
import { Auth } from 'src/auth/auth.guard'
import {
  DeleteAlbumSwagger,
  GetAlbumsSwagger,
  GetAlbumByIdSwagger,
  UpdateAlbumByIdSwagger,
  CreateAlbumSwagger
} from './decorators'
import { UserEntity } from 'src/users/entities'

@ApiTags('Albums')
@Controller('albums')
export class AlbumsController {
  constructor(private albumsService: AlbumsService) {}

  @GetAlbumsSwagger()
  @Get('')
  async getAllAlbums(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('title') title?: AlbumEntity['title']
  ) {
    return await this.albumsService.findAll({
      limit: Number(limit),
      page: Number(page),
      title
    })
  }

  @GetAlbumByIdSwagger()
  @Get(':id')
  async getById(@Query('id', ParseUUIDPipe) id: AlbumEntity['id']) {
    return await this.albumsService.getById(id)
  }

  @UpdateAlbumByIdSwagger()
  @Auth()
  @Put(':id')
  async updateAlbum(
    @Req() req: Request,
    @Query('id', ParseUUIDPipe) id: AlbumEntity['id'],
    @Body(new ZodValidationPipe(UpdateAlbumSchema)) updateDto: UpdateAlbumDto
  ) {
    const jwtArtist = req['user'] as UserEntity
    return await this.albumsService.update(jwtArtist.id, id, updateDto)
  }

  @CreateAlbumSwagger()
  @Auth()
  @Post('')
  async createAlbum(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateAlbumSchema)) createDto: CreateAlbumDto
  ) {
    const jwtArtist = req['user'] as UserEntity
    return await this.albumsService.create(jwtArtist.id, createDto)
  }

  @DeleteAlbumSwagger()
  @Auth()
  @Delete(':id')
  async deleteAlbum(
    @Req() req: Request,
    @Query('id', ParseUUIDPipe) id: AlbumEntity['id']
  ) {
    const jwtArtist = req['user'] as UserEntity
    return await this.albumsService.delete(jwtArtist.id, id)
  }
}
