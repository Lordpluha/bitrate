import { inject, Injectable } from '@angular/core'
import { type Role, RoleRepository, type UpdateRoleInput } from '@domain/role'

@Injectable({ providedIn: 'root' })
export class UpdateRoleUseCase {
  private readonly roles = inject(RoleRepository)

  execute(input: UpdateRoleInput): Promise<Role> {
    return this.roles.update(input)
  }
}
