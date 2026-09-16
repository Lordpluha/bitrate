import { describe, expect, it } from '@jest/globals'
import { MODERATOR_TEMPLATE, PERMISSIONS, PROTECTED_PERMISSIONS } from './permissions'

describe('MODERATOR_TEMPLATE', () => {
  /**
   * Pins the code-side template against the catalogue and protected set, so the literal
   * duplicated into the migration's `INSERT` can be checked against this list by hand.
   */
  it('equals every permission minus the protected ones', () => {
    const protectedSet = new Set<string>(PROTECTED_PERMISSIONS)
    const expected = PERMISSIONS.filter((permission) => !protectedSet.has(permission))

    expect(MODERATOR_TEMPLATE.sort()).toEqual(expected.sort())
  })

  it('holds no protected permission', () => {
    for (const permission of MODERATOR_TEMPLATE) {
      expect(PROTECTED_PERMISSIONS).not.toContain(permission)
    }
  })
})
