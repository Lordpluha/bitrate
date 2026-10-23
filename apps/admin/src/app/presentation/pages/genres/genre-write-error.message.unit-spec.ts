import { TestBed } from '@angular/core/testing'
import { GenreWriteError } from '@domain/genre'
import { TranslocoService } from '@jsverse/transloco'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { provideTestTransloco } from '@testing/transloco'
import { beforeEach, describe, expect, it } from 'vitest'
import { genreDeleteError, genreWriteError } from './genre-write-error.message'

/** The notice as an English-speaking operator reads it, through the real dictionary. */
function english(notice: Notice): string {
  return TestBed.inject(TranslocoService).translate(notice.key, notice.params ?? {}, 'en')
}

beforeEach(() => {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({ providers: [...provideTestTransloco()] })
})

describe('genreWriteError', () => {
  it('names the taken address', () => {
    const message = english(
      genreWriteError({ error: new GenreWriteError('slug-taken'), slug: 'pop' }),
    )

    expect(message).toContain('“pop”')
  })

  it('falls back to a generic message for a foreign error', () => {
    expect(english(genreWriteError({ error: new Error('boom'), slug: '' }))).toBe(
      'Couldn’t save this genre.',
    )
  })
})

describe('genreDeleteError', () => {
  it('names the reference counts when the API sent them, with plurals', () => {
    const message = english(
      genreDeleteError(new GenreWriteError('in-use', { tracks: 4, albums: 1, artists: 0 })),
    )

    expect(message).toContain('4 tracks')
    expect(message).toContain('1 album ')
    expect(message).toContain('0 artists')
  })

  it('still explains an in-use refusal without counts', () => {
    expect(english(genreDeleteError(new GenreWriteError('in-use')))).toContain('still used')
  })

  it('falls back to a generic message for a foreign error', () => {
    expect(english(genreDeleteError(new Error('boom')))).toBe('Couldn’t delete this genre.')
  })
})
