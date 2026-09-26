# player-rules: detailed guidance

Read only the section needed for this task. The scoped rule
[../rules/player-rules.md](../rules/player-rules.md) owns the concise requirements.

# Player rules — packages/player (Svelte 5 custom element)

Read before writing any file in `packages/player/`. Pair with the `svelte` skill, which covers
Svelte 5 framework mechanics; this file is project law. The decision behind the package is
[ADR-0039](../../apps/docs/docs/architecture/0039-player-as-svelte-custom-element-package.md).

## What this package is

The audio player, extracted from `apps/web-player` into a standalone package that compiles to
the `<bitrate-player>` custom element (Web Component). It is consumed at build time by
`apps/admin` (Angular) as of ADR-0039's E1 stage, and **planned** to be consumed the same way
by `apps/web-player` (Next.js App Router) and `apps/web-artists` (TanStack Start), plus —
through an iframe embed, deployed independently of the other three — by third parties; see
the ADR's "Consequences" and its E1 status update. One package, three subpath exports, one
framework: Svelte 5. The playback engine itself is plain TypeScript, not Svelte, and lives
inside this same package rather than being extracted to its own — see "The engine stays
TypeScript" below.

## What does NOT apply here

Almost the entire web-frontend rulebook is either Next.js-specific or React-specific and does
not transfer. These are not gaps to fill — they are concepts that do not exist in this package:

| Web rule | Status in `packages/player` |
|---|---|
| FSD layers (`features/`, `entities/`, `widgets/`, `views/`) | Not used — three flat segments: `engine/`, `contract/`, `element/` |
| `'use client'` / Server Components | No server component model — this compiles to a Web Component |
| Tailwind, `cn()`, CVA | Not used — see "Styling" below |
| `@bitrate/ui-react` components | **Will not run** — a shadow root cannot see global Tailwind output, and the components are React |
| `ROUTES` from `@/shared/routes` | No router in this package |
| React rules (`react.md`) | No React in this package — Svelte 5 runes instead |
| Biome as the lint gate | This package uses ESLint + Prettier, like `apps/admin` and `apps/mobile` |

Rules that **do** apply: `.claude/rules/typescript.md` (named types, no production `any`, no
suppression shortcuts — enforced here through `typescript-eslint`'s recommended rules rather
than Biome), `.claude/rules/code-principles.md` (SOLID/DRY/KISS), and the accessibility
contract in `apps/docs/docs/brand/a11y.md`. The `<bitrate-player>` element is a set of
interactive audio transport controls; every rule in that contract — labelled controls,
keyboard operation, visible focus, reduced motion, target size — applies to it same as any
first-party UI.

## The three subpaths, and why they are separate

```
packages/player/
  src/engine/index.ts    framework-free playback engine — plain TypeScript, implemented in E1
  src/contract/index.ts  types, event names, a thin client, the React JSX augmentation
  src/element/index.ts   the <bitrate-player> element — guarded define + defineBitratePlayer()
  src/index.ts           default entry — re-exports element/index.ts (registers on import)
```

| Export | What a host imports it for |
|---|---|
| `@bitrate/player` | Registers `<bitrate-player>` as an import side effect. What every first-party app imports. |
| `@bitrate/player/contract` | Types, event names, and a thin client — safe to import from a server module, a Node script, or any place that never mounts the element. |
| `@bitrate/player/engine` | The playback engine directly, without the element — temporary, used only during the web-player migration off its own in-app player. Do not build new consumers against this path once the migration is done. |

## The contract stays Svelte-free — this is enforced, not just documented

`src/contract/**` must stay importable from a server bundle — Next.js and Nitro both render
layouts on the server, where `customElements` and the DOM do not exist — with zero Svelte
runtime dependency. It must also stay decoupled from the package's own default/`/element`
entry (which drags Svelte in) and from `/engine` — a temporary migration-only export, per
ADR-0039, not part of the stable contract. Two independent gates enforce this, and both must
keep firing:

