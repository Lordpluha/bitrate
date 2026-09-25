import { ActionNotAllowedError, ResourceWriteError } from '@domain/shared'
import { describe, expect, it } from 'vitest'
import { isStaleStateError, resourceWriteErrorMessage } from './resource-write-error.message'

describe('resourceWriteErrorMessage', () => {
  it('defaults to account wording for a deactivate/restore conflict', () => {
    expect(
      resourceWriteErrorMessage({
        error: new ResourceWriteError('already-deactivated'),
        action: 'deactivate',
        label: '"dj-test"',
      }),
    ).toBe('"dj-test" is already deactivated — reloaded.')

    expect(
      resourceWriteErrorMessage({
        error: new ResourceWriteError('not-deactivated'),
        action: 'restore',
        label: '"dj-test"',
      }),
    ).toBe('"dj-test" is not deactivated — reloaded.')
  })

  it('uses take-down wording for a track conflict rather than account wording', () => {
    expect(
      resourceWriteErrorMessage({
        error: new ResourceWriteError('already-deactivated'),
        action: 'take down',
        label: '"Night Drive"',
        resource: 'track',
      }),
    ).toBe('"Night Drive" is already taken down — reloaded.')

    expect(
      resourceWriteErrorMessage({
        error: new ResourceWriteError('not-deactivated'),
        action: 'restore',
        label: '"Night Drive"',
        resource: 'track',
      }),
    ).toBe('"Night Drive" is not taken down — reloaded.')
  })

  it('reports not-found the same way for either resource', () => {
    expect(
      resourceWriteErrorMessage({
        error: new ResourceWriteError('not-found'),
        action: 'take down',
        label: '"Night Drive"',
        resource: 'track',
      }),
    ).toBe('"Night Drive" could not be found — it may have been removed.')
  })

  it('returns the policy message verbatim for a client-side ActionNotAllowedError', () => {
    expect(
      resourceWriteErrorMessage({
        error: new ActionNotAllowedError('already taken down'),
        action: 'take down',
        label: '"Night Drive"',
        resource: 'track',
      }),
    ).toBe('already taken down')
  })

  it('falls back to a generic message for an unrecognised error', () => {
    expect(
      resourceWriteErrorMessage({ error: new Error('boom'), action: 'take down', label: 'it' }),
    ).toBe('Could not take down it.')
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
