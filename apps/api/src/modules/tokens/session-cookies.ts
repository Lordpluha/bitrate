import type { JWTPayload } from './types'

/** The account kind a session cookie pair belongs to. */
export type SessionAudience = JWTPayload['type']

/** Which half of a session cookie pair. */
export type SessionTokenKind = 'access' | 'refresh'

/**
 * The cookie names each audience's session is stored under.
 *
 * Every session cookie is scoped to the shared `COOKIE_DOMAIN`, so the player, the artists
 * portal and the admin panel all receive each other's cookies. A shared name made one sign-in
 * overwrite another — signing in to the admin logged the player out and the other way round —
 * so each audience owns its own pair. Mirrored for the web apps in
 * `@bitrate/contracts/auth-cookies`; `session-cookies.unit-spec.ts` keeps the two in step.
 */
export const SESSION_COOKIE_NAMES = {
  user: { access: 'user_access_token', refresh: 'user_refresh_token' },
  artist: { access: 'artist_access_token', refresh: 'artist_refresh_token' },
  staff: { access: 'staff_access_token', refresh: 'staff_refresh_token' },
} as const satisfies Record<SessionAudience, Record<SessionTokenKind, string>>

/**
 * The shared names every audience used before they were split. Cleared on every sign-in and
 * sign-out so browsers do not keep carrying a dead session; drop once those have expired.
 */
export const LEGACY_SESSION_COOKIE_NAMES = ['access_token', 'refresh_token'] as const

/** The cookie name of one half of an audience's session. */
export function sessionCookieName(audience: SessionAudience, kind: SessionTokenKind): string {
  return SESSION_COOKIE_NAMES[audience][kind]
}
