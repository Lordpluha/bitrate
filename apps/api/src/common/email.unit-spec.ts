import { describe, expect, it } from '@jest/globals'
import { z } from 'zod'
import { EmailSchema } from './email'

describe('EmailSchema', () => {
  it('trims and lower-cases an autofilled address', () => {
    expect(EmailSchema.parse('  User@Example.COM ')).toBe('user@example.com')
  })

  it.each([['not-an-email'], [''], [42], [undefined]])('rejects %p', (value) => {
    expect(EmailSchema.safeParse(value).success).toBe(false)
  })

  /** The OpenAPI contracts are generated from the input side; it must stay `format: email`. */
  it('keeps format: email on the input schema the contracts are generated from', () => {
    expect(z.toJSONSchema(EmailSchema, { io: 'input' })).toMatchObject({
      type: 'string',
      format: 'email',
    })
  })
})
