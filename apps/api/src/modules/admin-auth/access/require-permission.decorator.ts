import { applyDecorators, HttpStatus, SetMetadata } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import type { Permission } from './permissions'

/** The required-permission metadata key. */
export const REQUIRED_PERMISSION = 'requiredPermission'

/**
 * Requires a single permission on a route, below the `@AdminAuth()` floor its controller class
 * declares. Deliberately carries no `ApiCookieAuth` — that belongs on the class, once; applying
 * it again here would duplicate the `security` entry in the generated spec. The 403 response is
 * declared here rather than left to the class because a method-level `ApiResponse` *replaces*
 * the class's for that status rather than merging with it.
 * @param permission The permission this route requires.
 * @returns Decorator setting the required-permission metadata and the 403 response.
 */
export function RequirePermission(permission: Permission) {
  return applyDecorators(
    SetMetadata(REQUIRED_PERMISSION, permission),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: `Requires the ${permission} permission`,
    }),
  )
}