1. In `eslint.config.js`, scoped to `src/contract/**`: an
   `@typescript-eslint/no-restricted-imports` block forbidding `svelte`, `svelte/*`, any
   `.svelte` file, `**/element`/`**/element/**`, `**/embed`/`**/embed/**`, and
   `@bitrate/player`/`@bitrate/player/element`/`@bitrate/player/engine` — **and** a
   `no-restricted-syntax` rule for `ImportExpression`, since `no-restricted-imports` only
   checks static `import`/`export ... from`, never a dynamic `import()`. `import type` /
   `export type` are allowed everywhere — they erase at compile time.
2. `src/contract/__tests__/contract-boundary.unit-spec.ts`, a Vitest spec that walks
   `src/contract/**` on disk and parses every file with the real TypeScript compiler AST
   (`runtime-import-scanner.ts`, unit-tested directly on source strings in its own spec),
   asserting no forbidden runtime import specifier. This is the one that survives an ESLint
   config regression — the lint rule can be accidentally dropped from `eslint.config.js`, but
   the spec still fails. A single regex over source lines is not enough here: it missed a bare
   `import 'svelte'`, a dynamic `await import('svelte')`, and a directory import with no
   trailing slash (`from '../element'`) — the AST walk does not.

A change to `src/contract/**` that needs a Svelte import is a signal the code belongs in
`src/element/` instead, not a reason to weaken either gate.

**Probe checklist** — every import shape both gates must catch, verified with
`eslint --stdin --stdin-filename src/contract/probe.ts` (no probe file left on disk) plus the
scanner's own unit spec on the equivalent string: `import { a } from '../element'`,
`export { a } from '../element'`, `import 'svelte'`, `await import('svelte')`,
`from '../element/index'` (no trailing slash), `from 'svelte'`, `from './Foo.svelte'`,
`from '@bitrate/player'`. And the one shape that must **not** be caught:
`import type … from 'svelte'`. See `.claude/references/architecture-checklist.md` § "Player-1".

## The engine takes an injected transport — no host globals

`src/engine/index.ts` is implemented (E1); the engine never reads a host global directly — no `process.env`, no `NEXT_PUBLIC_*`, no
`import.meta.env`, no `window` feature-detection baked in at the top level. It receives
whatever it needs — a fetch implementation, a base URL, a logger — through constructor/factory
injection from the host. Three consuming apps (Next.js, Angular, TanStack Start on Nitro) each
have a different environment-variable convention and a different SSR boundary; an engine that
reads `process.env` directly breaks on two of the three and is untestable in isolation on the
third.

## SSR guard and `defineBitratePlayer()`

`customElements` does not exist during server rendering — but that alone is not enough.
Compiling `BitratePlayer.svelte` with the `customElement` option means the compiled component
module calls `svelte/internal/client`'s `create_custom_element` **at module evaluation time**,
which extends `HTMLElement`. `HTMLElement` does not exist in Node either, so a *static* top-level
`import BitratePlayerElement from './BitratePlayer.svelte'` at the top of `src/element/index.ts`
throws `TypeError: Class extends value undefined is not a constructor or null` the moment
`@bitrate/player` is imported from a server bundle — before any SSR guard in `defineBitratePlayer`
ever runs, because the crash happens at *import* time, not at *call* time.

The fix is that the compiled component is never imported statically at all. `src/element/index.ts`
loads it with a dynamic `import()`, and only from inside `defineBitratePlayer()`, after the SSR
guard has already confirmed a real registry exists to receive it:

```ts
let registration: Promise<void> | null = null

export function defineBitratePlayer(): Promise<void> {
  if (typeof customElements === 'undefined') return Promise.resolve()
  if (customElements.get(BITRATE_PLAYER_TAG_NAME)) return Promise.resolve()
  if (registration) return registration

  registration = import('./BitratePlayer.svelte')
    .then((module) => {
      if (customElements.get(BITRATE_PLAYER_TAG_NAME)) return
      const { element } = module.default
      if (!element) throw new Error(/* ... */)
      customElements.define(BITRATE_PLAYER_TAG_NAME, element)
    })
    .catch((error) => {
      registration = null
      console.error(/* ... */, error)
      throw error
    })

  return registration
}

defineBitratePlayer().catch(() => {})
```

- `typeof customElements === 'undefined'` — resolves immediately under SSR, without ever
  importing the Svelte component module (dynamic import), so the module that throws in Node
  is simply never loaded there.
