import { describe, expect, it } from 'vitest'

import { emailSchema } from '@/shared/validation/email.validation'

describe('emailSchema', () => {
  it('accepts an autofilled address with spaces and capitals and normalises it', () => {
    expect(emailSchema.parse('  User@Example.COM ')).toBe('user@example.com')
  })

  it('still rejects a malformed address', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false)
  })
})
