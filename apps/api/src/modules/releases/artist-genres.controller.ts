import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { Controller, Get, Header } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ArtistGenresService } from './artist-genres.service'
import { ListArtistGenresSwagger } from './decorators'

@ApiTags('Releases')
@Controller({ path: 'artists/me/genres', version: '1' })
export class ArtistGenresController {
  constructor(private readonly genres: ArtistGenresService) {}

  @ListArtistGenresSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  list() {
    return this.genres.list()
  }
}
