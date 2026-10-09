import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import { Body, Controller, Get, Header, HttpCode, Post, Put, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistNotificationsService } from './artist-notifications.service'
import {
  GetNotificationPreferencesSwagger,
  ListArtistNotificationsSwagger,
  MarkArtistNotificationsSeenSwagger,
  UpdateNotificationPreferencesSwagger,
} from './decorators'
import {
  type UpdateNotificationPreferencesDto,
  UpdateNotificationPreferencesSchema,
} from './dtos/notification-preferences.dto'

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

  @GetNotificationPreferencesSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('preferences')
  preferences(@Req() request: ArtistAuthRequest) {
    return this.notifications.preferences(request.artist.id)
  }

  @UpdateNotificationPreferencesSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Put('preferences')
  updatePreferences(
    @Req() request: ArtistAuthRequest,
    @Body(new ZodValidationPipe(UpdateNotificationPreferencesSchema))
    input: UpdateNotificationPreferencesDto,
  ) {
    return this.notifications.updatePreferences(request.artist.id, input)
  }
}
