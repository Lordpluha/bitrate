import { describe, expect, it } from 'vitest'
import type { Staff } from '@domain/staff'
import type { NavSection } from './nav.model'
import { visibleSections } from './visible-nav'

const MODERATOR: Staff = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  email: 'leo@bitrate.me',
  username: 'leo.mod',
  roleId: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
  roleName: 'Moderator',
  permissions: ['reports:read', 'users:read'],
}

const SECTIONS: readonly NavSection[] = [
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
        kind: 'group',
        id: 'people',
        label: 'nav.people',
        icon: 'lucideUsers',
        children: [
          {
            kind: 'link',
            path: '/users',
            label: 'nav.users',
            icon: 'lucideUsers',
            permission: 'users:read',
          },
          {
            kind: 'link',
            path: '/artists',
            label: 'nav.artists',
            icon: 'lucideMic',
            permission: 'artists:read',
          },
        ],
      },
    ],
  },
  {
    label: 'nav.section.system',
    items: [
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

describe('visibleSections', () => {
  it('keeps only the destinations the operator may open', () => {
    const [operations] = visibleSections(SECTIONS, MODERATOR)

    expect(operations?.items.map((item) => item.label)).toEqual(['nav.moderation'])
  })

  it('narrows a group to its permitted children', () => {
    const accounts = visibleSections(SECTIONS, MODERATOR)[1]
    const group = accounts?.items[0]

    expect(group?.kind === 'group' && group.children.map((child) => child.path)).toEqual(['/users'])
  })

  it('drops a section left with nothing in it', () => {
    const labels = visibleSections(SECTIONS, MODERATOR).map((section) => section.label)

    expect(labels).not.toContain('nav.section.system')
  })

  it('shows nothing to a signed-out visitor', () => {
    expect(visibleSections(SECTIONS, null)).toEqual([])
  })
})
