/**
 * Sentry first, before anything else is imported. Its instrumentation patches modules as `init()`
 * runs, so a module already loaded by an earlier import is never traced — Nest, Express and the
 * Postgres driver among them. It sits in its own block because Biome sorts within blocks but keeps
 * their order, and alphabetical sorting had previously placed this line below every other import.
 */
import './instrument'

import { Logger } from '@nestjs/common'

import { AppModule } from './app.module'
import { bootstrapHttp } from './http-bootstrap'

/** The public API: listener and artist routes. Operators are served by `main.admin.ts` (#458). */
bootstrapHttp(AppModule, 'public').catch((error: unknown) => {
  new Logger('Bootstrap').error(
    'Fatal error during bootstrap',
    error instanceof Error ? error.stack : error,
  )
  process.exit(1)
})
