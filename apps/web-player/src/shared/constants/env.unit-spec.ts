import { describe, expect, it } from 'vitest'
import { envSchema } from '../../../env.schema'

const productionEnvironment = {
  API_URL: 'http://api:3000',
  NEXT_PUBLIC_API_URL: 'https://api.example.com',
  NODE_ENV: 'production',
}

describe('web-player production environment', () => {
  it('requires a secure, non-local canonical site origin', () => {
    expect(envSchema.safeParse(productionEnvironment).success).toBe(false)
    expect(
      envSchema.safeParse({
        ...productionEnvironment,
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3001',
      }).success,
    ).toBe(false)
  })

  it('accepts a configured HTTPS site origin', () => {
    expect(
      envSchema.safeParse({
        ...productionEnvironment,
        NEXT_PUBLIC_SITE_URL: 'https://player.example.com',
      }).success,
    ).toBe(true)
  })
})
