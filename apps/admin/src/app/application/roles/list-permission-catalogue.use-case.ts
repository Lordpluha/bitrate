import { inject, Injectable } from '@angular/core'
import { type PermissionCatalogueEntry, RoleRepository } from '@domain/role'

@Injectable({ providedIn: 'root' })
export class ListPermissionCatalogueUseCase {
  private readonly roles = inject(RoleRepository)

  execute(): Promise<PermissionCatalogueEntry[]> {
    return this.roles.listPermissionCatalogue()
  }
}
