import ms, { type StringValue } from 'ms'
import { z } from 'zod'

const booleanFromEnv = z.preprocess((value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}, z.boolean())

/** The env schema value. */
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    /**
     * Port of the operator process (`main.admin.ts`, #458); `PORT` belongs to the public API. Not
     * `ADMIN_PORT`: the admin panel's dev server already reads that name.
     */
    ADMIN_API_PORT: z.coerce.number().int().min(1).max(65_535).default(3007),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
    HEALTH_CHECK_TIMEOUT_MS: z.coerce.number().int().min(100).max(10_000).default(2_000),
    METRICS_TOKEN: z.string().min(32).optional(),
    /**
     * Internal-only health and metrics port of the standalone transcode worker (never published,
     * ADR-0049). Distinct from `PORT`, which the worker does not open.
     */
    WORKER_HTTP_PORT: z.coerce.number().int().min(1).max(65_535).default(9101),
    WEB_HOST: z.url(),
    USER_WEB_HOST: z.url().optional(),
    ARTIST_WEB_HOST: z.url().optional(),
    ADMIN_WEB_HOST: z.url().optional(),

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

    /**
     * Key-encryption key for per-track content keys (ADR-0077): 32 bytes as 64 lowercase hex
     * characters. Unset means new uploads are not encrypted. Back it up with the database:
     * losing it makes every encrypted track unplayable.
     */
    PLAYBACK_KEY_ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-f]{64}$/, 'Must be 32 bytes as 64 lowercase hex characters')
      .optional(),

    /**
     * Parent domain the auth cookies are scoped to, e.g. `.bitrate.me`.
     * Unset means host-only cookies, which is correct on localhost but leaves the
     * web apps unable to read a session issued by the API on another subdomain.
     */
    COOKIE_DOMAIN: z.string().min(1).optional(),
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
    DEV_MAIL_LOG_TOKENS: booleanFromEnv.default(false),

    // Database
    DATABASE_URL: z.url(),

    // Redis
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().default(6379),
    /** Optional: local development runs Redis without auth, production sets requirepass. */
    REDIS_PASSWORD: z.string().optional(),

    // Sentry
    SENTRY_DSN: z.string().url().optional(),

    // S3-compatible object storage (SeaweedFS in every stack, ADR-0050) — the only storage backend
    S3_ENDPOINT: z.url(),
    S3_REGION: z.string().default('us-east-1'),
    S3_BUCKET: z.string().min(1),
    S3_ACCESS_KEY: z.string().min(1),
    S3_SECRET_KEY: z.string().min(1),
    S3_PUBLIC_URL: z.string().url().optional(),
    S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
    /**
     * Closes a storage socket that carried no bytes for this long; 0 disables it. Set on the
     * transcode worker only, where a silent storage hang would otherwise hold a job active
     * forever. The API leaves it off: playback streams an object for a whole track at
     * real-time pace, and a paused listener legitimately leaves that socket idle.
     */
    S3_SOCKET_TIMEOUT_MS: z.coerce.number().int().min(0).max(600_000).default(0),

    /**
     * Directory for the audio pipeline's local working files: upload temp files, and the
     * per-job scratch directories the consumer downloads masters into. Production points it
     * at the on-disk `worker_tmp` volume; unset, it is the OS temp directory.
     */
    AUDIO_SCRATCH_ROOT: z.string().min(1).optional(),

    /**
     * Whether `AudioProcessingConsumer`'s BullMQ worker actually claims and runs jobs.
     * Defaults on for the real API process. A seed entrypoint that boots the full
     * `AppModule` (`src/infra/seeds/seed.ts`) sets this to `false` before importing it
     * (see `bootstrap-env.ts`) so a `db:seed` run does not race its own conversion jobs.
     */
    AUDIO_PROCESSING_WORKER_ENABLED: booleanFromEnv.default(true),

    /**
     * Support assistant knowledge index (ADR-0075). The ingest runs only when both
     * `QDRANT_URL` and `OPENAI_API_KEY` are set; otherwise it is skipped with a log line.
     */
    QDRANT_URL: z.url().optional(),
    QDRANT_API_KEY: z.string().min(1).optional(),
    /** Key for the default embedding provider (`SUPPORT_EMBED_MODEL`, ADR-0074). */
    OPENAI_API_KEY: z.string().min(1).optional(),
    /** `provider:model`; changing it builds a new collection on the next start. */
    SUPPORT_EMBED_MODEL: z.string().min(3).default('openai:text-embedding-3-small'),
    /** Key for the default chat provider (`SUPPORT_CHAT_MODEL`). Without it the chat hands off. */
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    /** `provider:model` of the support assistant; Haiku keeps a turn near $0.0008. */
    SUPPORT_CHAT_MODEL: z.string().min(3).default('anthropic:claude-haiku-5-5'),
    /** Monthly model spend in US dollars; once reached, conversations go to an operator. */
    SUPPORT_MONTHLY_BUDGET_USD: z.coerce.number().min(0).default(10),
    /**
     * Directory holding `help/` and `legal/` knowledge sources. The image bakes them into
     * `apps/api/knowledge`; in development the API reads `apps/docs/docs` directly.
     */
    SUPPORT_KNOWLEDGE_DIR: z.string().min(1).default('../docs/docs'),
    /** Telegram bot of the support assistant (#574); the webhook answers 404 without both. */
    TELEGRAM_BOT_TOKEN: z.string().min(20).optional(),
    /** Sent by Telegram in `X-Telegram-Bot-Api-Secret-Token`; set with `setWebhook`. */
    TELEGRAM_WEBHOOK_SECRET: z
      .string()
      .regex(/^[A-Za-z0-9_-]{16,256}$/)
      .optional(),

    // CDN
    // CDN_URL: z.string().url().optional(),

    // Postfix
    // POSTFIX_DOMAIN: z.string(),
    // POSTFIX_USER: z.string(),
    // POSTFIX_PASS: z.string(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && env.DEV_MAIL_LOG_TOKENS) {
      ctx.addIssue({
        code: 'custom',
        path: ['DEV_MAIL_LOG_TOKENS'],
        message: 'DEV_MAIL_LOG_TOKENS must be disabled in production',
      })
    }

    if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASS)) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_USER'],
        message: 'SMTP_USER and SMTP_PASS must be configured together',
      })
    }
    if (env.SMTP_HOST && !env.EMAIL_FROM) {
      ctx.addIssue({
        code: 'custom',
        path: ['EMAIL_FROM'],
        message: 'EMAIL_FROM is required when SMTP_HOST is configured',
      })
    }
  })

/** Defines the env type. */
export type envType = z.infer<typeof envSchema>
