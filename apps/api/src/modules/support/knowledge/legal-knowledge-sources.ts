/**
 * Legal texts the assistant may quote: published versions only, never drafts with
 * `[[placeholders]]` (ADR-0074). Keyed by file name under `legal/`; the URL is the public page.
 * The API image copies exactly these files (apps/api/Dockerfile).
 */
export const LEGAL_KNOWLEDGE_SOURCES: Readonly<Record<string, { url: string }>> = {
  'privacy-policy.md': { url: 'https://bitrate.me/legal/privacy' },
  'terms-of-use.md': { url: 'https://bitrate.me/legal/terms' },
}
