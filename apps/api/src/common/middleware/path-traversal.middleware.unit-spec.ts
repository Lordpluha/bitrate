import { describe, expect, it, jest } from '@jest/globals'
import { ForbiddenException } from '@nestjs/common'
import { PathTraversalMiddleware } from './path-traversal.middleware'

const makeReqRes = (path: string) => {
  const req = { path } as never
  const res = {} as never
  const next = jest.fn()
  return { req, res, next }
}

describe('PathTraversalMiddleware', () => {
  const middleware = new PathTraversalMiddleware()

  it('should call next for non-static paths without issues', () => {
    const { req, res, next } = makeReqRes('/api/tracks')

    middleware.use(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should call next for valid static paths', () => {
    const { req, res, next } = makeReqRes('/static/images/cover.jpg')

    middleware.use(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should throw ForbiddenException for directory traversal (..)', () => {
    const { req, res, next } = makeReqRes('/static/../etc/passwd')

    expect(() => middleware.use(req, res, next)).toThrow(ForbiddenException)
    expect(next).not.toHaveBeenCalled()
  })

  it('should throw ForbiddenException for double slashes', () => {
    const { req, res, next } = makeReqRes('/static//etc/passwd')

    expect(() => middleware.use(req, res, next)).toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException for URL-encoded traversal (%2e%2e)', () => {
    const { req, res, next } = makeReqRes('/static/%2e%2e/secret')

    expect(() => middleware.use(req, res, next)).toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException for double URL-encoded (%252e)', () => {
    const { req, res, next } = makeReqRes('/static/%252e%252e/secret')

    expect(() => middleware.use(req, res, next)).toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException for backslash (Windows path)', () => {
    const { req, res, next } = makeReqRes('/static/..\\secret')

    expect(() => middleware.use(req, res, next)).toThrow(ForbiddenException)
  })
})
