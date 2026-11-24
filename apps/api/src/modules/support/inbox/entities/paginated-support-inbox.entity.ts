import { ApiProperty } from '@nestjs/swagger'
import { SupportInboxItemEntity } from './support-inbox-item.entity'

/** A page of the operator inbox. */
export class PaginatedSupportInboxEntity {
  @ApiProperty({ type: [SupportInboxItemEntity] })
  data: SupportInboxItemEntity[]

  /** The total number of conversations matching the filters. */
  @ApiProperty()
  total: number

  @ApiProperty()
  page: number

  @ApiProperty()
  limit: number
}
