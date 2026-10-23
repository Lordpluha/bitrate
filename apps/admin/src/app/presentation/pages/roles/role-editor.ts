import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CreateRoleUseCase,
  GetRoleUseCase,
  ListPermissionCatalogueUseCase,
  UpdateRoleUseCase,
} from '@application/roles'
import { SessionStore } from '@application/session'
import type { Permission } from '@domain/access'
import { canEditRole, canRenameRole, type Role } from '@domain/role'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideCheck, lucideKeyRound, lucideShieldCheck, lucideUsers } from '@ng-icons/lucide'
import {
  KvRow,
  PageHeader,
  PermissionGrid,
  Skeleton,
  StateMessage,
  Tile,
  TileGrid,
} from '@presentation/components'
import { zodErrorMessage, zodValidator } from '@presentation/forms'
import { LocaleStore } from '@presentation/navigation'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { roleEditorSchema } from './role-editor.schema'
import { roleWriteError } from './role-write-error.message'

@Component({
  selector: 'app-role-editor',
  imports: [
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    KvRow,
    NgIcon,
    PageHeader,
    PermissionGrid,
    ReactiveFormsModule,
    Skeleton,
    StateMessage,
    Tile,
    TileGrid,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideCheck, lucideKeyRound, lucideShieldCheck, lucideUsers })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
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
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canWrite = inject(SessionStore).can('roles:write')
  protected readonly roleId = this.route.snapshot.paramMap.get('id')

  protected readonly role = signal<Role | null>(null)
  protected readonly heldBy = signal<Partial<Record<Permission, number>>>({})
  protected readonly loading = signal(true)
  protected readonly loadFailed = signal(false)
  protected readonly submitting = signal(false)
  protected readonly failure = signal<Notice | null>(null)
  protected readonly renamable = signal(true)
  /** The permission count the tile's meta shows — the form value is not a signal. */
  protected readonly selectedCount = signal(0)

  protected readonly form = new FormGroup(
    {
      name: new FormControl('', { nonNullable: true }),
      description: new FormControl('', { nonNullable: true }),
      permissions: new FormControl<Permission[]>([], { nonNullable: true }),
    },
    { validators: zodValidator(roleEditorSchema) },
  )

  protected readonly back = computed(() => ({ link: '/roles', label: this.t('roles.title') }))
  protected readonly failureText = computed(() => {
    const notice = this.failure()
    return notice === null ? null : this.t(notice.key, notice.params)
  })

  constructor() {
    void this.load()
  }

  /** The field's error as a transloco key, once the operator has touched it. */
  protected errorFor(field: 'name' | 'description'): string | null {
    const control = this.form.get(field)
    if (!control || !control.touched) return null

    return zodErrorMessage(control)
  }

  protected setPermissions(permissions: Permission[]): void {
    this.form.controls.permissions.setValue(permissions)
    this.selectedCount.set(permissions.length)
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
      this.failure.set(
        roleWriteError({
          error,
          name: this.form.controls.name.value,
          builtIn: this.role()?.builtIn,
        }),
      )
    } finally {
      this.submitting.set(false)
    }
  }

  protected async reload(): Promise<void> {
    await this.load()
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
    this.loading.set(true)
    this.loadFailed.set(false)
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
      this.selectedCount.set(role.permissions.length)

      if (!this.canWrite() || !canEditRole(role).allowed) this.form.disable()
      else if (!canRenameRole(role).allowed) {
        this.renamable.set(false)
        this.form.controls.name.disable()
      }
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
