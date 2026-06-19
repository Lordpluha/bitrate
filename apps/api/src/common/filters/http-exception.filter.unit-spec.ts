import { describe, expect, it, jest } from '@jest/globals'
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common'
import { HttpExceptionFilter } from './http-exception.filter'

const makeHost = (method = 'GET', url = '/test') => {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  const response = { status } as never
  const request = { method, url } as never

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
