import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import { PERMISSIONS, type Permission, PROTECTED_PERMISSIONS } from '@domain/access'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'

type PermissionGroup = { resource: string; permissions: Permission[] }

const PROTECTED_SET = new Set<Permission>(PROTECTED_PERMISSIONS)

/**
 * Every grantable permission, grouped by resource (the prefix before `:`) and rendered as one
 * labelled `<fieldset>` per group.
 *
 * Shared by the roles editor and the staff screens (a later stage): `heldBy` is optional so a
 * caller with holder counts (roles) can show them per permission and a caller without (an
 * individual operator's overrides) can simply omit it. `selected`/`selectedChange` is a plain
 * value-plus-event pair rather than a `ControlValueAccessor`, so either caller can drive it from
 * a `FormControl` (`[selected]="form.controls.permissions.value"`,
 * `(selectedChange)="form.controls.permissions.setValue($event)"`) or from a plain signal with no
 * form at all.
 */
@Component({
  selector: 'app-permission-grid',
  imports: [HlmBadgeImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './permission-grid.html',
})
export class PermissionGrid {
  readonly selected = input.required<Permission[]>()
  readonly hideProtected = input(false)
  readonly heldBy = input<Partial<Record<Permission, number>>>()
  readonly disabled = input(false)

  readonly selectedChange = output<Permission[]>()

  protected readonly groups = computed<PermissionGroup[]>(() => {
    const visible = this.hideProtected()
      ? PERMISSIONS.filter((permission) => !PROTECTED_SET.has(permission))
      : [...PERMISSIONS]

    const byResource = new Map<string, Permission[]>()
    for (const permission of visible) {
      const resource = permission.split(':')[0] ?? permission
      byResource.set(resource, [...(byResource.get(resource) ?? []), permission])
    }

    return [...byResource.entries()].map(([resource, permissions]) => ({ resource, permissions }))
  })

  protected isChecked(permission: Permission): boolean {
    return this.selected().includes(permission)
  }

  /** `null` when `heldBy` was not given at all — distinct from an actual count of zero. */
  protected heldByFor(permission: Permission): number | null {
    return this.heldBy()?.[permission] ?? null
  }

  protected toggle(permission: Permission, checked: boolean): void {
    const current = this.selected()
    const next = checked ? [...current, permission] : current.filter((held) => held !== permission)

    this.selectedChange.emit(next)
  }
}
