import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import {
  DeleteRoleUseCase,
  ListPermissionCatalogueUseCase,
  ListRolesUseCase,
} from '@application/roles'
import { SessionStore } from '@application/session'
import { canDeleteRole, type PermissionCatalogueEntry, type Role } from '@domain/role'
import { ActionNotAllowedError } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideChevronRight,
  lucideGitCompare,
  lucideKeyRound,
  lucidePlus,
  lucideShieldCheck,
  lucideTrash2,
  lucideUsers,
} from '@ng-icons/lucide'
import {
  CollectionStatus,
  MetricStrip,
  MetricTile,
  PageHeader,
  StateMessage,
  TablePanel,
  Tile,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { roleDeleteError } from './role-write-error.message'

const LOAD_ERROR = 'roles.error.load'

@Component({
  selector: 'app-roles',
  imports: [
    CollectionStatus,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    MetricStrip,
    MetricTile,
    NgIcon,
    PageHeader,
    RouterLink,
    StateMessage,
    TablePanel,
    Tile,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideChevronRight,
      lucideGitCompare,
      lucideKeyRound,
      lucidePlus,
      lucideShieldCheck,
      lucideTrash2,
      lucideUsers,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './roles.html',
})
export class RolesPage {
  private readonly listRoles = inject(ListRolesUseCase)
  private readonly listPermissionCatalogue = inject(ListPermissionCatalogueUseCase)
  private readonly deleteRole = inject(DeleteRoleUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canWrite = inject(SessionStore).can('roles:write')

  protected readonly roles = signal<Role[]>([])
  protected readonly catalogue = signal<PermissionCatalogueEntry[]>([])
  protected readonly loading = signal(true)
  protected readonly failure = signal<string | null>(null)
  protected readonly deleteError = signal<Notice | null>(null)
  protected readonly busyId = signal<string | null>(null)

  protected readonly failureText = computed(() =>
    this.failure() === null ? null : this.t(LOAD_ERROR),
  )
  protected readonly deleteErrorText = computed(() => {
    const notice = this.deleteError()
    return notice === null ? null : this.t(notice.key, notice.params)
  })

  /** The strip's figures, summed from the roles list and the catalogue — `null` until both load. */
  protected readonly stats = computed(() => {
    if (this.loading() || this.failure() !== null) return null
    const roles = this.roles()
    const catalogue = this.catalogue()
    return {
      roles: roles.length,
      builtIn: roles.filter((role) => role.builtIn).length,
      holders: roles.reduce((sum, role) => sum + role.holders, 0),
      divergent: roles.reduce((sum, role) => sum + role.divergentHolders, 0),
      permissions: catalogue.length,
      areas: new Set(catalogue.map((entry) => entry.permission.split(':')[0])).size,
    }
  })

  constructor() {
    void this.load()
  }

  /** Why this role can't be deleted, worded from its facts — `null` when it can be. */
  protected deleteBlock(role: Role): Notice | null {
    if (canDeleteRole(role).allowed) return null
    if (role.builtIn) return { key: 'roles.cannotDelete.builtIn' }
    return { key: 'roles.cannotDelete.inUse', params: { count: role.holders } }
  }

  protected async remove(role: Role): Promise<void> {
    this.busyId.set(role.id)
    this.deleteError.set(null)
    try {
      await this.deleteRole.execute(role)
      this.roles.set(this.roles().filter((candidate) => candidate.id !== role.id))
    } catch (error) {
      this.deleteError.set(
        error instanceof ActionNotAllowedError
          ? (this.deleteBlock(role) ?? { key: 'roles.error.delete' })
          : roleDeleteError(error),
      )
    } finally {
      this.busyId.set(null)
    }
  }

  protected async load(): Promise<void> {
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
      this.failure.set(LOAD_ERROR)
    } finally {
      this.loading.set(false)
    }
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
