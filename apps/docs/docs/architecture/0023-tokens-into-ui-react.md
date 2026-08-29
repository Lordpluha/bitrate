# ADR-0023: Hand-write the design tokens as CSS; retire the token generator

Status: Accepted

Date: 2026-08-29

## Context

The design system ran through three workspace packages and a build step. `@spotify/tokens`
held `tokens.json` — every colour, scale, and semantic role as data. `@spotify/tokens-generator`
was a CLI that read those values, applied `packages/ui-react/tokens.config.mjs`, and wrote
the Tailwind v4 `@theme` layers under `packages/ui-react/src/styles/`, plus a
`tokens.manifest.json` for the Storybook token pages. `@spotify/ui-react` consumed all of it.

The split implied reuse that never happened: the generator appeared in exactly one
`package.json` and the token package in **none** — `vite.config.ts` reached for
`@spotify/tokens/icons` as an undeclared dependency that resolved only because the pnpm store
is hoisted.

It also priced every change badly. Adding one semantic role meant a value in `tokens.json`, a
group entry in `tokens.config.mjs`, a regeneration, and a commit of the regenerated output —
four steps producing a file whose content a developer could have typed in one. The generated
CSS was committed anyway, so the repository carried both the input and the output of a
transformation that only ever ran here, in one direction, for one consumer.

## Decision

The CSS is the source. `packages/ui-react/src/styles/` holds hand-written Tailwind v4
`@theme` layers, and there is no `tokens.json`, no generator, and no manifest.

| Was | Is now |
|---|---|
| `packages/tokens/tokens.json` | the `@theme` / `:root.light` blocks in `src/styles/` |
| `packages/tokens/icons/` | `packages/ui-react/assets/icons/` |
| `packages/tokens-generator/` | removed |
| `packages/ui-react/tokens.config.mjs` | removed — file layout *is* the config |
| `src/styles/tokens.manifest.json` | removed — see below |

The file layout carries the structure the config used to describe: `palette.css` for raw
colours, `layout.css` and `typography.css` for the scales, and `themes.css` as an
import-only barrel over `themes/base.css`, `themes/global/*.css`, and one
`themes/components/<name>.css` per component — shared only where components are one family.

The `design/Palette` and `design/Theme` Storybook pages keep working by parsing the
stylesheets, through `src/styles/token-docs.ts` and `import.meta.glob(…, { query: '?raw' })`.
That keeps a single source: a role added to a part-file appears in the docs with no second
list to update.

## Consequences

- Changing a token is one edit to one file, visible in the diff as the value it is.
- Three invariants lose their enforcement and become conventions: a role must be declared in
  exactly one part-file, must appear in **both** the `@theme` and `:root.light` blocks, and a
  new part-file must be added to the `themes.css` barrel. A role missing from `:root.light`
  keeps its dark value in the light theme rather than failing loudly.
  `.claude/rules/styling.md` and `apps/docs/docs/brand/tokens.md` state all three.
- The `UI React Generated Tokens` CI job loses its regeneration/diff check and becomes
  `UI React Design Tokens`, keeping the `pnpm check:tokens` gate that catches stock Tailwind
  colours — the failure mode that actually bit this repo.
- A second consumer of these tokens (a React Native or Tauri bridge) can no longer read a
  machine-readable value file. It would have to parse the CSS, as the Storybook pages now do,
  or reintroduce a value source. That is the real cost of this decision.

## Alternatives considered

- **Keep the generator, fold the packages in.** The intermediate state this ADR replaces. It
  removed the cross-package coordination but kept a build step whose only output was
  committed CSS.
- **Keep `tokens.json`, drop the generator, hand-write the CSS from it.** Two sources for the
  same values, guaranteed to drift, with nothing checking them against each other.
- **Keep the manifest as a hand-maintained file.** It would rot the first time a role was
  renamed — precisely what generating it had prevented.
