export { STUCK_AFTER_MS } from '@modules/admin/overview'

/** Every fixture row's password — fixture accounts only, never a credential worth protecting. */
export const FIXTURE_PASSWORD = 'Fixture-Only-Password-2026!'

/**
 * The entity types `POST /moderation/reports` accepts, mirroring
 * `apps/api/src/modules/moderation/moderation.dto.ts`'s `MODERATION_ENTITY_TYPES` (no barrel
 * exists on that module to import it through, so this is a deliberate, commented mirror rather
 * than a deep cross-module import).
 */
export const REPORT_ENTITY_TYPES = [
  'track',
  'album',
  'playlist',
  'artist',
  'podcast',
  'episode',
  'user',
] as const

/** One value from {@link REPORT_ENTITY_TYPES}. */
export type ReportEntityType = (typeof REPORT_ENTITY_TYPES)[number]
