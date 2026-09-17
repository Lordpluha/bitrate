import { describe, expect, it } from 'vitest'
import { staffCreateSchema } from './staff-create.schema'

const VALID = {
  email: 'ops@bitrate.me',
  username: 'ops',
  password: 'correct-horse-battery',
  roleId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  permissions: ['tracks:read'],
}

describe('staffCreateSchema', () => {
  it('accepts a valid submission', () => {
    expect(staffCreateSchema.safeParse(VALID).success).toBe(true)
  })

  it('rejects a password under 12 characters', () => {
    const result = staffCreateSchema.safeParse({ ...VALID, password: 'short' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('at least 12 characters')
    }
  })

  it('accepts a password of exactly 12 characters', () => {
    expect(staffCreateSchema.safeParse({ ...VALID, password: '123456789012' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(staffCreateSchema.safeParse({ ...VALID, email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects an empty role selection', () => {
    expect(staffCreateSchema.safeParse({ ...VALID, roleId: '' }).success).toBe(false)
  })

  it('rejects a protected permission even if one slipped through', () => {
    const result = staffCreateSchema.safeParse({ ...VALID, permissions: ['staff:write'] })

    expect(result.success).toBe(false)
  })
})
