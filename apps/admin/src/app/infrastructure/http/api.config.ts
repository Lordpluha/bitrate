import { ENV } from './env.generated'

/**
 * Base URL of the Bitrate API.
 *
 * Comes from `NG_APP_API_URL` through `scripts/with-env.mjs`, which writes `env.generated.ts`
 * from the `.env` chain before every build, serve, test and typecheck. There is no fallback on
 * purpose: a missing value fails that script with a named variable, rather than silently
 * shipping a bundle that points at localhost.
 */
export const API_BASE_URL: string = ENV.apiUrl.replace(/\/$/, '')

/** Every operator endpoint hangs off this prefix. */
export const ADMIN_API = `${API_BASE_URL}/api/v1/admin`
