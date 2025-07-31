import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AlbumsService } from './albums.service'

@ApiTags('Albums')
@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  getAllAlbums(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.albumsService.findAll({
      limit: Number(limit),
      page: Number(page)
    })
  }
}
