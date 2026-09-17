import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { ListRolesUseCase } from '@application/roles'
import { SessionStore } from '@application/session'
import {
  AssignStaffRoleUseCase,
  DeactivateStaffUseCase,
  GetStaffUseCase,
  UpdateStaffPermissionsUseCase,
} from '@application/staff'
import type { Permission } from '@domain/access'
import { BUILT_IN_ADMIN_ROLE_NAME, type Role, type RolePolicyDecision } from '@domain/role'
import { ActionNotAllowedError } from '@domain/shared'
import { canDeactivate, canEditPermissions, type StaffMember } from '@domain/staff'
import { PermissionGrid } from '@presentation/components'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { staffDivergenceLabel } from './staff-divergence-label'
import { staffWriteErrorMessage } from './staff-write-error.message'

/**
 * Over 100 lines: the permission editor, role reassignment and deactivation are three actions
 * on one operator that share load state and failure reporting — splitting the orchestration out
 * would just move it behind another injected service with no reuse to justify it.
 */
@Component({
  selector: 'app-staff-detail',
  imports: [RouterLink, PermissionGrid, HlmBadgeImports, HlmButtonImports, HlmInputImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './staff-detail.html',
})
export class StaffDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getStaff = inject(GetStaffUseCase)
  private readonly listRoles = inject(ListRolesUseCase)
  private readonly updatePermissionsUseCase = inject(UpdateStaffPermissionsUseCase)
  private readonly assignRoleUseCase = inject(AssignStaffRoleUseCase)
  private readonly deactivateStaff = inject(DeactivateStaffUseCase)

  protected readonly canWrite = inject(SessionStore).can('staff:write')
  protected readonly staffId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly builtInAdminRoleName = BUILT_IN_ADMIN_ROLE_NAME

  protected readonly member = signal<StaffMember | null>(null)
  protected readonly roles = signal<Role[]>([])
  protected readonly loading = signal(true)
  protected readonly failure = signal<string | null>(null)
  protected readonly permissions = signal<Permission[]>([])
  protected readonly selectedRoleId = signal('')
  protected readonly savingPermissions = signal(false)
  protected readonly reassigning = signal(false)
  protected readonly deactivating = signal(false)
  protected readonly confirmingDeactivate = signal(false)

  constructor() {
    void this.load()
  }

  protected editable(member: StaffMember): boolean {
    return this.canWrite() && canEditPermissions(member).allowed
  }

  protected divergenceLabel(member: StaffMember): string | null {
    return staffDivergenceLabel(member)
  }

  protected deactivation(member: StaffMember): RolePolicyDecision {
    return canDeactivate(member)
  }

  protected setPermissions(permissions: Permission[]): void {
    this.permissions.set(permissions)
  }

  protected onSelectRole(roleId: string): void {
    this.selectedRoleId.set(roleId)
  }

  protected async savePermissions(): Promise<void> {
    const current = this.member()
    if (!current) return

    this.savingPermissions.set(true)
    this.failure.set(null)
    try {
      const updated = await this.updatePermissionsUseCase.execute({
        id: current.id,
        permissions: this.permissions(),
      })
      this.member.set(updated)
    } catch (error) {
      this.failure.set(
        staffWriteErrorMessage({
          error,
          operation: 'update-permissions',
          targetIsBuiltInAdmin: current.role.name === this.builtInAdminRoleName,
        }),
      )
    } finally {
      this.savingPermissions.set(false)
    }
  }

  protected async confirmReassign(): Promise<void> {
    const current = this.member()
    const roleId = this.selectedRoleId()
    if (!current || !roleId || roleId === current.role.id) return

    this.reassigning.set(true)
    this.failure.set(null)
    try {
      const updated = await this.assignRoleUseCase.execute({ id: current.id, roleId })
      this.member.set(updated)
      this.permissions.set(updated.permissions)
      this.selectedRoleId.set(updated.role.id)
    } catch (error) {
      this.failure.set(staffWriteErrorMessage({ error, operation: 'assign-role' }))
    } finally {
      this.reassigning.set(false)
    }
  }

  protected armDeactivate(): void {
    this.confirmingDeactivate.set(true)
  }

  protected cancelDeactivate(): void {
    this.confirmingDeactivate.set(false)
  }

  protected async deactivate(): Promise<void> {
    const current = this.member()
    if (!current) return

    this.deactivating.set(true)
    this.failure.set(null)
    try {
      const updated = await this.deactivateStaff.execute(current)
      this.member.set(updated)
    } catch (error) {
      this.failure.set(
        error instanceof ActionNotAllowedError
          ? error.message
          : staffWriteErrorMessage({ error, operation: 'deactivate' }),
      )
    } finally {
      this.deactivating.set(false)
      this.confirmingDeactivate.set(false)
    }
  }

  private async load(): Promise<void> {
    try {
      const [member, roles] = await Promise.all([
        this.getStaff.execute(this.staffId),
        this.listRoles.execute(),
      ])
      this.member.set(member)
      this.roles.set(roles)
      this.permissions.set(member.permissions)
      this.selectedRoleId.set(member.role.id)
    } catch {
      this.failure.set('Could not load this operator.')
    } finally {
      this.loading.set(false)
    }
  }
}
