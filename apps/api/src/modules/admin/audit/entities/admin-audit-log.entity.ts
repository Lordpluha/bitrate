import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** An audit log row as seen by the operator surface, with the actor resolved. */
export class AdminAuditLogEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The audited action, e.g. `admin-artists.updateVerification`. */
  @ApiProperty()
  action: string

  /** The controller-derived entity type the action targeted. */
  @ApiProperty()
  entityType: string

  /** The id of the entity the action targeted, if resolvable from the route. */
  @ApiPropertyOptional({ nullable: true })
  entityId: string | null

  /** The raw user id of the actor, if the actor was an end user. */
  @ApiPropertyOptional({ nullable: true })
  userId: string | null

  /** The raw staff id of the actor, if the actor was a staff operator. */
  @ApiPropertyOptional({ nullable: true })
  staffId: string | null

  /**
   * The actor's display username — resolved server-side so the operator screen
   * never has to N+1 a lookup per row. `null` when the actor could not be
   * resolved (e.g. the account was later deleted).
   */
  @ApiPropertyOptional({ nullable: true })
  actorUsername: string | null

  /** Freeform metadata captured at audit time. */
  @ApiPropertyOptional({ nullable: true })
  metadata: unknown

  /** The originating request's IP address, if recorded. */
  @ApiPropertyOptional({ nullable: true })
  ipAddress: string | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date
}
