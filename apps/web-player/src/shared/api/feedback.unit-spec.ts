import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showApiErrorToast } from './feedback'

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
