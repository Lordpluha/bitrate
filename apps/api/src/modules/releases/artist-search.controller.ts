import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import { Controller, Get, Header, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistSearchService } from './artist-search.service'
import { ArtistSearchSwagger } from './decorators'
import { type ArtistSearchDto, ArtistSearchSchema } from './dtos/artist-search.dto'

@ApiTags('Releases')
@Controller({ path: 'artists/me/search', version: '1' })
export class ArtistSearchController {
  constructor(private readonly searchService: ArtistSearchService) {}

  @ArtistSearchSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  search(
    @CurrentArtist() artist: ArtistEntity,
    @Query(new ZodValidationPipe(ArtistSearchSchema)) query: ArtistSearchDto,
  ) {
    return this.searchService.search(artist.id, query.q)
  }
}
