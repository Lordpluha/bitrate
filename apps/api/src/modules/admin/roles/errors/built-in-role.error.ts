import { BadRequestException } from '@nestjs/common'

/** Thrown when a built-in role is edited or deleted in a way its identity cannot survive. */
export class BuiltInRoleException extends BadRequestException {
  constructor(name: string) {
    super(`Built-in role "${name}" cannot be modified this way`)
  }
}
