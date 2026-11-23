import { ApiProperty } from '@nestjs/swagger'
import { ReleaseChangeField, ReleaseChangeStatus } from '@prisma/client'

export class ReleaseChangeEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ format: 'uuid' })
  requestId: string

  @ApiProperty({ enum: ReleaseChangeField, enumName: 'ReleaseChangeField' })
  field: ReleaseChangeField

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'The renamed recording, for RECORDING_TITLE',
  })
  recordingId: string | null

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Title or public cover path when the change was proposed',
  })
  previousValue: string | null

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Proposed title. For a cover: a short-lived signed link while pending, the public path once approved, otherwise null',
  })
  proposedValue: string | null

  @ApiProperty({ enum: ReleaseChangeStatus, enumName: 'ReleaseChangeStatus' })
  status: ReleaseChangeStatus

  @ApiProperty({ type: String, nullable: true, description: 'Why staff rejected it, in Markdown' })
  reason: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  decidedAt: Date | null

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date
}

export class ArtistReleaseChangeEntity extends ReleaseChangeEntity {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Staff comment on the whole request, in Markdown',
  })
  reviewerMessage: string | null
}

export class ArtistReleaseChangeListEntity {
  @ApiProperty({ type: [ArtistReleaseChangeEntity] })
  data: ArtistReleaseChangeEntity[]
}

export class ReleaseChangeRequestEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ format: 'uuid' })
  releaseId: string

  @ApiProperty({ type: String, nullable: true, description: 'Staff comment, in Markdown' })
  message: string | null

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Set once no change is pending',
  })
  closedAt: Date | null

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date

  @ApiProperty({ type: [ReleaseChangeEntity] })
  changes: ReleaseChangeEntity[]
}
