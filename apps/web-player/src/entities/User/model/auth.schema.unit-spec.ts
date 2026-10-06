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
        acceptLegal: true,
        confirmPassword: 'legacy',
        email: 'listener@example.com',
        fullName: 'Listener',
        password: 'legacy',
      }).success,
    ).toBe(false)
  })

  describe('legal acceptance', () => {
    const validRegistration = {
      confirmPassword: 'Str0ng!Passw0rd',
      email: 'listener@example.com',
      fullName: 'Listener',
      password: 'Str0ng!Passw0rd',
    }

    it('accepts a registration once the legal documents are accepted', () => {
      expect(
        registrationSchema.safeParse({
          ...validRegistration,
          acceptLegal: true,
        }).success,
      ).toBe(true)
    })

    it.each([
      ['unchecked', false],
      ['missing', undefined],
    ])(
      'rejects a registration when acceptance is %s',
      (_label, acceptLegal) => {
        const result = registrationSchema.safeParse({
          ...validRegistration,
          acceptLegal,
        })

        expect(result.success).toBe(false)
        expect(
          result.error?.issues.map((issue) => issue.path.join('.')),
        ).toContain('acceptLegal')
      },
    )
  })
})
