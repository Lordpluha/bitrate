import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import { Body, Controller, Get, Header, HttpCode, Post, Put } from '@nestjs/common'
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
@Controller({ path: 'artists/me/notifications', version: '1' })
export class ArtistNotificationsController {
  constructor(private readonly notifications: ArtistNotificationsService) {}

  @ListArtistNotificationsSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  list(@CurrentArtist() artist: ArtistEntity) {
    return this.notifications.list(artist.id)
  }

  @MarkArtistNotificationsSeenSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Post('seen')
  markSeen(@CurrentArtist() artist: ArtistEntity) {
    return this.notifications.markSeen(artist.id)
  }

  @GetNotificationPreferencesSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('preferences')
  preferences(@CurrentArtist() artist: ArtistEntity) {
    return this.notifications.preferences(artist.id)
  }

  @UpdateNotificationPreferencesSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Put('preferences')
  updatePreferences(
    @CurrentArtist() artist: ArtistEntity,
    @Body(new ZodValidationPipe(UpdateNotificationPreferencesSchema))
    input: UpdateNotificationPreferencesDto,
  ) {
    return this.notifications.updatePreferences(artist.id, input)
  }
}
