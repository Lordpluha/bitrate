import { ConflictException } from '@nestjs/common'

/** Thrown when a report's status changed between the read and the guarded write. */
export class ReportStatusChangedException extends ConflictException {
  constructor() {
    super('errors.moderation.report_changed')
  }
}
