import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { OptionalUserAuthRequest } from '../types'

/**
 * Extracts the listener `UserAuthGuard` attached to the request. Under `OptionalUserAuthGuard`
 * it is `undefined` for anonymous callers, so type the parameter `UserEntity | undefined` there.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<Request & OptionalUserAuthRequest>().user,
)
