import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UpdateNotificationPreferencesDto } from '../dtos/notification-preferences.dto'
import {
  ArtistNotificationListEntity,
  ArtistNotificationPreferencesEntity,
  ArtistNotificationsSeenEntity,
} from '../entities/artist-notification.entity'

export function ListArtistNotificationsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "List the artist's notifications",
      description:
        'Derived from tasks, release review and delivery states, newest first; items after the last seen time are unread.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistNotificationListEntity }),
  )
}

export function MarkArtistNotificationsSeenSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Mark all current notifications as read' }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistNotificationsSeenEntity }),
  )
}

export function GetNotificationPreferencesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Read which notification categories are switched off' }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistNotificationPreferencesEntity }),
  )
}

export function UpdateNotificationPreferencesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Replace the switched-off notification categories',
      description: 'Email and push are not sent yet, so only the in-app center is affected.',
    }),
    ApiBody({ type: UpdateNotificationPreferencesDto }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistNotificationPreferencesEntity }),
  )
}
