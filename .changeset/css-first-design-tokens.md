---
'@bitrate/ui-react': minor
---

The design tokens are now plain CSS that you edit directly. `@spotify/tokens` (the values)
and `@spotify/tokens-generator` (the CLI that turned them into stylesheets) are gone, along
with `tokens.config.mjs` and the generated `tokens.manifest.json`. What was previously the
generator's output — the Tailwind v4 `@theme` layers under `src/styles/` — is now the source
itself: change a value, save, done. Nothing to regenerate, no config to keep in step with a
value file, no build step between a colour and the utility that uses it.

The role layout that split introduced survives. `themes.css` is an import-only barrel over
`src/styles/themes/`: `base.css` for the shadcn role set, `global/*.css` for roles not tied
to a component, and `components/<name>.css` — one file per component, with a shared file
only where components are genuinely one family (`button.css`, `input.css`, `overlay.css`,
`collection.css`). Each part carries both the dark declarations and its `:root.light`
overrides, so a role's whole story is readable in one place, and component-scoped roles
alias the semantic role they are built on rather than repeating a literal.

The `design/Palette` and `design/Theme` Storybook pages read the stylesheets themselves
through `src/styles/token-docs.ts`, so they still list exactly what the CSS declares — a
role added to a part-file appears without anyone touching a story. The Storybook toolbar
keeps its theme toggle, and `components.json` keeps the correction that pointed it at the
files this package actually has.

What is lost is the generator's cross-check: it refused to run when a role was claimed by
two part-files, claimed by none, or missing from a theme. Those three invariants are now
conventions, documented in the design-token contract.
