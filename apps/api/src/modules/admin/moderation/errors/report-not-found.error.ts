import { NotFoundException } from '@nestjs/common'

/** Thrown when a moderation report id does not resolve to an existing report. */
export class ReportNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Moderation report ${id} not found`)
  }
}
