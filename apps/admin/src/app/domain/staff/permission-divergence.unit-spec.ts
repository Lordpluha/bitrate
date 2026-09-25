import { describe, expect, it } from 'vitest'
import { permissionDivergence } from './permission-divergence'
import type { StaffMember } from './staff-member'

function member(overrides: Partial<StaffMember> = {}): StaffMember {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    email: 'ops@bitrate.me',
    username: 'ops',
    role: { id: 'role-id', name: 'MODERATOR', permissions: ['reports:read'] },
    permissions: ['reports:read'],
    deactivatedAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('permissionDivergence', () => {
  it('finds no diff when the operator matches the template', () => {
    expect(permissionDivergence(member())).toEqual({ missing: [], extra: [] })
  })

  it('reports what the operator is missing relative to the template', () => {
    const result = permissionDivergence(
      member({
        role: { id: 'role-id', name: 'MODERATOR', permissions: ['reports:read', 'artists:read'] },
        permissions: ['reports:read'],
      }),
    )

    expect(result).toEqual({ missing: ['artists:read'], extra: [] })
  })

  it('reports what the operator holds beyond the template', () => {
    const result = permissionDivergence(
      member({
        role: { id: 'role-id', name: 'MODERATOR', permissions: ['reports:read'] },
        permissions: ['reports:read', 'staff:write'],
      }),
    )

    expect(result).toEqual({ missing: [], extra: ['staff:write'] })
  })

  it('is null for a built-in ADMIN holder, even though their permissions array is empty', () => {
    const result = permissionDivergence(
      member({ role: { id: 'admin-role', name: 'ADMIN', permissions: [] }, permissions: [] }),
    )

    expect(result).toBeNull()
  })
})
