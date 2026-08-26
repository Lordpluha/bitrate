import { describe, expect, it, jest } from '@jest/globals'
import type { Response } from 'express'
import type { RequestWithContext } from '../http/request-context'
import { REQUEST_ID_HEADER } from '../http/request-context'
import { RequestIdMiddleware } from './request-id.middleware'

const makeRequest = (requestId?: string) => {
  const request = {
    get: jest.fn(() => requestId),
  } as unknown as RequestWithContext
  const response = {
    setHeader: jest.fn(),
  } as unknown as Response
  const next = jest.fn()

  return { request, response, next }
}

describe('RequestIdMiddleware', () => {
  const middleware = new RequestIdMiddleware()

  it('propagates a valid correlation ID', () => {
    const requestId = '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea1'
    const { request, response, next } = makeRequest(requestId.toUpperCase())

    middleware.use(request, response, next)

    expect(request.requestId).toBe(requestId)
    expect(response.setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, requestId)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('replaces untrusted header contents with a server-generated UUID', () => {
    const { request, response, next } = makeRequest('log-injection\nforged')

    middleware.use(request, response, next)

    expect(request.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
    expect(response.setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, expect.any(String))
    expect(next).toHaveBeenCalledTimes(1)
  })
})
