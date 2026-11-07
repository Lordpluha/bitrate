import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import { Body, Controller, Get, Header, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  AddCompilationTracksDto,
  AddCompilationTracksSchema,
  CompilationCatalogueDto,
  CompilationCatalogueSchema,
} from './dtos/compilation.dto'
import {
  CompilationCatalogueEntity,
  CompilationTracksAddedEntity,
} from './entities/compilation.entity'
import { ReleaseCompilationService } from './release-compilation.service'

@ApiTags('Releases')
@Controller({ path: 'artists/me/releases', version: '1' })
export class ReleaseCompilationController {
  constructor(private readonly compilations: ReleaseCompilationService) {}

  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: "List the artist's published recordings available for a compilation" })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: CompilationCatalogueEntity })
  @Get(':id/catalogue-tracks')
  catalogue(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(CompilationCatalogueSchema)) input: CompilationCatalogueDto,
  ) {
    return this.compilations.catalogue(artist.id, id, input)
  }

  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({
    summary: 'Add approved catalogue recordings to a draft compilation',
    description:
      'Only owned, currently published recordings are eligible. The first addition turns an empty draft into a compilation. Audio and catalogue identities are reused; publication still requires release review.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: AddCompilationTracksDto })
  @ApiResponse({ status: 201, type: CompilationTracksAddedEntity })
  @Post(':id/compilation-tracks')
  add(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(AddCompilationTracksSchema)) input: AddCompilationTracksDto,
  ) {
    return this.compilations.add(artist.id, id, input)
  }
}
