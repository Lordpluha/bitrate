import { describe, expect, it, vi } from 'vitest'
import { registerServiceWorker } from './ServiceWorkerRegistration'

describe('registerServiceWorker', () => {
  it('contains a rejected registration without creating an unhandled rejection', async () => {
    const error = new Error('private mode')
    const reportError = vi.fn()
    const register = vi.fn().mockRejectedValue(error)

    await expect(
      registerServiceWorker({ register }, reportError),
    ).resolves.toBeNull()
    expect(reportError).toHaveBeenCalledWith(
      'Service worker registration failed.',
      error,
    )
  })
})
