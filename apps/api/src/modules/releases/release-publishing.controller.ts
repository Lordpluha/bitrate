import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import { Body, Controller, Header, HttpCode, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common'
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
@Controller({ path: 'releases', version: '1' })
export class ReleasePublishingController {
  constructor(private readonly publishing: ReleasePublishingService) {}

  @PublishReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/publish')
  publish(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.publishing.publish(request.artist.id, id, input)
  }

  @CancelPremiereSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/publish/cancel')
  cancelPremiere(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.publishing.cancelPremiere(request.artist.id, id, input)
  }

  @UnpublishReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/unpublish')
  unpublish(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.publishing.unpublish(request.artist.id, id, input)
  }

  @RepublishReleaseSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post(':id/republish')
  republish(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.publishing.republish(request.artist.id, id, input)
  }
}
