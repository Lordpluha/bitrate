import type { Permission } from '@domain/access'

/**
 * The panel's navigation, as data.
 *
 * Three structural levels, each with its own visual treatment in `AppSidebar`, chosen so a
 * glance tells you what kind of thing you are looking at:
 *
 * - **Section** — a labelled block. Groups destinations that belong to the same job. Carries a
 *   small uppercase caption and vertical space, deliberately *not* a rule: rules between every
 *   group turn a short list into a ladder. Collapsed, the caption cannot shrink to an icon, so
 *   it is replaced by a hairline separator.
 * - **Link** — one destination. Icon plus label, whole row clickable, active state marked by a
 *   filled surface *and* a rail on the leading edge, so it survives both themes and does not
 *   rely on colour alone.
 * - **Group** — a collapsible parent with children. The trigger looks like a link but carries a
 *   chevron; children indent and drop their icons, gaining a vertical guide instead. Dropping
 *   the icon is the point: it stops five subordinate rows reading as five more equal
 *   destinations.
 *
 * Icon names come from `@ng-icons/lucide`, matching the icon set the React apps already use.
 */

export type NavLink = {
  kind: 'link'
  path: string
  /** A `nav.*` transloco key, not display text — see `app-sidebar.html`/`nav-item.html`. */
  label: string
  icon: string
  /** The item is hidden — not merely disabled — when the operator lacks this permission. */
  permission: Permission
  /**
   * `true` only for `/` — `routerLinkActive`'s default containment check would otherwise mark
   * every route "active" for a link to the root path, since every path descends from it.
   */
  exact?: boolean
}

export type NavGroup = {
  kind: 'group'
  /** Stable id, used as the collapse-state key. */
  id: string
  /** A `nav.*` transloco key, not display text. */
  label: string
  icon: string
  children: NavLink[]
}

export type NavItem = NavLink | NavGroup

export type NavSection = {
  /**
   * A `nav.section.*` transloco key, shown as the block caption when present. Hidden when the
   * sidebar is collapsed. Omit it for a lone-item section whose own link label would just repeat
   * it, e.g. "Overview" atop a single "Overview" link.
   */
  label?: string
  items: NavItem[]
}

/**
 * Sections, not a flat list, because an operator's day splits into distinct jobs: clearing the
 * review queue, keeping the catalog healthy, and managing accounts. The audit log sits apart
 * because it is the only read-only surface — nothing there is an action.
 */
export const NAV_SECTIONS: readonly NavSection[] = [
  {
    /** No caption: its one link is already labelled "Overview" — a caption above it would repeat it. */
    items: [
      {
        kind: 'link',
        path: '/',
        label: 'nav.overview',
        icon: 'lucideLayoutDashboard',
        permission: 'overview:read',
        exact: true,
      },
    ],
  },
  {
    label: 'nav.section.operations',
    items: [
      {
        kind: 'link',
        path: '/moderation',
        label: 'nav.moderation',
        icon: 'lucideFlag',
        permission: 'reports:read',
      },
      {
        kind: 'link',
        path: '/catalog',
        label: 'nav.catalog',
        icon: 'lucideAudioLines',
        permission: 'tracks:read',
      },
    ],
  },
  {
    label: 'nav.section.accounts',
    items: [
      {
        kind: 'link',
        path: '/artists',
        label: 'nav.artists',
        icon: 'lucideMic',
        permission: 'artists:read',
      },
      {
        kind: 'link',
        path: '/users',
        label: 'nav.users',
        icon: 'lucideUsers',
        permission: 'users:read',
      },
    ],
  },
  {
    label: 'nav.section.system',
    items: [
      {
        kind: 'link',
        path: '/audit',
        label: 'nav.audit',
        icon: 'lucideScrollText',
        permission: 'audit:read',
      },
      {
        kind: 'link',
        path: '/roles',
        label: 'nav.roles',
        icon: 'lucideKeyRound',
        permission: 'roles:read',
      },
      {
        kind: 'link',
        path: '/staff',
        label: 'nav.staff',
        icon: 'lucideUserCog',
        permission: 'staff:read',
      },
    ],
  },
]
