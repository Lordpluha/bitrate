import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from '@jest/globals'
import { envSchema } from '../../../env.schema'

const requiredEnv = {
  WEB_HOST: 'http://localhost:3001',
  JWT_SECRET: 'test-secret-with-sufficient-length',
  DATABASE_URL: 'postgresql://user:password@localhost:5432/test',
  REDIS_HOST: 'localhost',
  S3_ENDPOINT: 'http://localhost:8333',
  S3_BUCKET: 'bitrate-audio',
  S3_ACCESS_KEY: 'access-key',
  S3_SECRET_KEY: 'secret-key',
}

describe('operational environment schema', () => {
  it.each([
    'S3_ENDPOINT',
    'S3_BUCKET',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
  ])('requires %s, because object storage is the only storage backend', (key) => {
    const { [key]: _omitted, ...withoutKey } = requiredEnv as Record<string, string>
    expect(() => envSchema.parse(withoutKey)).toThrow(key)
  })

  it('has no storage driver switch any more', () => {
    expect(envSchema.parse({ ...requiredEnv, STORAGE_DRIVER: 'local' })).not.toHaveProperty(
      'STORAGE_DRIVER',
    )
  })

  it('accepts the local Compose metrics token and matches the Prometheus credential', () => {
    const root = resolve(__dirname, '../../../../..')
    const compose = readFileSync(resolve(root, 'infra/docker-compose.preprod.yaml'), 'utf8')
    const prometheus = readFileSync(
      resolve(root, 'infra/observability/prometheus/prometheus.yml'),
      'utf8',
    )
    const token = compose.match(/METRICS_TOKEN: \$\{METRICS_TOKEN:-([^}]+)\}/)?.[1]
    expect(token).toBeDefined()
    expect(envSchema.parse({ ...requiredEnv, METRICS_TOKEN: token }).METRICS_TOKEN).toBe(token)
    expect(prometheus.match(/^\s+credentials: (\S+)$/m)?.[1]).toBe(token)
  })

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
        EMAIL_FROM: 'no-reply@bitrate.local',
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
