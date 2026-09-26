import { StaffWriteError } from '@domain/staff'
import { describe, expect, it } from 'vitest'
import { staffWriteErrorMessage } from './staff-write-error.message'

describe('staffWriteErrorMessage', () => {
  it('names the specific permission problem for create', () => {
    const message = staffWriteErrorMessage({
      error: new StaffWriteError('unknown-permission'),
      operation: 'create',
    })

    expect(message).toContain('cannot be granted')
  })

  it('names an email/username conflict for create', () => {
    const message = staffWriteErrorMessage({
      error: new StaffWriteError('conflict'),
      operation: 'create',
    })

    expect(message).toContain('already in use')
  })

  it('names a missing role for create and assign-role', () => {
    expect(
      staffWriteErrorMessage({ error: new StaffWriteError('not-found'), operation: 'create' }),
    ).toContain('role no longer exists')
    expect(
      staffWriteErrorMessage({ error: new StaffWriteError('not-found'), operation: 'assign-role' }),
    ).toContain('role no longer exists')
  })

  it('names a missing operator for update-permissions and deactivate', () => {
    expect(
      staffWriteErrorMessage({ error: new StaffWriteError('not-found'), operation: 'deactivate' }),
    ).toContain('operator no longer exists')
  })

  it('names the last-active-administrator refusal', () => {
    const message = staffWriteErrorMessage({
      error: new StaffWriteError('last-admin'),
      operation: 'deactivate',
    })

    expect(message).toContain('no active operator holding the ADMIN role')
  })

  it('picks the built-in-administrator sentence when the target holds ADMIN', () => {
    const message = staffWriteErrorMessage({
      error: new StaffWriteError('not-allowed'),
      operation: 'update-permissions',
      targetIsBuiltInAdmin: true,
    })

    expect(message).toContain('cannot have its permissions edited individually')
  })

  it('picks the permission sentence when the target does not hold ADMIN', () => {
    const message = staffWriteErrorMessage({
      error: new StaffWriteError('not-allowed'),
      operation: 'update-permissions',
      targetIsBuiltInAdmin: false,
    })

    expect(message).toContain('cannot be granted')
  })

  it('falls back to an operation-specific default for a non-StaffWriteError', () => {
    expect(staffWriteErrorMessage({ error: new Error('boom'), operation: 'create' })).toBe(
      'Could not create this operator.',
    )
  })
})
