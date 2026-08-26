import { z } from 'zod'

/**
 * Shape of the environment, without the deployment-time requirements.
 *
 * A build only needs the variables to be *well-formed*; which of them must be
 * present depends on whether the build is producing a deployable artifact.
 */
const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['local', 'development', 'production']).default('local'),

  // Public URLs
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  API_URL: z.string().url().optional(),

  // Analytics
  // NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  // NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  // Sentry
  // NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
})

/**
 * The shape plus everything a deployable artifact must carry.
 */
export const envSchema = baseEnvSchema.superRefine((environment, context) => {
  if (environment.NODE_ENV !== 'production') return

  for (const key of ['API_URL', 'NEXT_PUBLIC_API_URL'] as const) {
    if (!environment[key]) {
      context.addIssue({
        code: 'custom',
        message: `${key} is required in production`,
        path: [key],
      })
    }
  }

  if (!environment.NEXT_PUBLIC_SITE_URL) {
    context.addIssue({
      code: 'custom',
      message: 'NEXT_PUBLIC_SITE_URL is required in production',
      path: ['NEXT_PUBLIC_SITE_URL'],
    })
  } else {
    const siteUrl = new URL(environment.NEXT_PUBLIC_SITE_URL)
    if (siteUrl.protocol !== 'https:') {
      context.addIssue({
        code: 'custom',
        message: 'NEXT_PUBLIC_SITE_URL must use HTTPS in production',
        path: ['NEXT_PUBLIC_SITE_URL'],
      })
    }

    if (siteUrl.hostname === 'localhost' || siteUrl.hostname === '127.0.0.1') {
      context.addIssue({
        code: 'custom',
        message: 'NEXT_PUBLIC_SITE_URL cannot point to localhost in production',
        path: ['NEXT_PUBLIC_SITE_URL'],
      })
    }

    if (siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
      context.addIssue({
        code: 'custom',
        message:
          'NEXT_PUBLIC_SITE_URL must be an origin without a path or query',
        path: ['NEXT_PUBLIC_SITE_URL'],
      })
    }
  }
})

export type envType = z.infer<typeof envSchema>

type ParseWebEnvInput = {
  environment: NodeJS.ProcessEnv
  /**
   * Demand the deployment URLs.
   *
   * `next build` runs with `NODE_ENV=production` even for a local smoke build
   * or a container image that is handed its configuration at deploy time, so
   * production mode alone cannot stand in for "this artifact is being
   * deployed". The Dockerfile that produces the deployable image sets
   * `ENFORCE_DEPLOY_ENV` alongside the real URLs; lint, typecheck and E2E runs
   * legitimately have none, and a developer machine with no `.env` still
   * compiles.
   */
  enforceDeployment?: boolean
}

export const parseWebEnv = ({
  environment,
  enforceDeployment = false,
}: ParseWebEnvInput) =>
  (enforceDeployment ? envSchema : baseEnvSchema).parse(environment)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends envType {
      __envSchemaBrand?: undefined
    }
  }
}
