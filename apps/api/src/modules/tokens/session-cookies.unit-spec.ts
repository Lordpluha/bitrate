import { resolve } from 'node:path'
import { describe, expect, it, jest } from '@jest/globals'
import { SESSION_COOKIE_NAMES } from './session-cookies'

/**
 * The web apps' copy, loaded at test time: the API cannot import the source-only contracts
 * package at runtime, and it sits outside this project's `rootDir` for the type-checker.
 */
const WEB_AUTH_COOKIES = resolve(__dirname, '../../../../../packages/contracts/src/auth-cookies.ts')

describe('session cookie names', () => {
  /** A web app reading a name the API never writes sees every visitor as signed out. */
  it('match the names the web apps read', () => {
    const web = jest.requireActual<{ SESSION_COOKIE_NAMES: unknown }>(WEB_AUTH_COOKIES)

    expect(web.SESSION_COOKIE_NAMES).toEqual(SESSION_COOKIE_NAMES)
  })

  /** One shared name let a sign-in to one app overwrite the session of another. */
  it('are distinct across every audience and token kind', () => {
    const names = Object.values(SESSION_COOKIE_NAMES).flatMap((pair) => Object.values(pair))

    expect(new Set(names).size).toBe(names.length)
  })
})
