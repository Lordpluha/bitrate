import { GenreWriteError } from '@domain/genre'
import { describe, expect, it } from 'vitest'
import { genreDeleteErrorMessage, genreWriteErrorMessage } from './genre-write-error.message'

describe('genreWriteErrorMessage', () => {
  it('names the taken slug', () => {
    const message = genreWriteErrorMessage({
      error: new GenreWriteError('slug-taken'),
      slug: 'pop',
    })

    expect(message).toContain('"pop"')
  })

  it('falls back to a generic message for a foreign error', () => {
    expect(genreWriteErrorMessage({ error: new Error('boom'), slug: '' })).toBe(
      'Could not save this genre.',
    )
  })
})

describe('genreDeleteErrorMessage', () => {
  it('names the reference counts when the API sent them', () => {
    const message = genreDeleteErrorMessage(
      new GenreWriteError('in-use', { tracks: 4, albums: 1, artists: 0 }),
    )

    expect(message).toContain('4 tracks')
    expect(message).toContain('1 albums')
  })

  it('still explains an in-use refusal without counts', () => {
    expect(genreDeleteErrorMessage(new GenreWriteError('in-use'))).toContain('still referenced')
  })

  it('falls back to a generic message for a foreign error', () => {
    expect(genreDeleteErrorMessage(new Error('boom'))).toBe('Could not delete this genre.')
  })
})
