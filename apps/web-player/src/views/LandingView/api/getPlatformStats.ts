import 'server-only'

import {
  type PlatformStats,
  parsePlatformStats,
  worthShowing,
} from '../model/platformStats'

/** The API recomputes the totals every five minutes; the landing re-asks on the same beat. */
const REVALIDATE_S = 300
/** A slow API must not hold the landing's first byte. */
const TIMEOUT_MS = 2000

/**
 * Public platform totals for the landing, fetched on the server so the numbers are in the first
 * HTML. Any failure yields `null` and the landing simply leaves the numbers out.
 */
export const getPlatformStats = async (): Promise<PlatformStats | null> => {
  const base = process.env.API_URL?.replace(/\/$/, '')
  if (!base) return null
  try {
    const res = await fetch(`${base}/api/v1/platform/stats`, {
      next: { revalidate: REVALIDATE_S },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return null
    const stats = parsePlatformStats(await res.json())
    /* small totals would argue against signing up: leave them out until they grow */
    return stats && worthShowing(stats) ? stats : null
  } catch {
    return null
  }
}
