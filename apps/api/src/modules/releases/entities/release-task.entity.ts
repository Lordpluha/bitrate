import { ApiProperty } from '@nestjs/swagger'
import { ReleaseStatus, ReleaseTaskStatus } from '@prisma/client'

export class ReleaseTaskAssigneeEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  displayName: string
}

export class ReleaseTaskEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ format: 'uuid' })
  releaseId: string

  @ApiProperty({ maxLength: 200 })
  title: string

  @ApiProperty({ type: String, nullable: true, maxLength: 2000 })
  notes: string | null

  @ApiProperty({ enum: ReleaseTaskStatus, enumName: 'ReleaseTaskStatus' })
  status: ReleaseTaskStatus

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  dueAt: Date | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  completedAt: Date | null

  @ApiProperty({ type: ReleaseTaskAssigneeEntity, nullable: true })
  assignee: ReleaseTaskAssigneeEntity | null

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date
}

export class ReleaseTaskListEntity {
  @ApiProperty({ type: [ReleaseTaskEntity], maxItems: 200 })
  data: ReleaseTaskEntity[]

  @ApiProperty({ minimum: 0 })
  total: number
}

export class ArtistTaskReleaseEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: ReleaseStatus, enumName: 'ReleaseStatus' })
  status: ReleaseStatus
}

export class ArtistTaskEntity extends ReleaseTaskEntity {
  @ApiProperty({ type: ArtistTaskReleaseEntity })
  release: ArtistTaskReleaseEntity
}

export class ArtistTaskCountsEntity {
  @ApiProperty({ minimum: 0 })
  TODO: number

  @ApiProperty({ minimum: 0 })
  IN_PROGRESS: number

  @ApiProperty({ minimum: 0 })
  DONE: number

  @ApiProperty({ minimum: 0, description: 'Not done and past their deadline' })
  overdue: number
}

export class ArtistTaskPageEntity {
  @ApiProperty({ type: [ArtistTaskEntity] })
  data: ArtistTaskEntity[]

  @ApiProperty({ minimum: 0 })
  total: number

  @ApiProperty({ minimum: 1 })
  page: number

  @ApiProperty({ minimum: 1, maximum: 100 })
  limit: number

  @ApiProperty({ type: ArtistTaskCountsEntity })
  counts: ArtistTaskCountsEntity
}

export class ReleaseTaskDeletedEntity {
  @ApiProperty({ format: 'uuid' })
  id: string
}
