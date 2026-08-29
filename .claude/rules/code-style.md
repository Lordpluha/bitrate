---
name: code-style
description: How to run and interpret the monorepo's mechanical gates — pnpm lint, pnpm format, pnpm check-types, pnpm knip — and how to fix common Biome/tsc violations. Use before any commit or PR, whenever lint/type-check/build fails, or whenever asked to "fix the lint errors", "why is check-types failing", or "clean up unused exports".
metadata:
  version: "1.0.0"
  type: reference
  author: lordpluha
license: MIT
---

# Code style — spotify-clone

Four CLI commands cover mechanical verification. Run from the monorepo root.

## The four commands

### `pnpm lint`

Runs `biome lint --error-on-warnings` in `api`, `web-player`, `web-artists`, and `ui-react`
(plus `expo lint` in `mobile`).

- **PASS** — exits 0, no diagnostics.
- **FAIL** — exits non-zero; violations printed with file:line. Fix every one before committing.

**`pnpm lint` never modifies a file.** `--error-on-warnings` is what makes it a real gate:
most `recommended` rules report at warning severity, and without the flag Biome prints them
and still exits 0. To apply autofixes, run the opt-in mutating form instead:

```bash
pnpm --filter @spotify/web-player lint:fix   # biome lint --write
```

Common fixes:
- `noUnusedVariables` — remove unused imports/vars.
- `noExplicitAny` — replace `any` with a proper type or `unknown`.
- Import organisation — Biome auto-fixes with `biome check --write`.

### `pnpm format`

Runs `biome format --write` — applies formatting in place. Run before committing to avoid CI failures.

Config: `biome.json` at repo root — 2-space indent, single quotes, no semicolons, trailing commas, 100-char line width.

### `pnpm check-types`

Runs `tsc --noEmit` (via Turborepo) in every workspace that declares the script: `api`,
`admin`, `desktop`, `mobile`, `docs`, `web-player`, `web-artists`, `ui-react`, `contracts`,
`ncs-parser`. Each uses its own `tsconfig.json`:

- `apps/api` — `strictNullChecks: true`, `noUncheckedIndexedAccess: true` (no `noImplicitAny`)
- `apps/web-player` — `strict: true`, `noUncheckedIndexedAccess: true`

The task declares `dependsOn: ["^build"]`, so `@spotify/ui-react` is built first — the web
apps typecheck against its emitted `dist/types`, not its `src/`. `apps/api` regenerates the
Prisma client first via `precheck-types`.

**PASS** — exits 0, no output.
**FAIL** — exits non-zero; compiler errors printed. Fix every error; never weaken `tsconfig.json` to silence errors.

### `pnpm knip`

Detects unused files, exports, and package dependencies. Run it when changing barrels, module structure, or dependencies.

- New unused exports/files are findings.
- Generated/framework entry points may require explicit Knip exclusions.
- Verify indirect build/peer dependencies before removing them.

## Fixing a Biome violation

```bash
# Auto-fix safe issues in a specific file
pnpm exec biome check --write apps/api/src/modules/tracks/tracks.service.ts

# Auto-fix all safe issues
pnpm exec biome check --write .
```

`--write` applies only **safe** fixes. Unsafe changes require manual intervention.

## Per-app commands

```bash
# Lint only the API
pnpm --filter @spotify/api exec biome lint src/

# Type-check only web-player
pnpm --filter @spotify/web-player check-types
```

## Common tsc errors in the API

- `Parameter 'x' implicitly has an 'any' type` — add explicit type annotation.
- `Object is possibly 'undefined'` — guard with `if (x)` or use `??`. `noUncheckedIndexedAccess` means array subscripts return `T | undefined`.

## Before committing

Always run:
```bash
pnpm lint && pnpm check-types
```

Zero errors is the baseline. A commit with linting or type errors will fail CI.

## Parallel review pass

Lint, type checking, and Knip are independent and may run in parallel. Package tests can run alongside them when they do not share mutable infrastructure.
