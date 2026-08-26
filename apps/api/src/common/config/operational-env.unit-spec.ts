import { describe, expect, it } from '@jest/globals'
import { envSchema } from '../../../env.schema'

const requiredEnv = {
  WEB_HOST: 'http://localhost:3001',
  JWT_SECRET: 'test-secret-with-sufficient-length',
  DATABASE_URL: 'postgresql://user:password@localhost:5432/test',
  REDIS_HOST: 'localhost',
}

describe('operational environment schema', () => {
  it('does not trust forwarding headers by default', () => {
    expect(envSchema.parse(requiredEnv).TRUST_PROXY_HOPS).toBe(0)
  })

  it('rejects unsafe proxy hop counts', () => {
    expect(() => envSchema.parse({ ...requiredEnv, TRUST_PROXY_HOPS: -1 })).toThrow()
    expect(() => envSchema.parse({ ...requiredEnv, TRUST_PROXY_HOPS: 6 })).toThrow()
  })

  it('requires a high-entropy-sized metrics token when enabled', () => {
    expect(() => envSchema.parse({ ...requiredEnv, METRICS_TOKEN: 'short' })).toThrow()
    expect(
      envSchema.parse({ ...requiredEnv, METRICS_TOKEN: 'm'.repeat(32) }).METRICS_TOKEN,
    ).toHaveLength(32)
  })

  it('allows explicit development mail URLs but rejects them in production', () => {
    expect(
      envSchema.parse({ ...requiredEnv, NODE_ENV: 'development', DEV_MAIL_LOG_TOKENS: 'true' })
        .DEV_MAIL_LOG_TOKENS,
    ).toBe(true)
    expect(() =>
      envSchema.parse({ ...requiredEnv, NODE_ENV: 'production', DEV_MAIL_LOG_TOKENS: 'true' }),
    ).toThrow('DEV_MAIL_LOG_TOKENS must be disabled in production')
  })

  it('supports an unauthenticated local SMTP capture server', () => {
    expect(
      envSchema.parse({
        ...requiredEnv,
        SMTP_HOST: 'localhost',
        SMTP_PORT: '1025',
        EMAIL_FROM: 'no-reply@spotify.local',
      }),
    ).toMatchObject({ SMTP_HOST: 'localhost', SMTP_PORT: 1025 })
  })

  it('rejects partial SMTP credentials and a missing sender', () => {
    expect(() =>
      envSchema.parse({ ...requiredEnv, SMTP_HOST: 'smtp.example.com', SMTP_USER: 'user' }),
    ).toThrow()
    expect(() => envSchema.parse({ ...requiredEnv, SMTP_HOST: 'smtp.example.com' })).toThrow(
      'EMAIL_FROM is required when SMTP_HOST is configured',
    )
  })
})
