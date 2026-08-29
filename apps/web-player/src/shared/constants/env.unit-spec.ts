import { describe, expect, it } from 'vitest'
import { envSchema, parseWebEnv } from '../../../env.schema'

const productionEnvironment: NodeJS.ProcessEnv = {
  API_URL: 'http://api:3000',
  NEXT_PUBLIC_API_URL: 'https://api.example.com',
  NODE_ENV: 'production',
}

const deployableEnvironment: NodeJS.ProcessEnv = {
  ...productionEnvironment,
  NEXT_PUBLIC_SITE_URL: 'https://player.example.com',
}

/** Every URL variable an unsupplied Docker `ARG` would leave present but empty. */
const emptyUrlEnvironment: NodeJS.ProcessEnv = {
  API_URL: '',
  NEXT_PUBLIC_API_URL: '',
  NEXT_PUBLIC_SITE_URL: '',
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

describe('web-player environment URL parsing', () => {
  it('treats an empty URL variable exactly like an unset one', () => {
    const fromEmpty = parseWebEnv({ environment: emptyUrlEnvironment })
    const fromUnset = parseWebEnv({ environment: { NODE_ENV: 'production' } })

    expect(fromEmpty.API_URL).toBeUndefined()
    expect(fromEmpty.NEXT_PUBLIC_API_URL).toBeUndefined()
    expect(fromEmpty.NEXT_PUBLIC_SITE_URL).toBeUndefined()
    expect(fromEmpty).toEqual(fromUnset)
  })

  it('still accepts a well-formed URL', () => {
    expect(
      parseWebEnv({ environment: deployableEnvironment }).NEXT_PUBLIC_SITE_URL,
    ).toBe('https://player.example.com')
  })

  it('still rejects a malformed URL', () => {
    expect(() =>
      parseWebEnv({
        environment: { ...deployableEnvironment, API_URL: 'not-a-url' },
      }),
    ).toThrow(/Invalid URL/)
  })

  it('still demands the deployment URLs when enforcement is on', () => {
    expect(() =>
      parseWebEnv({
        environment: { NODE_ENV: 'production' },
        enforceDeployment: true,
      }),
    ).toThrow(/API_URL is required in production/)
  })

  it('reports an empty deployment URL as missing, not malformed', () => {
    const parse = () =>
      parseWebEnv({
        environment: emptyUrlEnvironment,
        enforceDeployment: true,
      })

    expect(parse).toThrow(/NEXT_PUBLIC_SITE_URL is required in production/)
    expect(parse).not.toThrow(/Invalid URL/)
  })
})
