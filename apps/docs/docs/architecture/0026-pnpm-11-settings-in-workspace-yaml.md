# ADR-0026: pnpm 11 and `pnpm-workspace.yaml` as the only home for pnpm settings

Status: Accepted

Date: 2026-09-03

## Context

The repository was pinned to `pnpm@10.30.3`, the baseline
[ADR-0001](0001-monorepo-build-runtime.md) recorded. Two unrelated things made that pin worth
revisiting.

**The pin had quietly forked into three values.** `package.json`, the `setup-node-pnpm`
composite action, and `apps/mobile/Dockerfile` said `10.30.3`; the other six Dockerfiles and
`Dockerfile.vnc` said `10.27.0`. Containers were therefore built by a different package manager
than local development and CI used, and nothing failed loudly enough for anyone to notice.

**A cosmetic symptom turned out to be cosmetic.** Every `pnpm i` printed a constant
`Packages: -376`. It deleted nothing: snapshotting all 2543 installed `package.json` paths
before and after an install produced identical sets, and the 376 paths — visible through
`pnpm i --reporter=ndjson` as `pnpm:removal` events — were optional dependencies for other
platforms (`lefthook-darwin-arm64`, `@turbo/windows-64`, `@img/sharp-*`, `fsevents`) that had
never existed on a linux-x64 machine. pnpm 10 re-issued a no-op removal for each skipped
optional on every install and counted it. The upstream report
([pnpm#8871](https://github.com/pnpm/pnpm/issues/8871)) is still open.

**pnpm 11 moves where settings live, and the failure mode is silence.** It reads only auth and
registry settings from `.npmrc`, and it ignores the `pnpm` block in `package.json` entirely —
no warning, no deprecation notice ([pnpm#11536](https://github.com/pnpm/pnpm/issues/11536)).
This repository kept `overrides`, `onlyBuiltDependencies`, and `peerDependencyRules` in
`package.json`, and `nodeLinker`, `autoInstallPeers`, and three `public-hoist-pattern` entries
in `.npmrc`. A version bump alone would have dropped all of them without a single error: React
versions would have drifted across the monorepo, and Expo's Metro resolution would have broken.

## Decision

Move to `pnpm@11.25.0` — the `latest` dist-tag — and make `pnpm-workspace.yaml` the single
source for every pnpm setting. `.npmrc` is deleted rather than emptied; all six of its settings
were functional and none were auth or registry.

`onlyBuiltDependencies` does not exist in pnpm 11. It was removed along with
`neverBuiltDependencies`, `ignoredBuiltDependencies`, and `onlyBuiltDependenciesFile`, and
replaced by `allowBuilds`, a map of package name to boolean. All eighteen entries carry over as
`true`. They are not regenerated with `pnpm approve-builds`, which only approves packages that
ship a build script *today* and would have silently dropped `@nestjs/core`, `@parcel/watcher`,
and `aws-sdk` from the policy — re-blocking them the moment a future version added one.

One version is pinned in one place per surface and they agree: `package.json`, the
`setup-node-pnpm` composite action that all twelve reusable workflows go through, and all eight
Dockerfiles. `turbo.json`'s `globalDependencies` points at `pnpm-workspace.yaml` instead of the
deleted `.npmrc`, because that file now holds `overrides` and `allowBuilds` and a cache served
across a change to either would be wrong.

This supersedes the runtime-baseline bullet of [ADR-0001](0001-monorepo-build-runtime.md).
That ADR's decision — Turborepo for orchestration, pnpm workspaces for installation — is
unchanged; only the pinned versions in it are.

## Consequences

- **A pnpm setting added to `package.json` or `.npmrc` will appear to work and do nothing.**
  This is the cost of the move and it has no mechanical guard. `.claude/rules/monorepo.md` is
  the working reference; this ADR is the reason.
- `pnpm i` on an unchanged tree now reports `Already up to date` in roughly 0.3 seconds instead
  of 3.6 seconds with a phantom `-376`. The symptom that prompted the work is gone, even though
  the upstream issue is not closed.
- **The first install after this change purges `node_modules`** — pnpm 11 raised the store
  version — and aborts with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR` in any non-TTY context. CI is
  unaffected, since runners start empty and set `CI`. A developer installing from a script will
  hit it.
- **pnpm 11 no longer prints peer-dependency warnings at all.** Verified by deleting
  `peerDependencyRules` entirely and observing no change in output. The rules are kept because
  they still state the intended policy, but their effect is no longer observable, and the three
  genuinely unmet peers are now recorded only in `.claude/rules/monorepo.md`. A silent install
  is not evidence that the peer situation was fixed.
- pnpm 11 requires Node `>=22.13`. The repository already requires `>=24`, so this constrains
  nothing today, but it rules out the Node 20 that some local environments still default to.
- Re-resolving under pnpm 11 reproduced a byte-identical `pnpm-lock.yaml` at `lockfileVersion:
  '9.0'`, and a forced, uncached build, typecheck, and lint passed 16 of 16.
- The eight Dockerfile edits are verified by reading only. `docker` is host-only under the
  VS Code Flatpak sandbox, so the first real check is a CI run or a host-side `task dev:up`.

## Alternatives considered

- **Stay on `pnpm@10.30.3`** — rejected. The phantom count alone would not have justified a
  migration, but the three-way version drift between local, CI, and containers was a real
  correctness problem that a pin bump had to fix anyway.
- **Go to `pnpm@12.3.1`** — rejected. pnpm 12 is a rewrite in Rust released eight days earlier;
  pnpm had not moved the `latest` dist-tag to it, and eighteen `install` flags were removed
  without appearing in its breaking-change notes
  ([pnpm#14281](https://github.com/pnpm/pnpm/issues/14281)). The settings relocation done here
  is a prerequisite for that move whenever it happens, and pnpm 12 keeps pnpm 11's lockfile
  format and commands.
- **Bump the version without relocating the settings** — rejected. This is the failure this ADR
  exists to prevent: it produces a green install with `overrides` and `allowBuilds` silently
  inert.
- **Switch `nodeLinker` away from `hoisted` to avoid the phantom count** — rejected. `hoisted`
  is load-bearing for `apps/mobile`; Metro's module resolution depends on it and on the three
  `publicHoistPattern` entries.
