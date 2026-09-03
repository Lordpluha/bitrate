import { describe, expect, it, jest } from '@jest/globals'
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common'
import { HttpExceptionFilter } from './http-exception.filter'

const makeHost = (method = 'GET', url = '/test', requestId?: string) => {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  const response = { status } as never
  const request = { method, url, requestId } as never

  return {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
    json,
    status,
  }
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter()

  it('should handle HttpException with string response', () => {
    const host = makeHost()
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN)

    filter.catch(exception, host as never)

    expect(host.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN)
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, message: 'Forbidden' }),
    )
  })

  it('propagates the validated request ID in error responses', () => {
    const requestId = '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea1'
    const host = makeHost('GET', '/test', requestId)

    filter.catch(new NotFoundException(), host as never)

    expect(host.json).toHaveBeenCalledWith(expect.objectContaining({ requestId }))
  })

  it('should handle HttpException with object response', () => {
    const host = makeHost()
    const exception = new NotFoundException('Not found item')

    filter.catch(exception, host as never)

    expect(host.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: 'Not found item' }),
    )
  })

  it('should handle HttpException with array of messages', () => {
    const host = makeHost()
    const exception = new HttpException(
      { message: ['field is required', 'must be string'], error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    )

    filter.catch(exception, host as never)

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'field is required, must be string',
        error: 'Bad Request',
      }),
    )
  })

  it('labels a status from the status code when the exception omits an error field', () => {
    const host = makeHost('POST', '/api/v1/auth/registration')
    const exception = new HttpException(
      { statusCode: 400, message: 'Validation failed' },
      HttpStatus.BAD_REQUEST,
    )

    filter.catch(exception, host as never)

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
      }),
    )
  })

  it("keeps the exception's own error field when it supplies one", () => {
    const host = makeHost()
    const exception = new HttpException(
      { message: 'Nope', error: 'Teapot' },
      HttpStatus.I_AM_A_TEAPOT,
    )

    filter.catch(exception, host as never)

    expect(host.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Teapot' }))
  })

  it('should handle NotFoundError (serve-static)', () => {
    const host = makeHost()
    const error = new Error('Not Found')
    Object.defineProperty(error, 'constructor', { value: { name: 'NotFoundError' } })

    filter.catch(error, host as never)

    expect(host.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
  })

  it('should handle ENOENT filesystem error as 404', () => {
    const host = makeHost()
    const error = new Error('ENOENT: no such file or directory')

    filter.catch(error, host as never)

    expect(host.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Resource not found' }),
    )
  })

  it('should handle EACCES filesystem error as 403', () => {
    const host = makeHost()
    const error = new Error('EACCES: permission denied')

    filter.catch(error, host as never)

    expect(host.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN)
    expect(host.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Access denied' }))
  })

  it('should return 500 for unknown errors', () => {
    const host = makeHost()
    const error = new Error('Something unexpected')

    filter.catch(error, host as never)

    expect(host.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'An unexpected error occurred' }),
    )
  })
})
