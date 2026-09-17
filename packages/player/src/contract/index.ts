/**
 * Public contract for `<bitrate-player>` — types, event names, and a thin client. Zero Svelte
 * imports; this module must stay importable from a server bundle (Next.js, Nitro) with no DOM
 * and no custom-element registry. See `.claude/rules/player-rules.md`.
 */

/** Which chrome the player renders around its transport controls. */
export type PlayerChrome = 'bar' | 'mini' | 'none'
