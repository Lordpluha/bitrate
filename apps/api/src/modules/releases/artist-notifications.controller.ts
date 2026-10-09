import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import { Controller, Get, Header, HttpCode, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ArtistNotificationsService } from './artist-notifications.service'
import { ListArtistNotificationsSwagger, MarkArtistNotificationsSeenSwagger } from './decorators'

@ApiTags('Releases')
@Controller({ path: 'artist-notifications', version: '1' })
export class ArtistNotificationsController {
  constructor(private readonly notifications: ArtistNotificationsService) {}

  @ListArtistNotificationsSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  list(@Req() request: ArtistAuthRequest) {
    return this.notifications.list(request.artist.id)
  }

  @MarkArtistNotificationsSeenSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post('seen')
  markSeen(@Req() request: ArtistAuthRequest) {
    return this.notifications.markSeen(request.artist.id)
  }
}
