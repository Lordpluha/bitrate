import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import { Controller, Get, Header, Query } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistMusicService } from './artist-music.service'
import { MusicCatalogueSwagger, MusicCountsSwagger } from './decorators/music-catalogue.swagger'
import {
  type MusicReleasesDto,
  MusicReleasesSchema,
  type MusicTracksDto,
  MusicTracksSchema,
} from './dtos/music-catalogue.dto'
import {
  MusicCountsEntity,
  MusicReleaseEntity,
  MusicTrackEntity,
  MusicTrackReleaseEntity,
} from './entities/music-catalogue.entity'

@ApiTags('Artist Music')
@ApiExtraModels(MusicTrackEntity, MusicTrackReleaseEntity, MusicReleaseEntity, MusicCountsEntity)
@Controller({ path: 'artist-music', version: '1' })
export class ArtistMusicController {
  constructor(private readonly music: ArtistMusicService) {}

  @MusicCountsSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('counts')
  counts(@CurrentArtist() artist: ArtistEntity) {
    return this.music.counts(artist.id)
  }

  @MusicCatalogueSwagger('tracks')
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('tracks')
  tracks(
    @CurrentArtist() artist: ArtistEntity,
    @Query(new ZodValidationPipe(MusicTracksSchema)) input: MusicTracksDto,
  ) {
    return this.music.tracks(artist.id, input)
  }

  @MusicCatalogueSwagger('releases')
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('releases')
  releases(
    @CurrentArtist() artist: ArtistEntity,
    @Query(new ZodValidationPipe(MusicReleasesSchema)) input: MusicReleasesDto,
  ) {
    return this.music.releases(artist.id, input)
  }
}
