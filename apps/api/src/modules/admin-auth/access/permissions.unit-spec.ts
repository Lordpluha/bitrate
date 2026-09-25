import { describe, expect, it } from '@jest/globals'
import { assertGrantable } from './assert-grantable'
import { normalizePermissions } from './normalize-permissions'
import { MODERATOR_TEMPLATE, PERMISSIONS, PROTECTED_PERMISSIONS } from './permissions'

describe('MODERATOR_TEMPLATE', () => {
  it('holds no protected permission', () => {
    const protectedSet = new Set<string>(PROTECTED_PERMISSIONS)

    expect(MODERATOR_TEMPLATE.filter((permission) => protectedSet.has(permission))).toEqual([])
  })

  it('holds only permissions from the catalogue', () => {
    const catalogue = new Set<string>(PERMISSIONS)

    expect(MODERATOR_TEMPLATE.filter((permission) => !catalogue.has(permission))).toEqual([])
  })

  it('passes the same validator that guards every template and operator write', () => {
    expect(() => assertGrantable(MODERATOR_TEMPLATE)).not.toThrow()
  })

  /**
   * Stored sets are normalised; a template out of catalogue order or with a repeat would make
   * every freshly seeded moderator read as diverging from the role they were given.
   */
  it('is already normalised — deduplicated and in catalogue order', () => {
    expect(normalizePermissions(MODERATOR_TEMPLATE)).toEqual([...MODERATOR_TEMPLATE])
  })
})
