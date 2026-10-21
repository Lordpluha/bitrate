import { ConflictException } from '@nestjs/common'

/** Thrown when a report's status changed between the read and the guarded write. */
export class ReportStatusChangedException extends ConflictException {
  constructor(id: string) {
    super(`Moderation report ${id} changed status concurrently; reload and retry`)
  }
}