- `customElements.get(...)` — resolves immediately if the tag is already defined, so importing
  `@bitrate/player` twice (e.g. from two separate entry chunks in a bundler that does not
  dedupe) never throws `NotSupportedError` from a duplicate `define`.
- A shared in-flight `registration` promise — concurrent callers await the same dynamic
  import instead of each starting (and racing) their own; it is reset to `null` on failure so
  a later call can retry rather than being stuck rejected forever.
- A missing `.element` (the compiled component was never actually compiled with
  `customElement` enabled) and a failed dynamic import both **reject** the returned promise
  and `console.error` the failure — neither is swallowed silently.

Importing `@bitrate/player` registers the element as a side effect — that is the primary,
decided integration path; the side-effect call's own promise is caught with a no-op so a
failure there never surfaces as an unhandled rejection. `defineBitratePlayer()` is exported as
an **additional** option for a host that wants to control the timing of registration explicitly
(for example, deferring registration until after a feature flag resolves) or wants to await the
moment registration actually finishes; it is not a replacement for the side effect, and a host
does not need to call it for the default import to work. A host that only needs to *wait* for
registration — without triggering it — can use the platform's own
`customElements.whenDefined(BITRATE_PLAYER_TAG_NAME)` instead.

A dedicated `node` Vitest project (`src/**/*.node-spec.ts`, real Node — no DOM, no
`customElements`, unlike jsdom which partially implements the registry) proves this: it
imports the default and `/element` entries with no registry present and asserts neither
throws. Verify a future change to this mechanism the same way `svelte`'s docs are verified —
against the real Svelte 5 custom-element output, not against this description.

## Styling — CSS custom properties, not Tailwind

`packages/ui-react`'s Tailwind utility classes cannot reach into a shadow root — Tailwind's
generated stylesheet lives in the host document, and a shadow root's style encapsulation
blocks it by design. Design-token **custom properties** (`var(--color-foreground)`,
`var(--color-primary)`, …) do inherit through a shadow boundary, because CSS custom property
inheritance is unaffected by shadow DOM encapsulation. So this package styles with
`var(--color-*)` tokens in scoped `<style>` blocks and uses no Tailwind, no `cn()`, and no
CVA. `scripts/check-design-tokens.mjs` walks `packages/player/src` (including `.svelte`
files) and flags a literal hex colour there — not the stock-Tailwind-scale check the other
three roots get, since this package has no Tailwind utilities to check in the first place.

## Testing — the element is tested in the browser, not jsdom; SSR safety in real Node

Three Vitest projects: `unit` (jsdom) holds the engine and contract specs; `node` (plain Node,
no DOM, no `customElements` at all — unlike jsdom, which partially implements the registry)
proves the package is safe to import from a server bundle; `browser` (Chromium, via
`@vitest/browser-playwright`) holds the element specs. jsdom's shadow DOM and `<audio>`
support is not trustworthy enough to assert real custom-element behaviour against — the same
reasoning `packages/ui-react`'s `.screenshot-spec` project uses Chromium for visual assertions.
Suffixes: `*.unit-spec.ts` for `unit`, `*.node-spec.ts` for `node`, `*.browser-spec.ts` for
`browser`. `customElements.define` cannot be undone once called against a real registry, and
Vitest's browser provider gives each test *file* (not each test) its own iframe and its own
registry — split a real-registration test from a failure-path test into separate files rather
than fighting the shared registry within one.

## Type-checking — `svelte-check`, not `tsc --noEmit`

`svelte-check --tsconfig ./tsconfig.json` covers both `.ts` and `.svelte` files in one pass —
plain `tsc` cannot parse a `.svelte` file at all. A `.svelte` component with **no `<script>`
block** produces a broken virtual declaration for any `.ts` file that imports it (an
`implicitly has an 'any' type` error on the import, not on the component itself) — give every
`.svelte` file an explicit `<script lang="ts">` block, even an empty one, once it is imported
from a `.ts` file.

