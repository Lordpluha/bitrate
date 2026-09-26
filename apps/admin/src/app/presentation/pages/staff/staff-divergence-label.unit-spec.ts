import { describe, expect, it } from 'vitest'
import { staffDivergenceLabel } from './staff-divergence-label'
import type { StaffMember } from '@domain/staff'

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

describe('staffDivergenceLabel', () => {
  it('is null when the operator matches the template', () => {
    expect(staffDivergenceLabel(member())).toBeNull()
  })

  it('shows both counts and the role name when the operator both gained and lost permissions', () => {
    const label = staffDivergenceLabel(
      member({
        role: { id: 'role-id', name: 'MODERATOR', permissions: ['reports:read'] },
        permissions: ['staff:write', 'staff:read'],
      }),
    )

    expect(label).toBe('+2 / −1 vs MODERATOR')
  })

  it('is null for a built-in ADMIN holder', () => {
    const label = staffDivergenceLabel(
      member({ role: { id: 'admin-role', name: 'ADMIN', permissions: [] }, permissions: [] }),
    )

    expect(label).toBeNull()
  })
})
