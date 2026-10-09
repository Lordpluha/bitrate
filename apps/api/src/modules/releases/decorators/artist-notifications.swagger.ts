import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import {
  ArtistNotificationListEntity,
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
