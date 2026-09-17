import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { AdminAuthRequest, AuthenticatedStaff } from '../types'

/** Extracts the authenticated staff member `AdminAuthGuard` attached to the request. */
export const CurrentStaff = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedStaff => {
    const request = ctx.switchToHttp().getRequest<Request & AdminAuthRequest>()
    return request.staff
  },
)
