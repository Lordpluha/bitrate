---
name: code-style
description: How to run and interpret the monorepo's mechanical gates — pnpm lint, pnpm format, pnpm check-types, pnpm knip — and how to fix common Biome/tsc violations. Use before any commit or PR, whenever lint/type-check/build fails, or whenever asked to "fix the lint errors", "why is check-types failing", or "clean up unused exports".
globs:
  - "**/*"
metadata:
  version: "1.0.0"
  type: reference
  author: lordpluha
license: MIT
---

# Code style — bitrate

Four CLI commands cover mechanical verification. Run from the monorepo root.

## The four commands

> **Two lint gates, not one.** `apps/admin` (Angular), `apps/mobile` (Expo), and
> `packages/player` (Svelte) run ESLint instead of Biome. Biome's language support is fixed at
> compile time and it cannot parse an Angular template's or a `.svelte` file's semantics;
> ESLint is the only linter that accepts a third-party parser, which is what
> `@angular-eslint/template-parser` and `eslint-plugin-svelte` are. Everything else in the
> monorepo is Biome. See [ADR-0035](../../apps/docs/docs/architecture/0035-admin-panel-on-angular.md),
> [ADR-0039](../../apps/docs/docs/architecture/0039-player-as-svelte-custom-element-package.md),
> `.claude/rules/admin-rules.md`, and `.claude/rules/player-rules.md`.

### Keeping Biome out of the ESLint apps takes `files.includes`, not an override

The root `biome.json` disables the linter and formatter for `apps/admin/**` and
`apps/mobile/**` through `overrides`. That is **not enough to stop Biome parsing those files**,
and the difference only shows up in the pre-commit hook: `biome check --staged` reported eight
`Text expressions aren't supported` parse errors the first time an Angular template containing
`{{ … }}` was staged, on a commit that changed no template syntax at all. Templates using only
attribute bindings had staged cleanly for months, which is why this sat unnoticed.

The exclusion that works is a root `files.includes`:

```jsonc
"files": {
  "ignoreUnknown": true,
  "includes": ["**", "!apps/admin", "!apps/mobile", "!packages/player"]
}
```

`packages/player` joined this exclusion the same way — `files.includes`, plus the same
`overrides` entry for belt-and-suspenders clarity — when it was added; see
`.claude/rules/player-rules.md`.

Declaring it has one knock-on effect worth knowing before you reach for it: every nested
workspace config whose own `files.includes` starts with `**` then trips
`lint/suspicious/noBiomeFirstException`, because two catch-alls in an extends chain are
ambiguous. Biome's own safe fix — dropping the redundant `**` from the nested config — is
correct and changes nothing: the four workspaces checked 530/101/604/376 files before and
after.

### Unhandled-promise rules — `noFloatingPromises` / `noMisusedPromises`

The root `biome.json`'s **top-level** `linter.rules.nursery` block enables
`noFloatingPromises` and `noMisusedPromises` for the whole monorepo (`apps/api`,
`apps/web-player`, `apps/web-artists`, `packages/ui-react`; `apps/admin` and `apps/mobile`
are already lint-disabled for Biome entirely). Three things about this configuration are not
obvious and have already caused real breakage once — read before touching it:

1. **These rules exist only at root, top-level.** They were verified, on the pinned Biome
   `2.5.0`, to produce **zero findings — silently — from every other placement**: a nested
   workspace `biome.json` (all of them declare `"root": false`) cannot enable a type-aware
   `nursery` rule regardless of whether it uses `extends`, and a root-level `overrides` entry
   scoping the rules to one workspace glob also produces zero findings. Only the root file's
   own top-level `linter.rules` block works, and it is inherited into every nested config
   automatically. **Do not "clean up" this by moving the two rules into `apps/api/biome.json`
   or into a root `overrides` block** — that exact refactor silently turns the check into a
   no-op that still reports `Checked N files. No fixes applied.` with a green exit code.
   Prove any future change to this still works by adding a file with a bare
   `asyncFn()` call with no `await`/`.catch`/`void`, running `biome lint` on it, and
   confirming it is reported — then delete the file.
