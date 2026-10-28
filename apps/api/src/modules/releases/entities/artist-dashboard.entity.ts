import { ApiProperty } from '@nestjs/swagger'
import { AlbumType, ReleaseStatus, ReleaseTaskStatus } from '@prisma/client'

export class DashboardCountsEntity {
  @ApiProperty({ minimum: 0 })
  releases: number

  @ApiProperty({ minimum: 0 })
  drafts: number

  @ApiProperty({ minimum: 0 })
  inReview: number

  @ApiProperty({ minimum: 0 })
  released: number

  @ApiProperty({ minimum: 0, description: 'Private track drafts in the catalogue' })
  tracks: number
}

export class DashboardLeadTrackEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ type: Number, nullable: true, minimum: 0 })
  duration: number | null

  @ApiProperty({
    type: [Number],
    description: 'Normalised peak levels (0–1) for drawing the waveform; empty until computed',
  })
  waveform: number[]
}

export class DashboardCurrentReleaseEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: AlbumType, enumName: 'AlbumType' })
  type: AlbumType

  @ApiProperty({ enum: ReleaseStatus, enumName: 'ReleaseStatus' })
  status: ReleaseStatus

  @ApiProperty({ type: String, nullable: true })
  cover: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  scheduledAt: Date | null

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date

  @ApiProperty({ minimum: 0, description: 'Submission blockers; 0 unless the release is a draft' })
  blockerCount: number

  @ApiProperty({
    type: DashboardLeadTrackEntity,
    nullable: true,
    description: 'First recording in running order that has an uploaded master',
  })
  leadTrack: DashboardLeadTrackEntity | null
}

export class DashboardAttentionEntity {
  @ApiProperty({
    enum: ['BLOCKERS', 'CHANGES_REQUESTED', 'OVERDUE_TASKS'],
    enumName: 'DashboardAttentionKind',
  })
  kind: 'BLOCKERS' | 'CHANGES_REQUESTED' | 'OVERDUE_TASKS'

  @ApiProperty({ format: 'uuid', required: false })
  releaseId?: string

  @ApiProperty({ required: false })
  releaseTitle?: string

  @ApiProperty({ minimum: 1, required: false })
  count?: number
}

export class DashboardUpcomingEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: ReleaseStatus, enumName: 'ReleaseStatus' })
  status: ReleaseStatus

  @ApiProperty({ type: String, format: 'date-time' })
  scheduledAt: Date
}

export class DashboardTaskReleaseEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string
}

export class DashboardTaskEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: ReleaseTaskStatus, enumName: 'ReleaseTaskStatus' })
  status: ReleaseTaskStatus

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  dueAt: Date | null

  @ApiProperty({ type: DashboardTaskReleaseEntity })
  release: DashboardTaskReleaseEntity
}

export class DashboardTasksEntity {
  @ApiProperty({ minimum: 0 })
  open: number

  @ApiProperty({ minimum: 0 })
  overdue: number

  @ApiProperty({ type: [DashboardTaskEntity], maxItems: 5 })
  next: DashboardTaskEntity[]
}

export class ArtistDashboardEntity {
  @ApiProperty({ type: DashboardCountsEntity })
  counts: DashboardCountsEntity

  @ApiProperty({ type: DashboardCurrentReleaseEntity, nullable: true })
  currentRelease: DashboardCurrentReleaseEntity | null

  @ApiProperty({ type: [DashboardAttentionEntity] })
  attention: DashboardAttentionEntity[]

  @ApiProperty({ type: [DashboardUpcomingEntity], maxItems: 5 })
  upcoming: DashboardUpcomingEntity[]

  @ApiProperty({ type: DashboardTasksEntity })
  tasks: DashboardTasksEntity
}
