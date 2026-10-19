import { describe, expect, it } from 'vitest'
import { collectRegistrationErrors } from './registrationErrors'

describe('collectRegistrationErrors', () => {
  it('lists every broken password rule once, in form order, ending with the terms', () => {
    expect(
      collectRegistrationErrors({
        acceptLegal: {
          message: 'You must accept the Terms of Use and Community Guidelines',
          type: 'custom',
        },
        confirmPassword: {
          message: "Passwords don't match",
          type: 'custom',
          types: {
            custom: "Passwords don't match",
            too_small: 'Password must be at least 8 characters',
          },
        },
        password: {
          message: 'Password must be at least 8 characters',
          type: 'too_small',
          types: {
            custom: [
              'Password must include at least one uppercase letter',
              'Password must include at least one number',
            ],
            too_small: 'Password must be at least 8 characters',
          },
        },
      }),
    ).toEqual([
      'Password must be at least 8 characters',
      'Password must include at least one uppercase letter',
      'Password must include at least one number',
      "Passwords don't match",
      'You must accept the Terms of Use and Community Guidelines',
    ])
  })

  it('is empty when the form is valid', () => {
    expect(collectRegistrationErrors({})).toEqual([])
  })
})
