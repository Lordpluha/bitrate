import { jest } from '@jest/globals'

/**
 * Stand-in for `@sentry/nestjs` in unit and integration specs.
 *
 * Importing the real package under ts-jest on Node 24 throws
 * `TypeError: The "original" argument must be of type function` while
 * `@sentry/node`'s HTTP integration loads, which fails a whole suite before a
 * single test runs. The application itself boots fine — the failure is specific
 * to the CommonJS interop the test transform produces, not to the runtime.
 *
 * Both suites reach it through `moduleNameMapper` in `test/jest-unit.json` and
 * `test/jest-int.json`, so specs assert on `captureException` without their own
 * `jest.mock('@sentry/nestjs')`. Only the surface the API
 * actually calls is stubbed, so a new `Sentry.*` call site fails loudly here
 * rather than silently reporting nothing.
 */

/** Matches `Sentry.captureException(error, context)`. */
export const captureException = jest.fn()

/** Matches `Sentry.logger.info(...)` in `app.controller.ts`. */
export const logger = {
  info: (): void => undefined,
  warn: (): void => undefined,
  error: (): void => undefined,
}

/** No-op stand-in for the method decorator on `HttpExceptionFilter.catch`. */
export const SentryExceptionCaptured = (): MethodDecorator => () => undefined
