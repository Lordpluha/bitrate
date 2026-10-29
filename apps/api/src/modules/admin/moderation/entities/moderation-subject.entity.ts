import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** The entity a moderation report names, resolved for the operator to link to and judge. */
export class ModerationSubjectEntity {
  /** The resolved entity kind — `track`, `album`, `playlist`, `artist` or `user`. */
  @ApiProperty()
  kind: string

  /** The subject's id. */
  @ApiProperty()
  id: string

  /** The subject's display title (or username, for a user/artist subject). */
  @ApiProperty()
  title: string

  /** The subject's soft-delete timestamp, if it has one and is deleted. */
  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null
}
