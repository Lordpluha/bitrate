import { API_BASE_URL } from './api.config'

/** The `/static/<folder>/` buckets the API serves public images from (ADR-0050). */
export type StaticMediaFolder = 'albums/covers' | 'releases/covers' | 'tracks/covers'

/**
 * Resolves a stored image value into the URL the panel renders.
 *
 * The API stores two shapes: a legacy bare file name (`cover.jpg`), joined under the entity's own
 * bucket, and a full `/static/...` path (release covers live at `/static/releases/covers/...`
 * and travel unchanged onto the album and tracks a release publishes). A path is joined to the
 * API origin as-is — re-encoding it under another bucket produced a 404. Absolute URLs (demo or
 * external covers) pass through. `null` and blanks stay `null`.
 */
export function toStaticMediaUrl(
  value: string | null | undefined,
  folder: StaticMediaFolder,
): string | null {
  const stored = value?.trim()
  if (!stored) return null
  if (/^https?:\/\//i.test(stored)) return stored
  if (stored.startsWith('/')) return `${API_BASE_URL}${stored}`
  return `${API_BASE_URL}/static/${folder}/${encodeURIComponent(stored)}`
}
