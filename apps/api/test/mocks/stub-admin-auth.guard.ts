import { hasPermission, type Permission, REQUIRED_PERMISSION } from '@modules/admin-auth'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'

/**
 * Simulates the real guard's permission check off the real `@RequirePermission(...)` metadata,
 * for integration specs that override `AdminAuthGuard`.
 *
 * Always attaches a non-built-in staff identity — pass every permission a "full access" case
 * needs, rather than relying on the built-in ADMIN bypass, which is covered by
 * `has-permission.unit-spec.ts` instead.
 */
export class StubAdminAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: Permission[],
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission | undefined>(REQUIRED_PERMISSION, [
      context.getHandler(),
      context.getClass(),
    ])

    const staff = {
      id: 'staff-1',
      permissions: this.permissions,
      role: { name: 'MODERATOR', builtIn: false },
    }

    if (required && !hasPermission({ staff, permission: required })) return false

    ;(context.switchToHttp().getRequest() as Record<string, unknown>).staff = staff
    return true
  }
}
