import { BadRequestException } from '@nestjs/common'

/** Thrown when a protected permission is granted to anything but the built-in ADMIN role. */
export class ProtectedPermissionException extends BadRequestException {
  constructor(ids: readonly string[]) {
    super(`Permission(s) cannot be granted directly: ${ids.join(', ')}`)
  }
}
