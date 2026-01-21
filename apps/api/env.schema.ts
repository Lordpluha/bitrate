import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['local', 'development', 'production', 'test']).default('local'),
  PORT: z.coerce.number().default(3000),
  WEB_HOST: z.url(),

  // Auth
  JWT_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES_IN: z.string().default('5m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  ACCESS_TOKEN_NAME: z.string().min(1).default('access_token'),
  REFRESH_TOKEN_NAME: z.string().min(1).default('refresh_token'),
  // OAUTH_GOOGLE_CLIENT_ID: z.string(),
  // OAUTH_GOOGLE_CLIENT_SECRET: z.string(),

  // Mail
  // SMTP_HOST: z.string(),
  // SMTP_PORT: z.coerce.number().default(587),
  // SMTP_USER: z.string(),
  // SMTP_PASS: z.string(),
  // EMAIL_FROM: z.string().email(),

  // Database
  DATABASE_URL: z.url(),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),

  // Sentry
  // SENTRY_DSN: z.string().url().optional(),

  // CDN
  // CDN_URL: z.string().url().optional(),

  // Postfix
  // POSTFIX_DOMAIN: z.string(),
  // POSTFIX_USER: z.string(),
  // POSTFIX_PASS: z.string(),
})

export type envType = z.infer<typeof envSchema>
