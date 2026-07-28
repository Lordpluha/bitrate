import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import * as Sentry from '@sentry/nestjs'

/** Represents the app controller. */
@ApiTags('Welcome')
@Controller()
export class AppController {
  /** Runs the get welcome operation. */
  @Get()
  getWelcome(): string {
    return `Welcome to ${process.env.npm_package_name}!`
  }

  /** Runs the get health operation. */
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: process.env.npm_package_name ?? 'api',
      version: process.env.npm_package_version ?? 'unknown',
      env: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    }
  }

  /** Runs the get error operation. */
  @Get('/debug-sentry')
  getError() {
    // Send a log before throwing the error
    Sentry.logger.info('User triggered test error', {
      action: 'test_error_endpoint',
    })
    // Send a test metric before throwing the error
    Sentry.metrics.count('test_counter', 1)
    throw new Error('My first Sentry error!')
  }
}
