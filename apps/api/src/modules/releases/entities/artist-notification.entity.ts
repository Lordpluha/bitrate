import { ApiProperty } from '@nestjs/swagger'
import { ArtistNotificationCategory, DeliveryDestination } from '@prisma/client'

export class ArtistNotificationEntity {
  @ApiProperty({ description: 'Stable per notification, for list keys' })
  id: string

  @ApiProperty({
    enum: [
      'TASK_OVERDUE',
      'TASK_DUE_SOON',
      'CHANGES_REQUESTED',
      'DELIVERY_FAILED',
      'RELEASE_SUBMITTED',
      'RELEASE_APPROVED',
      'RELEASE_RELEASED',
      'DELIVERY_LIVE',
    ],
    enumName: 'ArtistNotificationKind',
  })
  kind: string

  @ApiProperty({ description: 'Needs the artist to act, as opposed to an update' })
  actionRequired: boolean

  @ApiProperty({ format: 'uuid' })
  releaseId: string

  @ApiProperty()
  releaseTitle: string

  @ApiProperty({ required: false })
  taskTitle?: string

  @ApiProperty({ enum: DeliveryDestination, enumName: 'DeliveryDestination', required: false })
  destination?: DeliveryDestination

  @ApiProperty({ type: String, format: 'date-time' })
  at: Date

  @ApiProperty()
  unread: boolean
}

export class ArtistNotificationListEntity {
  @ApiProperty({ type: [ArtistNotificationEntity], maxItems: 30 })
  data: ArtistNotificationEntity[]

  @ApiProperty({ minimum: 0 })
  unread: number

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  seenAt: Date | null
}

export class ArtistNotificationsSeenEntity {
  @ApiProperty({ type: String, format: 'date-time' })
  seenAt: Date
}

export class ArtistNotificationPreferencesEntity {
  @ApiProperty({
    enum: ArtistNotificationCategory,
    enumName: 'ArtistNotificationCategory',
    isArray: true,
    description: 'Categories left out of the in-app notification center',
  })
  mutedInApp: ArtistNotificationCategory[]
}
