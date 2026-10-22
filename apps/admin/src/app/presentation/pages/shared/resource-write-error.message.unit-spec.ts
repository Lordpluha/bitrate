import { TestBed } from '@angular/core/testing'
import { ActionNotAllowedError, ResourceWriteError } from '@domain/shared'
import { TranslocoService } from '@jsverse/transloco'
import { provideTestTransloco } from '@testing/transloco'
import { beforeEach, describe, expect, it } from 'vitest'
import { isStaleStateError, type Notice, resourceWriteError } from './resource-write-error.message'

/** The notice as an English-speaking operator reads it, through the real dictionary. */
function english(notice: Notice): string {
  return TestBed.inject(TranslocoService).translate(notice.key, notice.params ?? {}, 'en')
}

describe('resourceWriteError', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({ providers: [...provideTestTransloco()] })
  })

  it('defaults to account wording for a deactivate/restore conflict', () => {
    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('already-deactivated'),
          action: 'deactivate',
          label: '"dj-test"',
        }),
      ),
    ).toBe('"dj-test" is already deactivated — reloaded.')

    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('not-deactivated'),
          action: 'restore',
          label: '"dj-test"',
        }),
      ),
    ).toBe('"dj-test" is not deactivated — reloaded.')
  })

  it('uses take-down wording for an album conflict', () => {
    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('already-deactivated'),
          action: 'take down',
          label: '"Night Signal"',
          resource: 'album',
        }),
      ),
    ).toBe('"Night Signal" is already taken down — reloaded.')

    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('not-deactivated'),
          action: 'restore',
          label: '"Night Signal"',
          resource: 'album',
        }),
      ),
    ).toBe('"Night Signal" is not taken down — reloaded.')
  })

  it('uses take-down wording for a playlist conflict and a dedicated one for visibility', () => {
    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('already-deactivated'),
          action: 'take down',
          label: '"Night Drive"',
          resource: 'playlist',
        }),
      ),
    ).toBe('"Night Drive" is already taken down — reloaded.')

    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('visibility-conflict'),
          action: 'unhide',
          label: '"Night Drive"',
          resource: 'playlist',
        }),
      ),
    ).toBe(
      '"Night Drive" changed visibility elsewhere or cannot be un-hidden by an operator — reloaded.',
    )
    expect(isStaleStateError(new ResourceWriteError('visibility-conflict'))).toBe(true)
  })

  it('uses take-down wording for a podcast and an episode conflict', () => {
    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('already-deactivated'),
          action: 'take down',
          label: '"Signal Hour"',
          resource: 'podcast',
        }),
      ),
    ).toBe('"Signal Hour" is already taken down — reloaded.')

    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('not-deactivated'),
          action: 'restore',
          label: '"Intro Episode"',
          resource: 'episode',
        }),
      ),
    ).toBe('"Intro Episode" is not taken down — reloaded.')
  })

  it('uses take-down wording for a track conflict rather than account wording', () => {
    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('already-deactivated'),
          action: 'take down',
          label: '"Night Drive"',
          resource: 'track',
        }),
      ),
    ).toBe('"Night Drive" is already taken down — reloaded.')

    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('not-deactivated'),
          action: 'restore',
          label: '"Night Drive"',
          resource: 'track',
        }),
      ),
    ).toBe('"Night Drive" is not taken down — reloaded.')
  })

  it('reports not-found the same way for either resource', () => {
    expect(
      english(
        resourceWriteError({
          error: new ResourceWriteError('not-found'),
          action: 'take down',
          label: '"Night Drive"',
          resource: 'track',
        }),
      ),
    ).toBe('"Night Drive" could not be found — it may have been removed.')
  })

  it('says the record cannot change now for a client-side ActionNotAllowedError', () => {
    expect(
      english(
        resourceWriteError({
          error: new ActionNotAllowedError('already taken down'),
          action: 'take down',
          label: '"Night Drive"',
          resource: 'track',
        }),
      ),
    ).toBe('"Night Drive" can’t be changed in its current state.')
  })

  it('falls back to a generic message for an unrecognised error', () => {
    expect(
      english(resourceWriteError({ error: new Error('boom'), action: 'take down', label: 'it' })),
    ).toBe('Couldn’t take down it.')
  })
})

describe('isStaleStateError', () => {
  it('is true only for the two stale-state reasons', () => {
    expect(isStaleStateError(new ResourceWriteError('already-deactivated'))).toBe(true)
    expect(isStaleStateError(new ResourceWriteError('not-deactivated'))).toBe(true)
    expect(isStaleStateError(new ResourceWriteError('not-found'))).toBe(false)
    expect(isStaleStateError(new Error('boom'))).toBe(false)
  })
})
