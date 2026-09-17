import { describe, expect, it } from '@jest/globals'
import { assertAllowedEnvironment } from './seed-admin.guard'

const LOCAL_DATABASE_URL = 'postgresql://admin:admin@localhost:5432/bitrate'
const DOCKER_DATABASE_URL = 'postgresql://admin:admin@postgres:5432/bitrate'
const DOCKER_TEST_DATABASE_URL = 'postgresql://admin:admin@postgres_test:5432/bitrate_test'
const REMOTE_DATABASE_URL = 'postgresql://admin:admin@db.production.example.com:5432/bitrate'

describe('assertAllowedEnvironment', () => {
  it('allows a development environment against a local database', () => {
    expect(() =>
      assertAllowedEnvironment({ NODE_ENV: 'development', DATABASE_URL: LOCAL_DATABASE_URL }),
    ).not.toThrow()
  })

  it('allows a test environment against a local database', () => {
    expect(() =>
      assertAllowedEnvironment({ NODE_ENV: 'test', DATABASE_URL: LOCAL_DATABASE_URL }),
    ).not.toThrow()
  })

  it('allows an environment with NODE_ENV unset, against a local database', () => {
    expect(() => assertAllowedEnvironment({ DATABASE_URL: LOCAL_DATABASE_URL })).not.toThrow()
  })

  it('allows the docker-compose postgres and postgres_test service hostnames', () => {
    expect(() =>
      assertAllowedEnvironment({ NODE_ENV: 'development', DATABASE_URL: DOCKER_DATABASE_URL }),
    ).not.toThrow()
    expect(() =>
      assertAllowedEnvironment({
        NODE_ENV: 'development',
        DATABASE_URL: DOCKER_TEST_DATABASE_URL,
      }),
    ).not.toThrow()
  })

  it('refuses a production environment by default', () => {
    expect(() =>
      assertAllowedEnvironment({ NODE_ENV: 'production', DATABASE_URL: LOCAL_DATABASE_URL }),
    ).toThrow(/NODE_ENV=production/)
  })

  it('refuses production regardless of any ADMIN_FIXTURES_ALLOW_PRODUCTION value — no override exists', () => {
    expect(() =>
      assertAllowedEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: LOCAL_DATABASE_URL,
        ADMIN_FIXTURES_ALLOW_PRODUCTION: 'yes',
      }),
    ).toThrow(/NODE_ENV=production/)

    expect(() =>
      assertAllowedEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: LOCAL_DATABASE_URL,
        ADMIN_FIXTURES_ALLOW_PRODUCTION: 'false',
      }),
    ).toThrow(/NODE_ENV=production/)

    expect(() =>
      assertAllowedEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: LOCAL_DATABASE_URL,
        ADMIN_FIXTURES_ALLOW_PRODUCTION: 'true',
      }),
    ).toThrow(/NODE_ENV=production/)
  })

  it('refuses production even with the remote-DB opt-in and a local host', () => {
    expect(() =>
      assertAllowedEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: LOCAL_DATABASE_URL,
        ADMIN_FIXTURES_ALLOW_REMOTE_DB: 'true',
      }),
    ).toThrow(/NODE_ENV=production/)
  })

  it('refuses a non-local DATABASE_URL host by default', () => {
    expect(() =>
      assertAllowedEnvironment({ NODE_ENV: 'development', DATABASE_URL: REMOTE_DATABASE_URL }),
    ).toThrow(/non-local database/)
  })

  it('refuses a missing DATABASE_URL by default rather than assuming it is local', () => {
    expect(() => assertAllowedEnvironment({ NODE_ENV: 'development' })).toThrow(
      /non-local database/,
    )
  })

  it('refuses an unparseable DATABASE_URL by default', () => {
    expect(() =>
      assertAllowedEnvironment({ NODE_ENV: 'development', DATABASE_URL: 'not-a-url' }),
    ).toThrow(/non-local database/)
  })

  it('allows a non-local DATABASE_URL host when explicitly opted in', () => {
    expect(() =>
      assertAllowedEnvironment({
        NODE_ENV: 'development',
        DATABASE_URL: REMOTE_DATABASE_URL,
        ADMIN_FIXTURES_ALLOW_REMOTE_DB: 'true',
      }),
    ).not.toThrow()
  })

  it('does not treat a falsy-looking opt-in value as an override', () => {
    expect(() =>
      assertAllowedEnvironment({
        NODE_ENV: 'development',
        DATABASE_URL: REMOTE_DATABASE_URL,
        ADMIN_FIXTURES_ALLOW_REMOTE_DB: 'false',
      }),
    ).toThrow(/non-local database/)
  })
})
