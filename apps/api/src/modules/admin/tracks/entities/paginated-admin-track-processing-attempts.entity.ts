import { ApiProperty } from '@nestjs/swagger'
import { AdminTrackProcessingAttemptEntity } from './admin-track-processing-attempt.entity'

/** A page of a track's processing attempt history. */
export class PaginatedAdminTrackProcessingAttemptsEntity {
  /** The attempts on this page, newest first. */
  @ApiProperty({ type: [AdminTrackProcessingAttemptEntity] })
  data: AdminTrackProcessingAttemptEntity[]

  /** The total number of attempts recorded for this track. */
  @ApiProperty()
  total: number

  /** The current page number. */
  @ApiProperty()
  page: number

  /** The page size. */
  @ApiProperty()
  limit: number
}
