/**
 * The cookie names the API stores each account kind's session under.
 *
 * Every session cookie lives on the shared parent domain, so the player, the artists portal and
 * the admin panel all receive each other's cookies; each kind owns its own pair so that one
 * sign-in never overwrites another. Mirrors `SESSION_COOKIE_NAMES` in
 * `apps/api/src/modules/tokens/session-cookies.ts`, which a unit spec there keeps in step.
 */
export const SESSION_COOKIE_NAMES = {
  user: { access: 'user_access_token', refresh: 'user_refresh_token' },
  artist: { access: 'artist_access_token', refresh: 'artist_refresh_token' },
  staff: { access: 'staff_access_token', refresh: 'staff_refresh_token' },
} as const

/** The account kind a session cookie pair belongs to. */
export type SessionAudience = keyof typeof SESSION_COOKIE_NAMES
