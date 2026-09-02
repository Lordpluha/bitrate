---
name: turborepo
description: Turborepo pipeline conventions for this monorepo — the task graph in turbo.json, dependsOn and ^build semantics, caching and why a task misses cache, filtering with --filter, and adding a package to the graph. Use when adding a workspace, changing turbo.json, or when a build runs in the wrong order, rebuilds every time, or uses a stale artifact.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Turborepo — the task graph

`turbo.json` defines how tasks run across workspaces. Tasks declared: `build`, `lint`,
`test`, `format`, `check-types`, `dev`. `.claude/rules/monorepo.md` owns the workspace
topology; this skill covers the pipeline mechanics.

## `dependsOn` — the two forms

```jsonc
"build": { "dependsOn": ["^build"] }   // ^ = build DEPENDENCIES first, then me
"test":  { "dependsOn": ["build"] }    // no ^ = my OWN build first
```

`^build` is what makes `@bitrate/ui-react` build before `@bitrate/web-player`. Getting this
wrong is the usual cause of "it works after I build twice" — the consumer compiled against
the previous artifact.

**Never add a manual pre-build script** (`"build": "pnpm --filter dep build && tsc"`) to work
around ordering. That defeats caching and parallelism; fix `dependsOn` instead.

## Caching — and why it misses

Turbo hashes each task's inputs (source files, dependencies, env vars, the task config) and
replays the cached output when the hash matches. A task that always re-runs has an input
that always changes.

```jsonc
"build": {
  "dependsOn": ["^build"],
  "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
  "env": ["NEXT_PUBLIC_*"]        // env vars that affect the OUTPUT must be declared
}
```

- **Missing `outputs`** → nothing is cached to restore, so the task re-runs and downstream
  consumers get nothing.
- **Undeclared `env`** → an env var that changes the build is not in the hash, so turbo
  restores a cache built with a *different* value. This is the dangerous direction: silently
  wrong output rather than a slow build.
- **A task with no meaningful output** (`lint`, `check-types`) still caches its
  success/failure — that is the point, and `"outputs": []` is correct for it.
- `"cache": false` belongs on `dev` and anything genuinely non-deterministic, nowhere else.

Debug with `turbo run build --dry=json` (what would run, and why) and `--summarize` (hash
inputs per task).

## Filtering

```bash
pnpm --filter @bitrate/api build          # one workspace
pnpm --filter @bitrate/web-player...      # it and everything it depends on
pnpm --filter ...@bitrate/ui-react        # it and everything that depends on it
pnpm --filter './packages/*' lint         # by path glob
```

The `...` direction matters: `pkg...` is *dependencies*, `...pkg` is *dependents*. Use
`...@bitrate/ui-react` to check what a shared-package change could break.

## Adding a workspace to the graph

1. `packages/<name>/package.json` with `"name": "@bitrate/<name>"`.
2. Add it to `pnpm-workspace.yaml`.
3. Add a `tsconfig.json`.
4. If it has a `build`, make sure its outputs are declared so consumers can cache.
5. `pnpm install` to link it.

Consumers import by workspace name (`@bitrate/contracts`), never a relative path across
package boundaries.

## Gotchas

- **`dev` must not be cached** and must not be part of a `dependsOn` chain — it never exits.
- **A task that does not exist in a workspace is skipped, not an error.** `pnpm lint` passing
  can mean "linted nothing" — check the workspace actually has the script.
- **CI and local caches differ.** A green local build on a warm cache proves less than a cold
  one; `turbo run build --force` bypasses cache when you need certainty.
- **The lefthook `pre-push` hook runs a full `turbo run build`.** `WEB_ONLY=true git push`
  narrows it; `LEFTHOOK=0` skips it and means CI is your only gate.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/turbo` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('turbo/package.json').version"
   ```
2. **Then the official docs:** https://turborepo.com/docs — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because `pipeline` was renamed to `tasks` in turbo 2.

## Related

- `.claude/rules/monorepo.md` — topology, root scripts, asset generation pipelines.
- `.claude/rules/code-style.md` — the mechanical pass these tasks back.
- `changesets` skill — versioning across the same workspace graph.
