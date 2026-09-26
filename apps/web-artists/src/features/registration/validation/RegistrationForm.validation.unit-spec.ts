import { describe, expect, it } from 'vitest'
import {
  emailSchema,
  passwordSchema,
  registrationSchema,
} from './RegistrationForm.validation'

/** First error reported for a field, or `undefined` when the field validated. */
function errorFor(value: unknown, field: string): string | undefined {
  const result = registrationSchema.safeParse(value)
  if (result.success) return undefined

  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('emailSchema', () => {
  it('accepts a well-formed address', () => {
    expect(emailSchema.safeParse('artist@bitrate.me').success).toBe(true)
  })

  /**
   * Regression guard for the zod 4 migration — see the login spec for the full reasoning.
   * A bare `z.email()` would collapse these two messages into one.
   */
  it('reports a missing address as required, not as malformed', () => {
    const result = emailSchema.safeParse('')

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Email is required')
  })

  it('reports a malformed address as malformed', () => {
    const result = emailSchema.safeParse('artist-at-bitrate')

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'Please enter a valid email address',
    )
  })
})

describe('passwordSchema', () => {
  it('accepts a password with length, a letter and a digit', () => {
    expect(passwordSchema.safeParse('correct-horse-7').success).toBe(true)
  })

  it('accepts a special character in place of a digit', () => {
    expect(passwordSchema.safeParse('correct-horse!').success).toBe(true)
  })

  it('rejects a password below ten characters', () => {
    const result = passwordSchema.safeParse('short1')

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'Password must be at least 10 characters',
    )
  })

  it('rejects a password with no letter', () => {
    const result = passwordSchema.safeParse('1234567890')

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'Password must contain at least one letter',
    )
  })

  it('rejects a password with neither digit nor special character', () => {
    const result = passwordSchema.safeParse('abcdefghijkl')

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'Password must contain a number or special character',
    )
  })
})

describe('registrationSchema', () => {
  it('accepts a complete registration', () => {
    const result = registrationSchema.safeParse({
      email: 'artist@bitrate.me',
      password: 'correct-horse-7',
    })

    expect(result.success).toBe(true)
  })

  /**
   * The object schema types `password` as a bare string and applies the rules through `.refine`
   * guards that short-circuit on an empty value, so the field can stay blank while the user is
   * still on the email step. Locking this in: tightening `password` to `passwordSchema` here
   * would block that first step.
   */
  it('tolerates a blank password so the email step can submit alone', () => {
    const result = registrationSchema.safeParse({
      email: 'artist@bitrate.me',
      password: '',
    })

    expect(result.success).toBe(true)
  })

  it('applies the password rules once a password is present', () => {
    expect(
      errorFor({ email: 'artist@bitrate.me', password: 'short1' }, 'password'),
    ).toBe('Password must be at least 10 characters')
  })

  it('rejects a malformed email even when the password is valid', () => {
    expect(
      errorFor(
        { email: 'artist-at-bitrate', password: 'correct-horse-7' },
        'email',
      ),
    ).toBe('Please enter a valid email address')
  })
})
