import { ReleaseChangeEntity } from '@modules/releases/entities/release-change.entity'
import { ApiProperty } from '@nestjs/swagger'
import { ReleaseStatus, ReleaseUnpublishedBy } from '@prisma/client'

export class AdminReleaseChangeRequestRowEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ format: 'uuid' })
  releaseId: string

  @ApiProperty()
  releaseTitle: string

  @ApiProperty({ type: String, nullable: true })
  releaseCover: string | null

  @ApiProperty()
  artistUsername: string

  @ApiProperty({ minimum: 1 })
  changeCount: number

  @ApiProperty({ minimum: 0 })
  pendingCount: number

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  closedAt: Date | null
}

export class PaginatedAdminReleaseChangeRequestsEntity {
  @ApiProperty({ type: [AdminReleaseChangeRequestRowEntity] })
  data: AdminReleaseChangeRequestRowEntity[]

  @ApiProperty()
  total: number

  @ApiProperty()
  page: number

  @ApiProperty()
  limit: number
}

export class AdminReleaseChangeStatsEntity {
  @ApiProperty({ minimum: 0, description: 'Requests with at least one pending change' })
  open: number
}

export class AdminReleaseChangeReleaseEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ type: String, nullable: true })
  cover: string | null

  @ApiProperty({ enum: ReleaseStatus, enumName: 'ReleaseStatus' })
  status: ReleaseStatus

  @ApiProperty({
    enum: ReleaseUnpublishedBy,
    enumName: 'ReleaseUnpublishedBy',
    nullable: true,
  })
  unpublishedBy: ReleaseUnpublishedBy | null

  @ApiProperty({ format: 'uuid' })
  artistId: string

  @ApiProperty()
  artistUsername: string
}

export class AdminReleaseChangeEntity extends ReleaseChangeEntity {
  @ApiProperty({ type: String, nullable: true })
  reviewerUsername: string | null
}

export class AdminReleaseChangeRequestEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ format: 'uuid' })
  releaseId: string

  @ApiProperty({ type: String, nullable: true, description: 'Staff comment, in Markdown' })
  message: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  closedAt: Date | null

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date

  @ApiProperty({ type: AdminReleaseChangeReleaseEntity })
  release: AdminReleaseChangeReleaseEntity

  @ApiProperty({ type: [AdminReleaseChangeEntity] })
  changes: AdminReleaseChangeEntity[]
}
