import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { ListRolesUseCase } from '@application/roles'
import { CreateStaffUseCase } from '@application/staff'
import type { Permission } from '@domain/access'
import type { Role } from '@domain/role'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideCheck, lucideKeyRound, lucideShieldCheck, lucideUser } from '@ng-icons/lucide'
import { PageHeader, PermissionGrid, StateMessage, Tile, TileGrid } from '@presentation/components'
import { zodErrorMessage, zodValidator } from '@presentation/forms'
import { LocaleStore } from '@presentation/navigation'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { MIN_PASSWORD_LENGTH, staffCreateSchema } from './staff-create.schema'
import { staffWriteError } from './staff-write-error.message'

type StaffCreateField = 'email' | 'username' | 'password' | 'roleId'

@Component({
  selector: 'app-staff-create',
  imports: [
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    NgIcon,
    PageHeader,
    PermissionGrid,
    ReactiveFormsModule,
    StateMessage,
    Tile,
    TileGrid,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideCheck, lucideKeyRound, lucideShieldCheck, lucideUser })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './staff-create.html',
})
export class StaffCreatePage {
  private readonly router = inject(Router)
  private readonly createStaff = inject(CreateStaffUseCase)
  private readonly listRoles = inject(ListRolesUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly minPassword = MIN_PASSWORD_LENGTH
  protected readonly roles = signal<Role[]>([])
  protected readonly loadingRoles = signal(true)
  protected readonly submitting = signal(false)
  protected readonly failure = signal<Notice | null>(null)

  /** Whether the administrator adjusted the template's preview — the override-vs-copy switch. */
  protected readonly permissionsTouched = signal(false)

  protected readonly form = new FormGroup(
    {
      email: new FormControl('', { nonNullable: true }),
      username: new FormControl('', { nonNullable: true }),
      password: new FormControl('', { nonNullable: true }),
      roleId: new FormControl('', { nonNullable: true }),
      permissions: new FormControl<Permission[]>([], { nonNullable: true }),
    },
    { validators: zodValidator(staffCreateSchema) },
  )

  protected readonly back = computed(() => ({ link: '/staff', label: this.t('staff.title') }))
  protected readonly failureText = computed(() => {
    const notice = this.failure()
    return notice === null ? null : this.t(notice.key, notice.params)
  })

  constructor() {
    void this.loadRoles()
  }

  /** The field's error as a transloco key, once the operator has touched it. */
  protected errorFor(field: StaffCreateField): string | null {
    const control = this.form.get(field)
    if (!control || !control.touched) return null

    return zodErrorMessage(control)
  }

  /** Repopulates the preview from the newly chosen template and resets the adjusted-flag. */
  protected onRoleChange(roleId: string): void {
    this.form.controls.roleId.setValue(roleId)
    const role = this.roles().find((candidate) => candidate.id === roleId)
    this.form.controls.permissions.setValue(role?.permissions ?? [])
    this.permissionsTouched.set(false)
  }

  protected setPermissions(permissions: Permission[]): void {
    this.form.controls.permissions.setValue(permissions)
    this.permissionsTouched.set(true)
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched()
    this.failure.set(null)
    if (this.form.invalid || this.submitting()) return

    this.submitting.set(true)
    try {
      const created = await this.createStaff.execute(this.createInput())
      await this.router.navigate(['/staff', created.id])
    } catch (error) {
      this.failure.set(staffWriteError({ error, operation: 'create' }))
    } finally {
      this.submitting.set(false)
    }
  }

  private createInput() {
    const values = this.form.getRawValue()

    return {
      email: values.email,
      username: values.username,
      password: values.password,
      roleId: values.roleId,
      ...(this.permissionsTouched() && { permissions: values.permissions }),
    }
  }

  private async loadRoles(): Promise<void> {
    try {
      this.roles.set(await this.listRoles.execute())
    } catch {
      this.failure.set({ key: 'operator.error.loadRoles' })
    } finally {
      this.loadingRoles.set(false)
    }
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