2. **A nested workspace config CAN turn an inherited rule off** (`"nursery": {
   "noFloatingPromises": "off" }` in that workspace's own `biome.json`), even though it
   cannot turn one on. That is the only lever available if a workspace ever needs to opt out.
3. **These are `nursery` rules on a pinned exact Biome version (`2.5.0`)** — nursery rules
   have no stability guarantee and can change behaviour or be renamed on the next Biome
   bump. Re-verify both rules still fire as expected (per the bare-async-call check above)
   whenever Biome is upgraded, before trusting a green `pnpm lint`.

Fire-and-forget promises the rule genuinely can't distinguish from a real bug (e.g. a
`Promise<T> | null` singleton tested for `null` with a plain `if (x)`, not a truthiness
check on `x`'s resolved value) get a one-line `// biome-ignore lint/nursery/noMisusedPromises:
<reason>` at the call site, not a rule-level suppression — see the `biome` skill.

**These rules are expensive — budget for it.** They turn on Biome's type-inference scanner,
which is why lint went from milliseconds to seconds. Measured on Biome `2.5.0` against
`apps/web-player/src` (588 files), rules off vs on:

| | peak RSS | wall |
|---|---|---|
| off | 80 MB | 0.13 s |
| on | 1.34 GB | 6 s |

That is ~17x the memory and ~46x the time. It is affordable — CI's own
`biome ci apps/api packages/ui-react packages/contracts` (912 files) peaks at ~1.2 GB in 7 s,
and a root `pnpm lint` across all six workspaces finishes in ~14 s — but the headroom is no
longer generous. Do not run a full `pnpm lint` concurrently with a heavy test suite on a
memory-constrained machine; the linter is the first thing the OOM killer takes, and it dies
with a bare exit code `137` that looks nothing like a lint failure.

### `pnpm lint`

Runs `biome lint --error-on-warnings` in `api`, `web-player`, `web-artists`, and `ui-react`
(plus `expo lint` in `mobile`).

- **PASS** — exits 0, no diagnostics.
- **FAIL** — exits non-zero; violations printed with file:line. Fix every one before committing.

**`pnpm lint` never modifies a file.** `--error-on-warnings` is what makes it a real gate:
most `recommended` rules report at warning severity, and without the flag Biome prints them
and still exits 0. To apply autofixes, run the opt-in mutating form instead:

```bash
pnpm --filter @bitrate/web-player lint:fix   # biome lint --write
```

Common fixes:
- `noUnusedVariables` — remove unused imports/vars.
- `noExplicitAny` — replace `any` with a proper type or `unknown`.
- Import organisation — Biome auto-fixes with `biome check --write`.

### `biome ci` — what CI actually runs, and why local green is not enough

The per-app workflows do **not** run `pnpm lint`. They run:

```bash
pnpm exec biome ci apps/<app> packages/ui-react packages/contracts
```

`biome ci` is lint **and** format **and** the assist actions. This repo turns
`assist.actions.source.organizeImports` on per app, and neither `pnpm lint`
(`biome lint`) nor `pnpm format` (`biome format --write`) applies or checks assists. So a
branch where both pass locally still fails CI on unsorted imports — and the diagnostic points at
the import block, which reads like a formatting nit rather than a red build.

Before pushing, run the mutating form that covers all three:

```bash
pnpm exec biome check --write .
```

then confirm with the exact command CI uses. `check --write` applies only safe fixes; anything
it leaves behind is a real decision for you.

### `pnpm format`

Runs `biome format --write` — applies formatting in place. Run before committing to avoid CI failures.

Config: `biome.json` at repo root — 2-space indent, single quotes, no semicolons, trailing commas, 100-char line width.

### `pnpm check-types`

Runs `tsc --noEmit` (via Turborepo) in every workspace that declares the script: `api`,
`desktop`, `mobile`, `docs`, `web-player`, `web-artists`, `ui-react`, `contracts`,
`ncs-parser`. `player` also declares the script but runs `svelte-check` instead of plain
`tsc`, because `.svelte` files need Svelte's own type-checker. Each uses its own
`tsconfig.json`:

- `apps/api` — `strictNullChecks: true`, `noUncheckedIndexedAccess: true` (no `noImplicitAny`)
- `apps/web-player` — `strict: true`, `noUncheckedIndexedAccess: true`

The task declares `dependsOn: ["^build"]`, so `@bitrate/ui-react` is built first — the web
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
pnpm --filter @bitrate/api exec biome lint src/

# Type-check only web-player
pnpm --filter @bitrate/web-player check-types
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

## Parallel review pass — and the memory budget it has to fit in

Lint, type checking, and Knip are independent and *may* run in parallel. Package tests can run
alongside them when they do not share mutable infrastructure. But parallelism here is bounded by
RAM, not by cores, and overrunning it does not look like a resource problem — it looks like a
broken toolchain.

**Measure the scope before you widen it.** The numbers that matter are already known:
`pnpm lint` peaks at ~1.34 GB per workspace because the unhandled-promise nursery rules turn on
Biome's type-inference scanner (see above), and a full root `pnpm lint` walks six workspaces. Jest
defaults to one worker per core minus one, and each API worker loads ts-jest plus a Nest module
graph. Turborepo runs up to 10 tasks at once by default. Multiply those together on a developer
laptop and the OOM killer takes whichever process is largest — usually the linter, which then dies
with a bare exit code `137` that resembles nothing in Biome's output.

**Hold a reserve of 10-15% of total RAM at all times.** That is the hard floor, not a target to
spend down to: before starting anything heavy, check what is actually free, and if the command
would eat into the reserve, narrow it or run it after the current one finishes rather than beside
it.

```bash
awk '/MemTotal|MemAvailable/ {printf "%-14s %7.2f GiB\n", $1, $2/1048576}' /proc/meminfo
free -m | awk '/^Mem:/ {printf "available %d MiB = %.0f%% of total\n", $7, $7*100/$2}'
```

Two things that rule depends on:

- **`MemAvailable` is the number, not `free`.** Page cache counts as reclaimable and shows up as
  used; a machine reporting 1.5 GiB free and 8 GiB available has 8 GiB.
- **Swap is not headroom.** A run that "fits" only because pages spill to swap has already lost —
  the build finishes minutes later and everything else on the machine crawls. Check swap
  occupancy too: if it is already high, the reserve is thinner than `MemAvailable` suggests,
  because the kernel has been evicting under pressure for a while.

### Hard limits for agent runs

The reserve above was not enough on its own: on 2026-09-17 parallel agents each checked
`MemAvailable`, each saw 20-30 %, and together they drove the machine into sustained swapping (swap 99 % full) and took the Claude Code
process down with them. Agents therefore work to stricter numbers than a human at a terminal:

| Check before a heavy command | Limit |
|---|---|
| `MemAvailable` | **≥ 25 %** of total, or wait |
| Active swapping — `vmstat 1 5`, columns `si`/`so` | **0 in most samples**. Sustained non-zero means the kernel is paging under pressure right now: single spec files only — no build, no full suite, no Angular test run. Swap *occupancy* alone is not the signal: pages stay in swap long after RAM frees up, so "swap 65 % full" with `si`/`so` at 0 is a quiet machine |
| Other heavy commands running (`pgrep -af 'jest\|vitest\|svelte-check\|tsc \|ng (test\|build)\|nest build\|biome (check\|ci\|lint)\|prisma (generate\|migrate)\|playwright test\|knip'`) | **none**; wait for them |
| Node heap | `NODE_OPTIONS=--max-old-space-size=2048` on jest, tsc, `prisma generate` and the Angular builder |
| A server an agent starts (e.g. an API instance for contract generation) | always under `timeout 300`, killed by PID, and `pgrep` confirms it is gone before the report |

An orchestrating session runs **at most one verification-heavy agent at a time**. Read-only agents
(planning, review without test runs) may run beside it; two implementation agents may not, even in
unrelated directories — their builds and test runs land on the same RAM.

Rules that keep a verification pass inside the budget:

- **Narrow before you parallelise.** `pnpm --filter @bitrate/api test` beats `pnpm test`, and a
  single spec file beats the package. Run the exact file the change touches first; widen only
  once it is green.
- **For Biome, narrow the workspace, not the file list.** The type scanner walks the whole
  project graph regardless of which paths you name, so passing six files changes nothing.
  Measured on this repo: `pnpm exec biome check --write <six changed files>` from the root dies
  with `Linter process terminated abnormally (possibly out of memory)`, while
  `pnpm --filter @bitrate/api exec biome check --write src test` checks 522 files in 5 s. Always
  reach for Biome through the workspace filter; a root invocation scopes the scanner to all six
  workspaces at once.
- **Never run a full `pnpm lint` concurrently with a test suite.** Sequence them with `&&`.
  Two commands that each fit in memory do not necessarily fit together.
- **Bound the runners explicitly when anything else heavy is running.** `jest --runInBand` (or
  `--maxWorkers=2`), `vitest --no-file-parallelism`, `turbo --concurrency=2`. A serial run that
  finishes is faster than a parallel one that gets killed and rerun.
- **Read exit code `137` as "out of memory", not as a tool failure.** Do not re-run it hoping for
  a different answer, and never report it as a lint or test failure — say the process was killed
  and rerun it narrower.
- **Cap the heap when a single Node process is the problem**, not the fan-out:
  `NODE_OPTIONS=--max-old-space-size=2048`. Raising it is rarely the fix; shrinking the scope is.

This applies to agents as much as to humans: an agent that fires a repo-wide lint, a full test
suite, and a build in one turn is the most reliable way to produce an unexplainable `137` in a
session with no other symptom.
