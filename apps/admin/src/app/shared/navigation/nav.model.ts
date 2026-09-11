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
  label: string
  icon: string
}

export type NavGroup = {
  kind: 'group'
  /** Stable id, used as the collapse-state key. */
  id: string
  label: string
  icon: string
  children: NavLink[]
}

export type NavItem = NavLink | NavGroup

export type NavSection = {
  /** Shown as the block caption. Hidden when the sidebar is collapsed. */
  label: string
  items: NavItem[]
}

/**
 * Sections, not a flat list, because an operator's day splits into distinct jobs: clearing the
 * review queue, keeping the catalog healthy, and managing accounts. The audit log sits apart
 * because it is the only read-only surface — nothing there is an action.
 */
export const NAV_SECTIONS: readonly NavSection[] = [
  {
    label: 'Operations',
    items: [
      {
        kind: 'link',
        path: '/moderation',
        label: 'Moderation queue',
        icon: 'lucideFlag',
      },
      {
        kind: 'link',
        path: '/catalog',
        label: 'Catalog pipeline',
        icon: 'lucideAudioLines',
      },
    ],
  },
  {
    label: 'Accounts',
    items: [
      { kind: 'link', path: '/artists', label: 'Artists', icon: 'lucideMic' },
      { kind: 'link', path: '/users', label: 'Listeners', icon: 'lucideUsers' },
    ],
  },
  {
    label: 'System',
    items: [
      {
        kind: 'link',
        path: '/audit',
        label: 'Audit log',
        icon: 'lucideScrollText',
      },
    ],
  },
]
