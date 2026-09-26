import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { ListRolesUseCase } from '@application/roles'
import { CreateStaffUseCase } from '@application/staff'
import type { Permission } from '@domain/access'
import type { Role } from '@domain/role'
import { PermissionGrid } from '@presentation/components'
import { zodErrorMessage, zodValidator } from '@presentation/forms'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { staffCreateSchema } from './staff-create.schema'
import { staffWriteErrorMessage } from './staff-write-error.message'

@Component({
  selector: 'app-staff-create',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PermissionGrid,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './staff-create.html',
})
export class StaffCreatePage {
  private readonly router = inject(Router)
  private readonly createStaff = inject(CreateStaffUseCase)
  private readonly listRoles = inject(ListRolesUseCase)

  protected readonly roles = signal<Role[]>([])
  protected readonly loadingRoles = signal(true)
  protected readonly submitting = signal(false)
  protected readonly failure = signal<string | null>(null)

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

  constructor() {
    void this.loadRoles()
  }

  protected errorFor(field: 'email' | 'username' | 'password' | 'roleId'): string | null {
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
      this.failure.set(staffWriteErrorMessage({ error, operation: 'create' }))
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
      this.failure.set('Could not load roles.')
    } finally {
      this.loadingRoles.set(false)
    }
  }
}
