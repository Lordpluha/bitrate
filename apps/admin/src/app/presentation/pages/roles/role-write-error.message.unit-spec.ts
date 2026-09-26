import { RoleWriteError } from '@domain/role'
import { describe, expect, it } from 'vitest'
import { roleDeleteErrorMessage, roleWriteErrorMessage } from './role-write-error.message'

describe('roleWriteErrorMessage', () => {
  it('names the duplicate role', () => {
    const message = roleWriteErrorMessage({
      error: new RoleWriteError('duplicate-name'),
      name: 'Catalog reviewer',
    })

    expect(message).toContain('"Catalog reviewer"')
  })

  it('explains a built-in edit refusal when the role is built-in', () => {
    const message = roleWriteErrorMessage({
      error: new RoleWriteError('not-allowed'),
      name: 'MODERATOR',
      builtIn: true,
    })

    expect(message).toContain('Built-in roles cannot be edited')
  })

  it('explains a protected-permission refusal when the role is not built-in', () => {
    const message = roleWriteErrorMessage({
      error: new RoleWriteError('not-allowed'),
      name: 'Catalog reviewer',
      builtIn: false,
    })

    expect(message).toContain('cannot be granted')
  })

  it('falls back to a generic message for an error that is not a RoleWriteError', () => {
    expect(roleWriteErrorMessage({ error: new Error('boom'), name: 'x' })).toBe(
      'Could not save this role.',
    )
  })
})

describe('roleDeleteErrorMessage', () => {
  it('names the reason a role is still in use', () => {
    expect(roleDeleteErrorMessage(new RoleWriteError('in-use'))).toContain('still assigned')
  })

  it('falls back to a generic message for an error that is not a RoleWriteError', () => {
    expect(roleDeleteErrorMessage(new Error('boom'))).toBe('Could not delete this role.')
  })
})
