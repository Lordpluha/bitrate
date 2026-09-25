import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  /**
   * Named `VITE_API_URL` rather than `NEXT_PUBLIC_API_URL` because Vite only exposes
   * `VITE_`-prefixed variables to client code. The deployment variable keeps the old name —
   * it is shared with `apps/web-player` — and is mapped here at this app's boundary
   * (Dockerfile build arg, compose service env, CI build arg).
   */
  VITE_API_URL: z.url('Invalid API URL').default('http://localhost:3000'),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    VITE_API_URL: process.env.VITE_API_URL,
  }

  const result = envSchema.safeParse(env)

  if (!result.success) {
    console.error(
      'Environment validation failed:',
      z.treeifyError(result.error),
    )
    throw new Error('Invalid environment variables')
  }

  return result.data
}