`check-types` runs `svelte-check` against `tsconfig.json` (`types: []`, spec/test files
excluded) **and** `tsc --noEmit` against `tsconfig.spec.json` (extends the root config,
overrides `types: ["node"]`, includes everything). The split exists so `src/engine/**` cannot
see `process`/`NodeJS.*` ambient globals — the engine must take everything by injection, per
"The engine takes an injected transport" below — while spec files, which do use `node:fs`,
`node:path`, `node:url`, still type-check. `moduleResolution: "Bundler"` (not `"Node"`) is
what every consuming bundler here actually uses (Next.js, Vite, Angular's esbuild builder);
none consumes this package via Node's own `NodeNext` resolution today, which is also why the
generated `.d.ts` re-exports (`export { ... } from './element'`) are left without explicit
`.js` extensions — `Bundler` resolution does not need them, and adding them would need
post-processing tooling `vite-plugin-dts` does not provide out of the box. Revisit if a
`NodeNext` consumer is ever added.

## Building — mirrors `packages/ui-react`, adds a Svelte compile step

`svelte.config.js` is the single source of `compilerOptions: { runes: true, customElement: true }`
for this package — `vite.config.ts` and `vitest.config.ts`'s `browser` project both call
`svelte()` bare and let `@sveltejs/vite-plugin-svelte` auto-load it, rather than repeating the
same object in three places. `runes: true` matters beyond style: without it, the compiler
defaults to **legacy mode**, and the compiled output imports `svelte/internal/flags/legacy` —
a real difference in the shipped bundle, not a lint nit. `customElement: true` is what makes
`<svelte:options customElement={{ ... }}>` compile to a custom element at all; the per-component
block says *how*, the global flag says *whether it's enabled for the project*, and setting only
one does nothing. `preserveModules` + `rollupOptions.external` for bare specifiers (as
`ui-react` does), and `vite-plugin-dts` for the three declaration entry points. Set
`build.lib.formats: ['es']` explicitly — leaving Vite to infer formats from a multi-entry
`lib.entry` object defaults to `['es', 'cjs']`, which produces CommonJS-shaped output
(`require`/`exports`) even when `rollupOptions.output.format` says `'es'`, and that output
breaks in a browser ESM context.

## ESLint — the second Biome exclusion, following the `apps/admin` precedent

Biome cannot lint `.svelte` templates. `biome.json`'s root `files.includes` excludes
`packages/player` (`!packages/player`) — the same mechanism used for `apps/admin` and
`apps/mobile`, not merely a linter-disabled `overrides` entry; see
`.claude/references/verification.md` § "Keeping Biome out of the ESLint apps takes `files.includes`,
not an override". `eslint-plugin-svelte` + `typescript-eslint` + `eslint-config-prettier` lint
this package instead; Prettier with `prettier-plugin-svelte` formats it.

## Commands

```bash
pnpm --filter @bitrate/player build
pnpm --filter @bitrate/player dev
pnpm --filter @bitrate/player lint
pnpm --filter @bitrate/player lint:fix
pnpm --filter @bitrate/player format
pnpm --filter @bitrate/player check-types    # svelte-check + tsc -p tsconfig.spec.json
pnpm --filter @bitrate/player test           # unit + node + browser
pnpm --filter @bitrate/player test:unit
pnpm --filter @bitrate/player test:node
pnpm --filter @bitrate/player test:browser
pnpm check:tokens                            # repo root; scans packages/player/src for hex
pnpm --filter @bitrate/player exec playwright install chromium   # once, for test:browser
```

## CI

`.github/workflows/player.yml` → `player_reusable.yml` runs each command above as its own job:
`lint`, `check-types`, `check:tokens`, `test:unit` + `test:node`, `test:browser` and `build`. It
is the only workflow that runs `check:tokens` on a player-only change. Root `pnpm test` would need
Chromium for this package, but no workflow runs it; the release cut's gates (`lint`,
`check-types`, `build`) need no browser. If one ever adds a root Vitest gate, it has to install
Chromium first.

## Related

- `svelte` skill — Svelte 5 runes and custom-element mode gotchas in depth.
- [ADR-0039](../../apps/docs/docs/architecture/0039-player-as-svelte-custom-element-package.md)
  — the package boundary, why Module Federation was ruled out, and the alternatives considered.
- `.claude/rules/typescript.md`, `.claude/rules/code-principles.md`, `.claude/references/verification.md`.
- `apps/docs/docs/brand/a11y.md` — the accessibility contract.
