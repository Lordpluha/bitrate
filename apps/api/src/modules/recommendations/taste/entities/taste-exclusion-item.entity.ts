import { ApiProperty } from '@nestjs/swagger'
import { TasteExclusionType } from '@prisma/client'

/** One item the listener excluded from their taste profile. */
export class TasteExclusionItemEntity {
  @ApiProperty({ enum: TasteExclusionType, enumName: 'TasteExclusionType' })
  entityType: TasteExclusionType

  @ApiProperty({ format: 'uuid' })
  entityId: string

  @ApiProperty()
  createdAt: Date
}
