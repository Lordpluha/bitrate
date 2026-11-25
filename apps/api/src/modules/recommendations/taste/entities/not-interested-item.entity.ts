import { ApiProperty } from '@nestjs/swagger'
import { NotInterestedType } from '@prisma/client'

/** One item the listener marked "Not interested". */
export class NotInterestedItemEntity {
  @ApiProperty({ enum: NotInterestedType, enumName: 'NotInterestedType' })
  entityType: NotInterestedType

  @ApiProperty({ format: 'uuid' })
  entityId: string

  @ApiProperty()
  createdAt: Date
}
