import { inject, Injectable } from '@angular/core'
import { type CreateRoleInput, type Role, RoleRepository } from '@domain/role'

@Injectable({ providedIn: 'root' })
export class CreateRoleUseCase {
  private readonly roles = inject(RoleRepository)

  execute(input: CreateRoleInput): Promise<Role> {
    return this.roles.create(input)
  }
}
