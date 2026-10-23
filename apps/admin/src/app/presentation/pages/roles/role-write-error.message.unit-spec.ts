import { RoleWriteError } from '@domain/role'
import { TestBed } from '@angular/core/testing'
import { TranslocoService } from '@jsverse/transloco'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { provideTestTransloco } from '@testing/transloco'
import { beforeEach, describe, expect, it } from 'vitest'
import { roleDeleteError, roleWriteError } from './role-write-error.message'

/** The notice as an English-speaking operator reads it, through the real dictionary. */
function english(notice: Notice): string {
  return TestBed.inject(TranslocoService).translate(notice.key, notice.params ?? {}, 'en')
}

beforeEach(() => {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({ providers: [...provideTestTransloco()] })
})

describe('roleWriteError', () => {
  it('names the duplicate role', () => {
    const message = english(
      roleWriteError({
        error: new RoleWriteError('duplicate-name'),
        name: 'Catalog reviewer',
      }),
    )

    expect(message).toContain('“Catalog reviewer”')
  })

  it('explains a built-in edit refusal when the role is built-in', () => {
    const message = english(
      roleWriteError({
        error: new RoleWriteError('not-allowed'),
        name: 'MODERATOR',
        builtIn: true,
      }),
    )

    expect(message).toContain('Built-in roles can’t be edited')
  })

  it('explains a protected-permission refusal when the role is not built-in', () => {
    const message = english(
      roleWriteError({
        error: new RoleWriteError('not-allowed'),
        name: 'Catalog reviewer',
        builtIn: false,
      }),
    )

    expect(message).toContain('can’t be granted')
  })

  it('falls back to a generic message for an error that is not a RoleWriteError', () => {
    expect(english(roleWriteError({ error: new Error('boom'), name: 'x' }))).toBe(
      'Couldn’t save this role.',
    )
  })
})

describe('roleDeleteError', () => {
  it('names the reason a role is still in use', () => {
    expect(english(roleDeleteError(new RoleWriteError('in-use')))).toContain('still assigned')
  })

  it('falls back to a generic message for an error that is not a RoleWriteError', () => {
    expect(english(roleDeleteError(new Error('boom')))).toBe('Couldn’t delete this role.')
  })
})
