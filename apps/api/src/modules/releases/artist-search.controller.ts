import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import { Controller, Get, Header, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistSearchService } from './artist-search.service'
import { ArtistSearchSwagger } from './decorators'
import { type ArtistSearchDto, ArtistSearchSchema } from './dtos/artist-search.dto'

@ApiTags('Releases')
@Controller({ path: 'artist-search', version: '1' })
export class ArtistSearchController {
  constructor(private readonly searchService: ArtistSearchService) {}

  @ArtistSearchSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  search(
    @Req() request: ArtistAuthRequest,
    @Query(new ZodValidationPipe(ArtistSearchSchema)) query: ArtistSearchDto,
  ) {
    return this.searchService.search(request.artist.id, query.q)
  }
}
