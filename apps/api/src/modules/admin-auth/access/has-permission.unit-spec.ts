import { describe, expect, it } from '@jest/globals'
import { hasPermission } from './has-permission'

describe('hasPermission', () => {
  it('lets a built-in ADMIN pass any permission, even with an empty permissions array', () => {
    const staff = { permissions: [], role: { name: 'ADMIN', builtIn: true } }

    expect(hasPermission({ staff, permission: 'staff:write' })).toBe(true)
  })

  it('passes a MODERATOR holding the listed permission', () => {
    const staff = { permissions: ['artists:read'], role: { name: 'MODERATOR', builtIn: false } }

    expect(hasPermission({ staff, permission: 'artists:read' })).toBe(true)
  })

  it('rejects a MODERATOR missing the permission', () => {
    const staff = { permissions: ['artists:read'], role: { name: 'MODERATOR', builtIn: false } }

    expect(hasPermission({ staff, permission: 'artists:delete' })).toBe(false)
  })

  it('rejects an empty permission set', () => {
    const staff = { permissions: [], role: { name: 'MODERATOR', builtIn: false } }

    expect(hasPermission({ staff, permission: 'artists:read' })).toBe(false)
  })

  it('ignores a stale unknown string stored in the permissions array', () => {
    const staff = {
      permissions: ['artists:read', 'artists:publish-legacy'],
      role: { name: 'MODERATOR', builtIn: false },
    }

    expect(hasPermission({ staff, permission: 'artists:read' })).toBe(true)
    expect(hasPermission({ staff, permission: 'tracks:reprocess' })).toBe(false)
  })

  it('does not let a role merely named ADMIN bypass without builtIn', () => {
    const staff = { permissions: [], role: { name: 'ADMIN', builtIn: false } }

    expect(hasPermission({ staff, permission: 'artists:read' })).toBe(false)
  })
})
