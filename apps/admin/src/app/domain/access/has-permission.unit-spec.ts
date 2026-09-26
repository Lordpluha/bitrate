import { describe, expect, it } from 'vitest'
import { hasPermission } from './has-permission'

describe('hasPermission', () => {
  it('is true when the operator holds the permission', () => {
    const staff = { roleName: 'MODERATOR', permissions: ['reports:read' as const] }

    expect(hasPermission({ staff, permission: 'reports:read' })).toBe(true)
  })

  it('is false when the operator does not hold the permission', () => {
    const staff = { roleName: 'MODERATOR', permissions: ['reports:read' as const] }

    expect(hasPermission({ staff, permission: 'artists:delete' })).toBe(false)
  })

  it('is true for ADMIN by identity, even with an empty permission set', () => {
    const staff = { roleName: 'ADMIN', permissions: [] }

    expect(hasPermission({ staff, permission: 'staff:write' })).toBe(true)
  })

  it('is false for any permission when nothing is held', () => {
    const staff = { roleName: 'MODERATOR', permissions: [] }

    expect(hasPermission({ staff, permission: 'reports:read' })).toBe(false)
  })

  it('is false when no operator is signed in', () => {
    expect(hasPermission({ staff: null, permission: 'reports:read' })).toBe(false)
  })
})
