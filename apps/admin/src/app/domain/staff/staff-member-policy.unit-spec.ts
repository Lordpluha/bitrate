import { describe, expect, it } from 'vitest'
import { canDeactivate, canEditPermissions } from './staff-member-policy'
import type { StaffMember } from './staff-member'

function member(overrides: Partial<StaffMember> = {}): StaffMember {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    email: 'ops@bitrate.me',
    username: 'ops',
    role: {
      id: 'c1b1d2e3-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
      name: 'MODERATOR',
      permissions: ['tracks:read'],
    },
    permissions: ['tracks:read'],
    deactivatedAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

const BUILT_IN_ADMIN_HOLDER = member({
  role: { id: 'admin-role', name: 'ADMIN', permissions: [] },
  permissions: [],
})

const CUSTOM_ROLE_HOLDER = member({
  role: {
    id: 'custom-role',
    name: 'Catalog reviewer',
    permissions: ['tracks:read', 'tracks:reprocess'],
  },
  permissions: ['tracks:read'],
})

describe('canEditPermissions', () => {
  it('refuses a built-in ADMIN holder, with a reason', () => {
    const decision = canEditPermissions(BUILT_IN_ADMIN_HOLDER)

    expect(decision.allowed).toBe(false)
    expect(decision).toMatchObject({
      reason: expect.stringContaining('cannot have its permissions edited'),
    })
  })

  it('allows a MODERATOR holder', () => {
    expect(canEditPermissions(member()).allowed).toBe(true)
  })

  it('allows a custom-role holder', () => {
    expect(canEditPermissions(CUSTOM_ROLE_HOLDER).allowed).toBe(true)
  })
})

describe('canDeactivate', () => {
  it('refuses an operator already deactivated, naming them', () => {
    const decision = canDeactivate(member({ deactivatedAt: new Date('2026-09-10T00:00:00.000Z') }))

    expect(decision).toMatchObject({ allowed: false, reason: expect.stringContaining('ops') })
  })

  it('allows an active operator', () => {
    expect(canDeactivate(member({ deactivatedAt: null })).allowed).toBe(true)
  })
})
