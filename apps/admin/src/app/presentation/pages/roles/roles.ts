import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { DeleteRoleUseCase, ListPermissionCatalogueUseCase, ListRolesUseCase } from '@application/roles'
import { SessionStore } from '@application/session'
import { canDeleteRole, type PermissionCatalogueEntry, type Role, type RolePolicyDecision } from '@domain/role'
import { ActionNotAllowedError } from '@domain/shared'
import { CollectionStatus } from '@presentation/components'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { roleDeleteErrorMessage } from './role-write-error.message'

@Component({
  selector: 'app-roles',
  imports: [RouterLink, CollectionStatus, HlmBadgeImports, HlmButtonImports, HlmTableImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './roles.html',
})
export class RolesPage {
  private readonly listRoles = inject(ListRolesUseCase)
  private readonly listPermissionCatalogue = inject(ListPermissionCatalogueUseCase)
  private readonly deleteRole = inject(DeleteRoleUseCase)

  protected readonly canWrite = inject(SessionStore).can('roles:write')

  protected readonly roles = signal<Role[]>([])
  protected readonly catalogue = signal<PermissionCatalogueEntry[]>([])
  protected readonly loading = signal(true)
  protected readonly failure = signal<string | null>(null)
  protected readonly busyId = signal<string | null>(null)

  constructor() {
    void this.load()
  }

  protected deletion(role: Role): RolePolicyDecision {
    return canDeleteRole(role)
  }

  protected async remove(role: Role): Promise<void> {
    this.busyId.set(role.id)
    try {
      await this.deleteRole.execute(role)
      this.roles.set(this.roles().filter((candidate) => candidate.id !== role.id))
    } catch (error) {
      this.failure.set(
        error instanceof ActionNotAllowedError ? error.message : roleDeleteErrorMessage(error),
      )
    } finally {
      this.busyId.set(null)
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    this.failure.set(null)
    try {
      const [roles, catalogue] = await Promise.all([
        this.listRoles.execute(),
        this.listPermissionCatalogue.execute(),
      ])
      this.roles.set(roles)
      this.catalogue.set(catalogue)
    } catch {
      this.failure.set('Could not load roles.')
    } finally {
      this.loading.set(false)
    }
  }
}
