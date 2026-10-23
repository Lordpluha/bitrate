import { StaffWriteError } from '@domain/staff'
import { TestBed } from '@angular/core/testing'
import { TranslocoService } from '@jsverse/transloco'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { provideTestTransloco } from '@testing/transloco'
import { beforeEach, describe, expect, it } from 'vitest'
import { staffWriteError } from './staff-write-error.message'

/** The notice as an English-speaking operator reads it, through the real dictionary. */
function english(notice: Notice): string {
  return TestBed.inject(TranslocoService).translate(notice.key, notice.params ?? {}, 'en')
}

beforeEach(() => {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({ providers: [...provideTestTransloco()] })
})

describe('staffWriteError', () => {
  it('names the specific permission problem for create', () => {
    const message = english(
      staffWriteError({
        error: new StaffWriteError('unknown-permission'),
        operation: 'create',
      }),
    )

    expect(message).toContain('can’t be granted')
  })

  it('names an email/username conflict for create', () => {
    const message = english(
      staffWriteError({
        error: new StaffWriteError('conflict'),
        operation: 'create',
      }),
    )

    expect(message).toContain('already in use')
  })

  it('names a missing role for create and assign-role', () => {
    expect(
      english(staffWriteError({ error: new StaffWriteError('not-found'), operation: 'create' })),
    ).toContain('role no longer exists')
    expect(
      english(
        staffWriteError({ error: new StaffWriteError('not-found'), operation: 'assign-role' }),
      ),
    ).toContain('role no longer exists')
  })

  it('names a missing operator for update-permissions and deactivate', () => {
    expect(
      english(
        staffWriteError({ error: new StaffWriteError('not-found'), operation: 'deactivate' }),
      ),
    ).toContain('operator no longer exists')
  })

  it('names the last-active-administrator refusal', () => {
    const message = english(
      staffWriteError({
        error: new StaffWriteError('last-admin'),
        operation: 'deactivate',
      }),
    )

    expect(message).toContain('no active operator holding the ADMIN role')
  })

  it('picks the built-in-administrator sentence when the target holds ADMIN', () => {
    const message = english(
      staffWriteError({
        error: new StaffWriteError('not-allowed'),
        operation: 'update-permissions',
        targetIsBuiltInAdmin: true,
      }),
    )

    expect(message).toContain('can’t have its permissions edited one by one')
  })

  it('picks the permission sentence when the target does not hold ADMIN', () => {
    const message = english(
      staffWriteError({
        error: new StaffWriteError('not-allowed'),
        operation: 'update-permissions',
        targetIsBuiltInAdmin: false,
      }),
    )

    expect(message).toContain('can’t be granted')
  })

  it('falls back to an operation-specific default for a non-StaffWriteError', () => {
    expect(english(staffWriteError({ error: new Error('boom'), operation: 'create' }))).toBe(
      'Couldn’t create this operator.',
    )
  })
})
