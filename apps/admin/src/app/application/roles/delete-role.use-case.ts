import { inject, Injectable } from '@angular/core'
import { canDeleteRole, type Role, RoleRepository } from '@domain/role'
import { ActionNotAllowedError } from '@domain/shared'

@Injectable({ providedIn: 'root' })
export class DeleteRoleUseCase {
  private readonly roles = inject(RoleRepository)

  /**
   * @throws {ActionNotAllowedError} When `canDeleteRole` already says no — built-in, or still
   * in use. The API re-checks the same rules on its own; this only spares a doomed request.
   */
  async execute(role: Role): Promise<void> {
    const decision = canDeleteRole(role)
    if (!decision.allowed) throw new ActionNotAllowedError(decision.reason)

    await this.roles.delete(role.id)
  }
}
