// biome-ignore-all lint/complexity/noStaticOnlyClass: a Nest module is a decorated class and
// `forRoot()` is static on the real `SentryModule` this stands in for — an object literal
// cannot carry `@Module` metadata, and a decorator between the comment and the class keeps a
// line-level suppression from attaching.

import { Module } from '@nestjs/common'

/**
 * Stand-in for `@sentry/nestjs/setup` in integration specs — see
 * `./sentry-nestjs.ts` for why the real package cannot be loaded here.
 *
 * `AppModule` imports `SentryModule.forRoot()`, so the stub only has to satisfy
 * that call with an empty module: the specs assert application wiring, never
 * error reporting.
 */
@Module({})
export class SentryModule {
  /** Matches `SentryModule.forRoot()` in `app.module.ts`. */
  static forRoot() {
    return { module: SentryModule }
  }
}
