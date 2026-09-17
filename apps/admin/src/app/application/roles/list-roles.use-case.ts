import { inject, Injectable } from '@angular/core'
import { type Role, RoleRepository } from '@domain/role'

@Injectable({ providedIn: 'root' })
export class ListRolesUseCase {
  private readonly roles = inject(RoleRepository)

  execute(): Promise<Role[]> {
    return this.roles.list()
  }
}
