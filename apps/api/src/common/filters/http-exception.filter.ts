import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let error = 'Internal Server Error'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, any>
        message = responseObj.message || message
        error = responseObj.error || error
      }
    } else if (exception instanceof Error) {
      // Handle NotFoundError from serve-static/send
      if (exception.constructor.name === 'NotFoundError' || exception.message === 'Not Found') {
        status = HttpStatus.NOT_FOUND
        message = 'Resource not found'
        error = 'Not Found'
      }
      // Handle file system errors for static files
      else if (exception.message.includes('ENOENT')) {
        status = HttpStatus.NOT_FOUND
        message = 'Resource not found'
        error = 'Not Found'
      } else if (exception.message.includes('EACCES')) {
        status = HttpStatus.FORBIDDEN
        message = 'Access denied'
        error = 'Forbidden'
      } else {
        // Generic error - don't expose internals
        message = 'An unexpected error occurred'
      }
    }

    // Log error details internally (for debugging)
    if (process.env.NODE_ENV !== 'production') {
      // Don't log stack traces for common 404 errors
      if (
        status === HttpStatus.NOT_FOUND &&
        exception instanceof Error &&
        exception.constructor.name === 'NotFoundError'
      ) {
        console.log(`[404] ${request.method} ${request.url}`)
      } else if (status >= 500) {
        // Log server errors with full details
        console.error('Exception caught:', {
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          exception: exception instanceof Error ? exception.message : exception,
          stack: exception instanceof Error ? exception.stack : undefined,
        })
      } else {
        // Log other errors without stack trace
        console.warn(`[${status}] ${request.method} ${request.url} - ${message}`)
      }
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
