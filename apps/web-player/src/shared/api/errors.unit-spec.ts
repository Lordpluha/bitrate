import { describe, expect, it } from 'vitest'
import {
  ApiRequestError,
  getApiErrorStatus,
  shouldRetryApiQuery,
} from './errors'

describe('getApiErrorStatus', () => {
  it.each([
    [new ApiRequestError('Rate limited', 429), 429],
    [{ status: 403 }, 403],
    [{ statusCode: 429, message: 'Too many requests' }, 429],
    [{ response: { status: 401 } }, 401],
  ])('reads an HTTP status from supported error shapes', (error, status) => {
    expect(getApiErrorStatus(error)).toBe(status)
  })

  it.each([
    null,
    '429',
    { statusCode: '429' },
    { status: 42 },
  ])('ignores invalid error status values', (error) => {
    expect(getApiErrorStatus(error)).toBeUndefined()
  })
})

describe('shouldRetryApiQuery', () => {
  it.each([401, 403, 429])('does not retry HTTP %s responses', (statusCode) => {
    expect(shouldRetryApiQuery(0, { statusCode })).toBe(false)
  })

  it('keeps retries finite for retryable failures', () => {
    expect(shouldRetryApiQuery(0, new Error('Network error'))).toBe(true)
    expect(shouldRetryApiQuery(1, new Error('Network error'))).toBe(true)
    expect(shouldRetryApiQuery(2, new Error('Network error'))).toBe(false)
  })
})
