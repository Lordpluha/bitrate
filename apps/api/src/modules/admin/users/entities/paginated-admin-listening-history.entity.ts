import { ApiProperty } from '@nestjs/swagger'
import { AdminListeningHistoryEntryEntity } from './admin-listening-history-entry.entity'

/** A page of a user's listening history, newest first. */
export class PaginatedAdminListeningHistoryEntity {
  /** The listening-history rows on this page. */
  @ApiProperty({ type: [AdminListeningHistoryEntryEntity] })
  data: AdminListeningHistoryEntryEntity[]

  /** The total number of listening-history rows for this user. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
