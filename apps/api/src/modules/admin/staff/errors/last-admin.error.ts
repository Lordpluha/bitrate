import { ConflictException } from '@nestjs/common'

/** Thrown when an operation would leave zero active operators holding the built-in ADMIN role. */
export class LastAdminException extends ConflictException {
  constructor() {
    super('This operation would leave no active operator holding the ADMIN role')
  }
}
