/**
 * Sentry first, before anything else is imported — see main.ts for why the order matters.
 */
import './instrument'

import { Logger } from '@nestjs/common'

import { AdminAppModule } from './admin-app.module'
import { bootstrapHttp } from './http-bootstrap'

/**
 * The operator API (#458): the admin panel's routes in a process of their own, served on
 * `ADMIN_API_PORT` and reachable in production only through the panel's host.
 */
bootstrapHttp(AdminAppModule, 'admin').catch((error: unknown) => {
  new Logger('AdminBootstrap').error(
    'Fatal error during bootstrap',
    error instanceof Error ? error.stack : error,
  )
  process.exit(1)
})
