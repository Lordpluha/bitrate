import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import {
  CreateRoleUseCase,
  GetRoleUseCase,
  ListPermissionCatalogueUseCase,
  UpdateRoleUseCase,
} from '@application/roles'
import { SessionStore } from '@application/session'
import type { Permission } from '@domain/access'
import { canEditRole, canRenameRole, type Role } from '@domain/role'
import { PermissionGrid } from '@presentation/components'
import { zodErrorMessage, zodValidator } from '@presentation/forms'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { roleEditorSchema } from './role-editor.schema'
import { roleWriteErrorMessage } from './role-write-error.message'

@Component({
  selector: 'app-role-editor',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PermissionGrid,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-editor.html',
})
/**
 * Over 100 lines: the create/edit form, the built-in edit/rename policy, and the load/save error
 * mapping are one cohesive screen — splitting the load/save orchestration out would just move it
 * behind another injected service with no reuse to justify it.
 */
export class RoleEditorPage {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly getRole = inject(GetRoleUseCase)
  private readonly createRole = inject(CreateRoleUseCase)
  private readonly updateRole = inject(UpdateRoleUseCase)
  private readonly listPermissionCatalogue = inject(ListPermissionCatalogueUseCase)

  protected readonly canWrite = inject(SessionStore).can('roles:write')
  protected readonly roleId = this.route.snapshot.paramMap.get('id')

  protected readonly role = signal<Role | null>(null)
  protected readonly heldBy = signal<Partial<Record<Permission, number>>>({})
  protected readonly loading = signal(this.roleId !== null)
  protected readonly submitting = signal(false)
  protected readonly failure = signal<string | null>(null)
  protected readonly renamable = signal(true)

  protected readonly form = new FormGroup(
    {
      name: new FormControl('', { nonNullable: true }),
      description: new FormControl('', { nonNullable: true }),
      permissions: new FormControl<Permission[]>([], { nonNullable: true }),
    },
    { validators: zodValidator(roleEditorSchema) },
  )

  constructor() {
    void this.load()
  }

  protected errorFor(field: 'name' | 'description'): string | null {
    const control = this.form.get(field)
    if (!control || !control.touched) return null

    return zodErrorMessage(control)
  }

  protected setPermissions(permissions: Permission[]): void {
    this.form.controls.permissions.setValue(permissions)
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched()
    this.failure.set(null)
    if (this.form.invalid || this.submitting()) return

    this.submitting.set(true)
    try {
      const saved = await this.save()
      await this.router.navigate(['/roles', saved.id])
    } catch (error) {
      const currentRole = this.role()
      this.failure.set(
        roleWriteErrorMessage({
          error,
          name: this.form.controls.name.value,
          builtIn: currentRole?.builtIn,
        }),
      )
    } finally {
      this.submitting.set(false)
    }
  }

  private save(): Promise<Role> {
    const values = this.form.getRawValue()

    if (this.roleId === null) {
      return this.createRole.execute({
        name: values.name,
        description: values.description || undefined,
        permissions: values.permissions,
      })
    }

    return this.updateRole.execute({
      id: this.roleId,
      ...(this.renamable() && { name: values.name }),
      description: values.description || null,
      permissions: values.permissions,
    })
  }

  private async load(): Promise<void> {
    try {
      const catalogue = await this.listPermissionCatalogue.execute()
      this.heldBy.set(
        Object.fromEntries(catalogue.map((entry) => [entry.permission, entry.heldBy])),
      )

      if (this.roleId === null) return

      const role = await this.getRole.execute(this.roleId)
      this.role.set(role)
      this.form.setValue({
        name: role.name,
        description: role.description ?? '',
        permissions: role.permissions,
      })

      if (!this.canWrite() || !canEditRole(role).allowed) this.form.disable()
      else if (!canRenameRole(role).allowed) {
        this.renamable.set(false)
        this.form.controls.name.disable()
      }
    } catch {
      this.failure.set('Could not load this role.')
    } finally {
      this.loading.set(false)
    }
  }
}
