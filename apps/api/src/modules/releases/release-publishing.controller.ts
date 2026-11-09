import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import { Body, Controller, Header, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  CancelPremiereSwagger,
  PublishReleaseSwagger,
  RepublishReleaseSwagger,
  UnpublishReleaseSwagger,
} from './decorators'
import { type ReleaseDraftVersionDto, ReleaseDraftVersionSchema } from './dtos/release-media.dto'
import { ReleasePublishingService } from './release-publishing.service'

/** The owner's publication of an approved release on Bitrate. */
@ApiTags('Releases')
@Controller({ path: 'artists/me/releases', version: '1' })
export class ReleasePublishingController {
  constructor(private readonly publishing: ReleasePublishingService) {}

  @PublishReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/publish')
  publish(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.publishing.publish(artist.id, id, input)
  }

  @CancelPremiereSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/publish/cancel')
  cancelPremiere(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.publishing.cancelPremiere(artist.id, id, input)
  }

  @UnpublishReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/unpublish')
  unpublish(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.publishing.unpublish(artist.id, id, input)
  }

  @RepublishReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/republish')
  republish(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.publishing.republish(artist.id, id, input)
  }
}
