import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('Invalid API URL')
    .default('http://localhost:3000'),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }

  const result = envSchema.safeParse(env)

  if (!result.success) {
    console.error('Environment validation failed:', result.error.format())
    throw new Error('Invalid environment variables')
  }

  return result.data
}
