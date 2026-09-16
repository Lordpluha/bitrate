import { describe, expect, it } from 'vitest'
import { canDeleteRole, canEditRole, canRenameRole } from './role-policy'
import type { Role } from './role'

function role(overrides: Partial<Role> = {}): Role {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    name: 'Catalog reviewer',
    description: null,
    builtIn: false,
    permissions: ['tracks:read'],
    holders: 0,
    divergentHolders: 0,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

const BUILT_IN_ADMIN = role({ name: 'ADMIN', builtIn: true })
const BUILT_IN_MODERATOR = role({ name: 'MODERATOR', builtIn: true })

describe('canEditRole', () => {
  it('refuses the built-in ADMIN role, with a reason', () => {
    const decision = canEditRole(BUILT_IN_ADMIN)

    expect(decision.allowed).toBe(false)
    expect(decision).toMatchObject({ reason: expect.stringContaining('cannot be edited') })
  })

  it('allows the built-in MODERATOR role', () => {
    expect(canEditRole(BUILT_IN_MODERATOR).allowed).toBe(true)
  })

  it('allows a custom role', () => {
    expect(canEditRole(role()).allowed).toBe(true)
  })
})

describe('canRenameRole', () => {
  it('refuses any built-in role, with a reason', () => {
    expect(canRenameRole(BUILT_IN_ADMIN)).toMatchObject({ allowed: false, reason: expect.any(String) })
    expect(canRenameRole(BUILT_IN_MODERATOR)).toMatchObject({ allowed: false, reason: expect.any(String) })
  })

  it('allows a custom role', () => {
    expect(canRenameRole(role()).allowed).toBe(true)
  })
})

describe('canDeleteRole', () => {
  it('refuses a built-in role even with no holders, with a reason', () => {
    const decision = canDeleteRole(role({ ...BUILT_IN_ADMIN, holders: 0 }))

    expect(decision).toMatchObject({ allowed: false, reason: expect.stringContaining('Built-in') })
  })

  it('refuses a custom role still in use, naming the holder count', () => {
    const decision = canDeleteRole(role({ holders: 3 }))

    expect(decision).toMatchObject({ allowed: false, reason: expect.stringContaining('3 active') })
  })

  it('allows a custom role with no holders', () => {
    expect(canDeleteRole(role({ holders: 0 })).allowed).toBe(true)
  })
})
