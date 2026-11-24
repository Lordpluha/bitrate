import { validateCode, validateEmail, validatePassword, validateUsername } from './validate-fields'

describe('auth field validation', () => {
  it('accepts a well-formed email and rejects others', () => {
    expect(validateEmail(' maya@bitrate.app ')).toBeNull()
    expect(validateEmail('maya@')).toBe('auth.validation.email')
    expect(validateEmail('')).toBe('auth.validation.email')
  })

  it('enforces the API password length of 6 to 32', () => {
    expect(validatePassword('12345')).toBe('auth.validation.password')
    expect(validatePassword('123456')).toBeNull()
    expect(validatePassword('x'.repeat(33))).toBe('auth.validation.password')
  })

  it('enforces the API username length of 3 to 20', () => {
    expect(validateUsername('ab')).toBe('auth.validation.username')
    expect(validateUsername('maya')).toBeNull()
    expect(validateUsername('x'.repeat(21))).toBe('auth.validation.username')
  })

  it('wants exactly six digits for a 2FA code', () => {
    expect(validateCode('123456')).toBeNull()
    expect(validateCode('12345')).toBe('auth.validation.code')
    expect(validateCode('12345a')).toBe('auth.validation.code')
  })
})
