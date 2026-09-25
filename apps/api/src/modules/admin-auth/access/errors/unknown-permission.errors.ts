import { BadRequestException } from '@nestjs/common'

/** Thrown when a permission id does not exist in the catalogue. */
export class UnknownPermissionException extends BadRequestException {
  constructor(ids: readonly string[]) {
    super(`Unknown permission(s): ${ids.join(', ')}`)
  }
}
