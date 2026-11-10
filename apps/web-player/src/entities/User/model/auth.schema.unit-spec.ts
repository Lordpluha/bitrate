import { isTranslationKey } from '@shared/i18n'
import { describe, expect, it } from 'vitest'
import { loginSchema, registrationSchema } from './auth.schema'

describe('auth schemas', () => {
  it('accepts existing credentials without applying registration strength rules', () => {
    expect(
      loginSchema.safeParse({
        acceptLegal: true,
        email: 'listener@example.com',
        password: 'legacy',
      }).success,
    ).toBe(true)
  })

  it.each([
    ['unchecked', false],
    ['missing', undefined],
  ])('rejects a sign-in when acceptance is %s', (_label, acceptLegal) => {
    const result = loginSchema.safeParse({
      acceptLegal,
      email: 'listener@example.com',
      password: 'legacy',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toEqual([
      'acceptLegal',
    ])
  })

  it('registers with a name, an email and one password — no confirmation field', () => {
    const result = registrationSchema.safeParse({
      acceptLegal: true,
      email: 'listener@example.com',
      fullName: 'Listener',
      password: 'Str0ng!Passw0rd',
    })

    expect(result.success).toBe(true)
    expect(result.data).not.toHaveProperty('confirmPassword')
  })

  it('continues to enforce strong passwords for registration', () => {
    expect(
      registrationSchema.safeParse({
        acceptLegal: true,
        email: 'listener@example.com',
        fullName: 'Listener',
        password: 'legacy',
      }).success,
    ).toBe(false)
  })

  it('reports every problem as an i18n catalog key, so forms can translate it', () => {
    const issues = [
      ...(loginSchema.safeParse({ email: 'nope', password: 'x' }).error
        ?.issues ?? []),
      ...(registrationSchema.safeParse({
        acceptLegal: false,
        email: 'nope',
        fullName: 'X1',
        password: 'short',
      }).error?.issues ?? []),
    ]

    expect(issues.length).toBeGreaterThan(0)
    for (const issue of issues) {
      expect(isTranslationKey(issue.message), issue.message).toBe(true)
    }
  })

  describe('legal acceptance', () => {
    const validRegistration = {
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
