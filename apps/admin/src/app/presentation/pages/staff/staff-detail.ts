import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ListRolesUseCase } from '@application/roles'
import { SessionStore } from '@application/session'
import {
  AssignStaffRoleUseCase,
  DeactivateStaffUseCase,
  GetStaffUseCase,
  UpdateStaffPermissionsUseCase,
} from '@application/staff'
import type { Permission } from '@domain/access'
import { BUILT_IN_ADMIN_ROLE_NAME, type Role } from '@domain/role'
import { ActionNotAllowedError } from '@domain/shared'
import { canDeactivate, canEditPermissions, type StaffMember } from '@domain/staff'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideCheck,
  lucideKeyRound,
  lucideShieldCheck,
  lucideUser,
  lucideUserX,
} from '@ng-icons/lucide'
import {
  KvRow,
  PageHeader,
  PermissionGrid,
  Skeleton,
  StateMessage,
  Tile,
  TileGrid,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { LocalizedDatePipe } from '@presentation/pipes'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { staffDivergenceLabel } from './staff-divergence-label'
import { staffWriteError } from './staff-write-error.message'

/**
 * Over 100 lines: the permission editor, role reassignment and deactivation are three actions
 * on one operator that share load state and failure reporting — splitting the orchestration out
 * would just move it behind another injected service with no reuse to justify it.
 */
@Component({
  selector: 'app-staff-detail',
  imports: [
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmLabelImports,
    KvRow,
    LocalizedDatePipe,
    NgIcon,
    PageHeader,
    PermissionGrid,
    Skeleton,
    StateMessage,
    Tile,
    TileGrid,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ lucideCheck, lucideKeyRound, lucideShieldCheck, lucideUser, lucideUserX }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './staff-detail.html',
})
export class StaffDetailPage {
  private readonly route = inject(ActivatedRoute)
  private readonly getStaff = inject(GetStaffUseCase)
  private readonly listRoles = inject(ListRolesUseCase)
  private readonly updatePermissionsUseCase = inject(UpdateStaffPermissionsUseCase)
  private readonly assignRoleUseCase = inject(AssignStaffRoleUseCase)
  private readonly deactivateStaff = inject(DeactivateStaffUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canWrite = inject(SessionStore).can('staff:write')
  protected readonly staffId = this.route.snapshot.paramMap.get('id') ?? ''
  protected readonly builtInAdminRoleName = BUILT_IN_ADMIN_ROLE_NAME

  protected readonly member = signal<StaffMember | null>(null)
  protected readonly roles = signal<Role[]>([])
  protected readonly loading = signal(true)
  protected readonly loadFailed = signal(false)
  protected readonly failure = signal<Notice | null>(null)
  protected readonly permissions = signal<Permission[]>([])
  protected readonly selectedRoleId = signal('')
  protected readonly savingPermissions = signal(false)
  protected readonly reassigning = signal(false)
  protected readonly deactivating = signal(false)
  protected readonly confirmingDeactivate = signal(false)

  protected readonly back = computed(() => ({ link: '/staff', label: this.t('staff.title') }))
  protected readonly failureText = computed(() => {
    const notice = this.failure()
    return notice === null ? null : this.t(notice.key, notice.params)
  })
  /** Whether the header offers Deactivate — an active operator, and the right to change staff. */
  protected readonly deactivatable = computed(() => {
    const current = this.member()
    return current !== null && this.canWrite() && canDeactivate(current).allowed
  })

  constructor() {
    void this.load()
  }

  protected editable(member: StaffMember): boolean {
    return this.canWrite() && canEditPermissions(member).allowed
  }

  protected divergenceLabel(member: StaffMember): string | null {
    return staffDivergenceLabel(member)
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
        staffWriteError({
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
      this.failure.set(staffWriteError({ error, operation: 'assign-role' }))
    } finally {
      this.reassigning.set(false)
    }
  }

  protected armDeactivate(): void {
    this.confirmingDeactivate.set(true)
  }

  protected cancelDeactivate(): void {
    if (!this.deactivating()) this.confirmingDeactivate.set(false)
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
          ? { key: 'staff.alreadyDeactivated', params: { name: current.username } }
          : staffWriteError({ error, operation: 'deactivate' }),
      )
    } finally {
      this.deactivating.set(false)
      this.confirmingDeactivate.set(false)
    }
  }

  protected async reload(): Promise<void> {
    await this.load()
  }

  private async load(): Promise<void> {
    this.loading.set(true)
    this.loadFailed.set(false)
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
      this.loadFailed.set(true)
    } finally {
      this.loading.set(false)
    }
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
