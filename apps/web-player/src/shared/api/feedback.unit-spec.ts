import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { getApiErrorMessage, showApiErrorToast } from './feedback'

const { toastError } = vi.hoisted(() => ({
  toastError: vi.fn(),
}))

vi.mock('@bitrate/ui-react', () => ({
  toast: {
    error: toastError,
    success: vi.fn(),
  },
}))

describe('showApiErrorToast', () => {
  beforeEach(() => {
    toastError.mockClear()
  })

  it('uses one stable toast id for repeated rate-limit errors', () => {
    const error = { statusCode: 429, message: 'Too many requests' }

    showApiErrorToast(error)
    showApiErrorToast(error)

    expect(toastError).toHaveBeenNthCalledWith(1, 'Too many requests', {
      id: 'api-rate-limit-error',
    })
    expect(toastError).toHaveBeenNthCalledWith(2, 'Too many requests', {
      id: 'api-rate-limit-error',
    })
  })

  it('does not deduplicate unrelated errors', () => {
    showApiErrorToast(new Error('Request failed'))

    expect(toastError).toHaveBeenCalledWith('Request failed')
  })
})

describe('getApiErrorMessage', () => {
  it('passes on what the API or our own request helpers say', () => {
    expect(getApiErrorMessage(new Error('Failed to load friends'))).toBe(
      'Failed to load friends',
    )
    expect(getApiErrorMessage({ message: 'Playlist is private' })).toBe(
      'Playlist is private',
    )
  })

  it('never shows a schema or runtime failure to the user', () => {
    const parsed = z.object({ id: z.string() }).safeParse([])
    expect(parsed.success).toBe(false)

    expect(getApiErrorMessage(parsed.error, 'Unable to load.')).toBe(
      'Unable to load.',
    )
    expect(
      getApiErrorMessage(
        new TypeError('Failed to parse URL from /api/v1/tracks/liked'),
        'Unable to load.',
      ),
    ).toBe('Unable to load.')
  })
})
