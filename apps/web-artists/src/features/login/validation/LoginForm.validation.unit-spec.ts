import { describe, expect, it } from 'vitest'
import { loginSchema } from './LoginForm.validation'

/** First error reported for a field, or `undefined` when the field validated. */
function errorFor(value: unknown, field: string): string | undefined {
  const result = loginSchema.safeParse(value)
  if (result.success) return undefined

  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('loginSchema', () => {
  it('accepts a well-formed credential pair', () => {
    const result = loginSchema.safeParse({
      email: 'artist@bitrate.me',
      password: 'hunter2',
    })

    expect(result.success).toBe(true)
  })

  describe('email', () => {
    /**
     * Regression guard for the zod 4 migration. `.email()` on a string is deprecated, but the
     * obvious replacement — a bare `z.email()` — answers an empty field with "invalid email".
     * The schema pipes `.min(1)` into `z.email()` precisely so the two cases stay distinct.
     */
    it('reports a missing email as required, not as malformed', () => {
      expect(errorFor({ email: '', password: 'hunter2' }, 'email')).toBe(
        'Email is required',
      )
    })

    it('reports a malformed email as malformed', () => {
      expect(
        errorFor({ email: 'artist-at-bitrate', password: 'hunter2' }, 'email'),
      ).toBe('Please enter a valid email address')
    })

    it('rejects a missing email field outright', () => {
      expect(loginSchema.safeParse({ password: 'hunter2' }).success).toBe(false)
    })
  })

  describe('password', () => {
    it('reports an empty password as required', () => {
      expect(
        errorFor({ email: 'artist@bitrate.me', password: '' }, 'password'),
      ).toBe('Password is required')
    })

    it('imposes no length rule at login — that belongs to registration', () => {
      const result = loginSchema.safeParse({
        email: 'artist@bitrate.me',
        password: 'a',
      })

      expect(result.success).toBe(true)
    })
  })
})
