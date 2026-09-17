/**
 * Framework-free playback engine. Empty in E0 — filled in E1.
 *
 * The engine never reads host globals (`process.env`, `NEXT_PUBLIC_*`, `import.meta.env`); it
 * receives its transport by injection from the host. See `.claude/rules/player-rules.md`.
 */
export {}
