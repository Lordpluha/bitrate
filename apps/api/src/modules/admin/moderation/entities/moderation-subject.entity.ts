import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** The entity a moderation report names, resolved for the operator to link to and judge. */
export class ModerationSubjectEntity {
  /** The resolved entity kind — `track`, `album`, `playlist`, `artist`, `podcast`, `episode`,
   * or `user`. */
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

  /** The subject's owning parent, when its kind has one — an episode's podcast id. `null` for
   * every other kind, kept as one field rather than a kind-specific one so the entity stays
   * simple; a future parent-bearing kind reuses this instead of adding another optional field. */
  @ApiPropertyOptional({ nullable: true })
  parentId: string | null
}
