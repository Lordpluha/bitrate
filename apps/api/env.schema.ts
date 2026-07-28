import ms, { type StringValue } from 'ms'
import { z } from 'zod'

/** The env schema value. */
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['local', 'development', 'production', 'test']).default('local'),
    PORT: z.coerce.number().default(3000),
    WEB_HOST: z.url(),

    // Storage driver — selects which StorageService implementation is bound at boot
    STORAGE_DRIVER: z.enum(['s3', 'local']).default('local'),

    // Auth
    JWT_SECRET: z.string().min(10),
    JWT_ACCESS_EXPIRES_IN: z
      .string()
      .default('5m')
      .refine((v) => ms(v as StringValue) !== undefined, {
        message: 'Must be a valid time string (e.g. "15m", "7d")',
      }),
    JWT_REFRESH_EXPIRES_IN: z
      .string()
      .default('30d')
      .refine((v) => ms(v as StringValue) !== undefined, {
        message: 'Must be a valid time string (e.g. "15m", "7d")',
      }),

    ACCESS_TOKEN_NAME: z.string().min(1).default('access_token'),
    REFRESH_TOKEN_NAME: z.string().min(1).default('refresh_token'),
    OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
    OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
    OAUTH_FACEBOOK_APP_ID: z.string().optional(),
    OAUTH_FACEBOOK_APP_SECRET: z.string().optional(),
    API_BASE_URL: z.string().url().optional(),

    // Mail (optional — if unset, password-reset emails are logged but not sent)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.email().optional(),

    // Database
    DATABASE_URL: z.url(),

    // Redis
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().default(6379),

    // Sentry
    SENTRY_DSN: z.string().url().optional(),

    // S3 / Object storage (AWS S3) — required only when STORAGE_DRIVER=s3, see superRefine below
    S3_ENDPOINT: z.url().optional(),
    S3_REGION: z.string().default('us-east-1'),
    S3_BUCKET: z.string().min(1).optional(),
    S3_ACCESS_KEY: z.string().min(1).optional(),
    S3_SECRET_KEY: z.string().min(1).optional(),
    S3_PUBLIC_URL: z.string().url().optional(),
    S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),

    // CDN
    // CDN_URL: z.string().url().optional(),

    // Postfix
    // POSTFIX_DOMAIN: z.string(),
    // POSTFIX_USER: z.string(),
    // POSTFIX_PASS: z.string(),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER !== 's3') return

    const requiredForS3 = ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY'] as const
    for (const key of requiredForS3) {
      if (!env[key]) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} is required when STORAGE_DRIVER=s3`,
        })
      }
    }
  })

/** Defines the env type. */
export type envType = z.infer<typeof envSchema>
