# ADR-0047: Move design-token CSS out of ui-react into packages/tailwind

Status: Accepted

Date: 2026-09-25

## Context

ADR-0023 made `packages/ui-react/src/styles/` the hand-written source of every Tailwind v4
design token, with `themes.css` as the package's public CSS export. That was correct for a
single consumer, but three more apps import `@bitrate/ui-react/themes.css` purely for its
tokens: `apps/web-player`, `apps/web-artists`, and `apps/admin`. None of them use ui-react's
React components — admin is Angular and cannot — so each carried a `workspace:*` dependency
on a React component library, and its transitive build tooling (`@bitrate/svgr`,
`@bitrate/vite-svgr`), to reach four CSS files. Every Docker image for those three apps
copied `packages/ui-react/package.json` and its own dependency tree into the pnpm install
stage before it could resolve `themes.css`, whether or not the app ever imported a component
from the package.

## Decision

The token CSS moves to a new package, `packages/tailwind`, with no dependencies, no build
step, and a single export: `@bitrate/tailwind/themes.css`. `packages/ui-react` becomes a
consumer of it like any other app — its own `index.css` and Storybook build import the same
export — rather than the owner. `@bitrate/ui-react/themes.css` no longer exists; there is no
compatibility re-export, so every consumer points at `@bitrate/tailwind` directly.

`apps/admin` drops `@bitrate/ui-react` entirely: tokens were the only reason it depended on
the package, per `.claude/rules/admin-rules.md` ("consume ui-react CSS tokens, never its
React runtime"). Its Dockerfile no longer copies `packages/ui-react`, `packages/svgr`, or
`packages/vite-svgr` into the dependencies stage, since nothing in its graph needs them once
`@bitrate/ui-react` is gone.

`apps/web-player` and `apps/web-artists` keep `@bitrate/ui-react` (they use its components)
and add `@bitrate/tailwind` alongside it. Their per-app `@theme { --breakpoint-* }`
overrides, which already diverge from ui-react's and from each other, are preserved as-is —
this move relocates the token source, it does not reconcile the drift between consumers.

`packages/ui-react/src/styles/token-docs.ts`, which backs the Storybook `design/Palette` and
`design/Theme` doc pages, stays in `packages/ui-react` along with the `.stories.tsx` files it
serves — Storybook is ui-react's own tool. It now reads the moved CSS through a relative
`import.meta.glob` path into the sibling package's `src/`, the same way it always read its
own package's source directly: `@bitrate/tailwind`'s export map exposes only the bundled
`themes.css`, nothing a doc page can introspect file-by-file, and there was no case elsewhere
in this repo for adding a second `./src/*` export just to serve one internal Vite glob.

`cn()` / `tailwind-merge` stays in `packages/ui-react/src/lib` — a class-merging helper
belongs with the components that call it, not with the tokens.

## Consequences

- Admin, web-player, and web-artists no longer need ui-react's component-library dependency
  tree in their Docker dependency stage just to install four CSS files; admin drops it
  entirely.
- `packages/tailwind` has no `package.json` scripts, no `turbo.json` entry, and nothing to
  build — it is served as source, the same way ui-react's styles always were.
- CI path filters (`ui_react.yml`, `storybook.yml`, `web_player.yml`, `web_artists.yml`,
  `admin.yml`) and the ui-react/web-player/web-artists Biome `ci` scopes now include
  `packages/tailwind/**` alongside `packages/ui-react/**`, so a token-only change still
  triggers every affected build.
- `token-docs.ts`'s cross-package relative import is the one place this decision is visible
  as a wart rather than a clean boundary: it reads `../../../tailwind/src/**` instead of a
  declared export. Accepted because the alternative — publishing raw per-file CSS as a public
  export for one internal doc tool — has no other user in the repo.
- ADR-0023 is superseded for the "where do tokens live" question; its file-layout and
  three-invariants reasoning (one owner per role, both theme blocks, barrel import) is
  unchanged and still applies, now under `packages/tailwind/src/` instead of
  `packages/ui-react/src/styles/`.

## Alternatives considered

- **Leave tokens in ui-react, let non-component consumers depend on it anyway.** The status
  quo. Keeps three apps' dependency graphs and Docker images carrying a React component
  library they cannot use, for CSS.
- **Re-export `@bitrate/ui-react/themes.css` as a compatibility shim over the new package.**
  Rejected — the request was an extraction, not a migration path; a permanent shim would
  leave two ways to reach the same tokens with no reason to prefer either.
- **Give `packages/tailwind` a `./src/*` export and have `token-docs.ts` import through it.**
  Consistent with ui-react's own `./src` export for its component source, but adds a second
  public export surface to a package that otherwise has exactly one, for a single internal
  Storybook helper. The relative path costs one comment; the export costs a permanent public
  surface.
