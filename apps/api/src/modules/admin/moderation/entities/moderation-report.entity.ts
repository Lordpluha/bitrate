import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type { ModerationReport, ModerationStatus } from '@prisma/client'

/** Represents a moderation report as seen by the operator surface. */
export class AdminModerationReportEntity implements ModerationReport {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The reporter id value. */
  @ApiProperty()
  reporterId: string

  /** The reported entity's type. */
  @ApiProperty()
  entityType: string

  /** The reported entity's id. */
  @ApiProperty()
  entityId: string

  /** The reason value. */
  @ApiProperty()
  reason: string

  /** The details value. */
  @ApiPropertyOptional({ nullable: true })
  details: string | null

  /** The moderation status value. */
  @ApiProperty({ enum: ['OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED'] })
  status: ModerationStatus

  /** When the report was resolved, if it was. */
  @ApiPropertyOptional({ nullable: true })
  resolvedAt: Date | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
