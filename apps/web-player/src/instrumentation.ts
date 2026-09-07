import * as Sentry from '@sentry/nextjs'

/** Loads the Sentry config for whichever runtime Next.js is booting. */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

/** Captures unhandled server errors from Server Components, routes and proxy. */
export const onRequestError = Sentry.captureRequestError
