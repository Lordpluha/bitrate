import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['local', 'development', 'production']).default('local'),

  // Public URLs
  NEXT_PUBLIC_API_URL: z.string().url(),

  API_URL: z.string().url(),

  // Analytics
  // NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  // NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  // Sentry
  // NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

export type envType = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends envType {
      __envSchemaBrand?: undefined;
    }
  }
}
