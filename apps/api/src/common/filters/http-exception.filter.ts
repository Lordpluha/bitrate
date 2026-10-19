import { STATUS_CODES } from 'node:http'
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { SentryExceptionCaptured } from '@sentry/nestjs'
import type { Request, Response } from 'express'
// I18nService is constructor-injected — a type-only import erases the runtime reference Nest
// needs to resolve it, and the filter fails to boot with "Nest can't resolve dependencies...
// argument Function at index [0]".
// biome-ignore lint/style/useImportType: constructor-injected — NestJS DI needs the real class reference at runtime, not a type-only import.
import { I18nService } from 'nestjs-i18n'
import { ZodValidationException } from 'nestjs-zod'
import { resolveRequestLocale } from '../../i18n/resolve-request-locale'
import { getRequestId } from '../http/request-context'
import { type ZodIssueLike, zodIssueKey } from './zod-issue-key'

/**
 * A message/array-of-messages is only translated when it matches a known key namespace
 * (`errors.*`, `validation.*`) — everything else (a raw literal a service forgot to key, an
 * upstream library's own English text) passes through untouched rather than being mangled.
 */
const TRANSLATABLE_KEY_PATTERN = /^(errors|validation)\./

/** One per-field entry of a validation failure's `errors` array. */
type FieldError = {
  /** Dot-joined path to the offending field (`a.0.b`). */
  path: string
  /** The dictionary key behind `message`; absent for a hand-written literal message. */
  code?: string
  message: string
}

/** True for a zod issue-shaped value. */
const isZodIssue = (value: unknown): value is ZodIssueLike =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ZodIssueLike).code === 'string' &&
  typeof (value as ZodIssueLike).message === 'string'

/** Represents the http exception filter. Translation is the one place this happens — see api-rules. */
@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /** Creates a new instance. */
  constructor(private readonly i18n: I18nService) {}

  /** Translates `message` when it is a dictionary key, in the request's resolved locale. */
  private translate(message: string, lang: string, args?: Record<string, unknown>): string {
    if (!TRANSLATABLE_KEY_PATTERN.test(message)) return message
    return this.i18n.translate(message, { lang, args, defaultValue: message })
  }

  /** Translates every issue of a zod failure in the request locale. */
  private translateIssues(exception: ZodValidationException, lang: string): FieldError[] {
    const zodError: unknown = exception.getZodError()
    const issues =
      typeof zodError === 'object' && zodError !== null && 'issues' in zodError
        ? (zodError as { issues: unknown[] }).issues.filter(isZodIssue)
        : []

    return issues.map((issue) => {
      const path = (issue.path ?? []).map(String).join('.')
      if (TRANSLATABLE_KEY_PATTERN.test(issue.message)) {
        return { path, code: issue.message, message: this.translate(issue.message, lang) }
      }
      const mapped = zodIssueKey(issue)
      if (!mapped) return { path, message: issue.message }
      return { path, code: mapped.key, message: this.translate(mapped.key, lang, mapped.args) }
    })
  }

  /** Runs the catch operation. */
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const requestId = getRequestId(request)
    const lang = resolveRequestLocale(request)

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = this.translate('errors.generic.internal_server_error', lang)
    /**
     * Left unset until the status is known, then filled from the status itself. Seeding it with a
     * 500 label instead made every exception that omits its own `error` field — nestjs-zod's
     * validation exception among them — answer `400 Internal Server Error`.
     */
    let error: string | undefined
    /** The dictionary key behind `message`; unset for a literal, so the body omits `code`. */
    let code: string | undefined
    let fieldErrors: FieldError[] | undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (exception instanceof ZodValidationException) {
        code = 'errors.validation.failed'
        message = this.translate(code, lang)
        fieldErrors = this.translateIssues(exception, lang)
      } else if (typeof exceptionResponse === 'string') {
        message = this.translate(exceptionResponse, lang)
        if (TRANSLATABLE_KEY_PATTERN.test(exceptionResponse)) code = exceptionResponse
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>
        const args =
          typeof responseObj.args === 'object' && responseObj.args !== null
            ? (responseObj.args as Record<string, unknown>)
            : undefined

        if (typeof responseObj.message === 'string') {
          message = this.translate(responseObj.message, lang, args)
          if (TRANSLATABLE_KEY_PATTERN.test(responseObj.message)) code = responseObj.message
        } else if (Array.isArray(responseObj.message)) {
          const translated = responseObj.message
            .filter((item): item is string => typeof item === 'string')
            .map((item) => this.translate(item, lang))
          message = translated.join(', ') || message
        }

        if (typeof responseObj.error === 'string') {
          error = responseObj.error
        }
      }
    } else if (exception instanceof Error) {
      // Handle NotFoundError from serve-static/send
      if (exception.constructor.name === 'NotFoundError' || exception.message === 'Not Found') {
        status = HttpStatus.NOT_FOUND
        message = this.translate('errors.generic.resource_not_found', lang)
        error = 'Not Found'
      }
      // Handle file system errors for static files
      else if (exception.message.includes('ENOENT')) {
        status = HttpStatus.NOT_FOUND
        message = this.translate('errors.generic.resource_not_found', lang)
        error = 'Not Found'
      } else if (exception.message.includes('EACCES')) {
        status = HttpStatus.FORBIDDEN
        message = this.translate('errors.generic.access_denied', lang)
        error = 'Forbidden'
      } else {
        // Generic error - don't expose internals
        message = this.translate('errors.generic.unexpected_error', lang)
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
          requestId,
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
      error: error ?? STATUS_CODES[status] ?? 'Internal Server Error',
      ...(code ? { code } : {}),
      message,
      ...(fieldErrors ? { errors: fieldErrors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(requestId ? { requestId } : {}),
    })
  }
}
