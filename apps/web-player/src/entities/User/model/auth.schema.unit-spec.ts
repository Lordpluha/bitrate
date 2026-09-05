import { describe, expect, it } from 'vitest'
import { loginSchema, registrationSchema } from './auth.schema'

describe('auth schemas', () => {
  it('accepts existing credentials without applying registration strength rules', () => {
    expect(
      loginSchema.safeParse({
        email: 'listener@example.com',
        password: 'legacy',
      }).success,
    ).toBe(true)
  })

  it('continues to enforce strong passwords for registration', () => {
    expect(
      registrationSchema.safeParse({
        confirmPassword: 'legacy',
        email: 'listener@example.com',
        fullName: 'Listener',
        password: 'legacy',
      }).success,
    ).toBe(false)
  })
})
