import { randomUUID } from 'node:crypto'
import { Injectable, type NestMiddleware } from '@nestjs/common'
import type { NextFunction, Response } from 'express'
import { REQUEST_ID_HEADER, type RequestWithContext } from '../http/request-context'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Adds a safe correlation ID to the request and response. */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: RequestWithContext, response: Response, next: NextFunction) {
    const suppliedId = request.get(REQUEST_ID_HEADER)
    const requestId =
      suppliedId && UUID_PATTERN.test(suppliedId) ? suppliedId.toLowerCase() : randomUUID()

    request.requestId = requestId
    response.setHeader(REQUEST_ID_HEADER, requestId)
    next()
  }
}
