import { describe, expect, it } from '@jest/globals'
import { assertGrantable } from './assert-grantable'
import { ProtectedPermissionException, UnknownPermissionException } from './errors'
import { PROTECTED_PERMISSIONS } from './permissions'

describe('assertGrantable', () => {
  it('rejects an unknown permission id', () => {
    expect(() => assertGrantable(['artists:read', 'artists:teleport'])).toThrow(
      UnknownPermissionException,
    )
  })

  it.each(PROTECTED_PERMISSIONS.map((id) => ({ id })))('rejects the protected permission $id', ({
    id,
  }) => {
    expect(() => assertGrantable([id])).toThrow(ProtectedPermissionException)
  })

  it('accepts a valid, non-protected permission set', () => {
    expect(() =>
      assertGrantable(['artists:read', 'artists:verify', 'tracks:reprocess']),
    ).not.toThrow()
  })

  it('accepts an empty set', () => {
    expect(() => assertGrantable([])).not.toThrow()
  })
})
