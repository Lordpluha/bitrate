import { NotFoundException } from '@nestjs/common'

/** Thrown when an operator id does not resolve to an existing (non-deactivated) operator. */
export class StaffNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Staff ${id} not found`)
  }
}
