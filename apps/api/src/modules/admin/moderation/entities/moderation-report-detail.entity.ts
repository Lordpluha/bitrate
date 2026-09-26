import { ApiProperty } from '@nestjs/swagger'
import { AdminModerationReportEntity } from './moderation-report.entity'
import { ModerationSubjectEntity } from './moderation-subject.entity'

/** A moderation report's full operator detail view — the report plus its resolved subject and
 * sibling reports on the same subject. */
export class AdminModerationReportDetailEntity extends AdminModerationReportEntity {
  /** The resolved reported entity, or `null` for an unrecognised type or a row that no longer
   * exists. Always present in the response — `nullable`, not optional; a client can rely on
   * the key existing and only needs to check the value. */
  @ApiProperty({ type: ModerationSubjectEntity, nullable: true })
  subject: ModerationSubjectEntity | null

  /** Other reports naming the same subject, newest first, bounded. */
  @ApiProperty({ type: [AdminModerationReportEntity] })
  siblingReports: AdminModerationReportEntity[]
}
