import { computed, Injectable, inject } from '@angular/core'
import { SessionStore } from '@application/session'
import { hasPermission } from '@domain/access'
import type { Staff } from '@domain/staff'
import { NAV_SECTIONS, type NavItem, type NavLink, type NavSection } from './nav.model'

/**
 * Sections and items filtered to what an operator may see. A group with no visible children
 * disappears with it, rather than showing an empty trigger; so does a section with no items.
 */
export function visibleSections(
  sections: readonly NavSection[],
  staff: Staff | null,
): readonly NavSection[] {
  const canSee = (item: NavItem): boolean =>
    item.kind === 'link'
      ? hasPermission({ staff, permission: item.permission })
      : item.children.some((child) => hasPermission({ staff, permission: child.permission }))

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter(canSee).map((item) =>
        item.kind === 'group'
          ? {
              ...item,
              children: item.children.filter((child) =>
                hasPermission({ staff, permission: child.permission }),
              ),
            }
          : item,
      ),
    }))
    .filter((section) => section.items.length > 0)
}

/**
 * The navigation the signed-in operator may use, shared by every surface that lists it: the
 * sidebar, the phone menu sheet, the command palette and the 404 page's shortcuts. One policy
 * — the same `hasPermission` the route guards use — so no surface offers a dead end.
 */
@Injectable({ providedIn: 'root' })
export class VisibleNav {
  private readonly staff = inject(SessionStore).currentStaff

  readonly sections = computed(() => visibleSections(NAV_SECTIONS, this.staff()))

  /** Every destination, flattened in sidebar order (group children included). */
  readonly links = computed<readonly NavLink[]>(() =>
    this.sections().flatMap((section) =>
      section.items.flatMap((item) => (item.kind === 'link' ? [item] : item.children)),
    ),
  )
}
