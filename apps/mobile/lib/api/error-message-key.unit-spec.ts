import { ApiRequestError } from './api-request-error'
import { errorMessageKey } from './error-message-key'

describe('errorMessageKey', () => {
  it('uses the screen meaning of a status first', () => {
    const error = new ApiRequestError('x', 401)
    expect(
      errorMessageKey({ error, fallback: 'auth.login.failed', byStatus: { 401: 'auth.login.failed.credentials' } }),
    ).toBe('auth.login.failed.credentials')
  })

  it('reports rate limiting', () => {
    expect(errorMessageKey({ error: new ApiRequestError('x', 429), fallback: 'auth.login.failed' })).toBe(
      'common.error.rateLimited',
    )
  })

  it('reports a failed connection', () => {
    expect(errorMessageKey({ error: new TypeError('Network request failed'), fallback: 'auth.login.failed' })).toBe(
      'common.error.network',
    )
  })

  it('falls back for anything else', () => {
    expect(errorMessageKey({ error: new ApiRequestError('x', 500), fallback: 'auth.login.failed' })).toBe(
      'auth.login.failed',
    )
  })
})
