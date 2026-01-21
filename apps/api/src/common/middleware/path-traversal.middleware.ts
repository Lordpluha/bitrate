import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class PathTraversalMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Check for path traversal attempts in static file requests
    if (req.path.startsWith('/static')) {
      const suspiciousPatterns = [
        /\.\./g, // Directory traversal
        /\/\//g, // Double slashes
        /%2e%2e/gi, // URL encoded ..
        /%252e/gi, // Double URL encoded .
        /\\/g, // Backslashes (Windows paths)
      ]

      const hasSuspiciousPattern = suspiciousPatterns.some((pattern) => pattern.test(req.path))

      if (hasSuspiciousPattern) {
        throw new ForbiddenException('Invalid file path')
      }
    }

    next()
  }
}
