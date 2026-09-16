import { inject, Injectable } from '@angular/core'
import { type Role, RoleRepository } from '@domain/role'

@Injectable({ providedIn: 'root' })
export class GetRoleUseCase {
  private readonly roles = inject(RoleRepository)

  execute(id: string): Promise<Role> {
    return this.roles.get(id)
  }
}
